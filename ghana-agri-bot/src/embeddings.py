import sqlite3
import hashlib
from pathlib import Path
from typing import List, Optional

import numpy as np
from sentence_transformers import SentenceTransformer


class EmbeddingService:
    """
    Batched, cached embeddings using SentenceTransformer and SQLite.
    """
    def __init__(
        self,
        model_name: str = "sentence-transformers/all-MiniLM-L6-v2",
        device: Optional[str] = None,
        cache_path: Optional[Path] = None,
    ):
        self.model = SentenceTransformer(model_name, device=device)
        base_cache = Path(__file__).resolve().parents[1] / "data" / "processed" / "emb_cache.sqlite3"
        self.cache_path = Path(cache_path) if cache_path else base_cache
        self.cache_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _init_db(self):
        con = sqlite3.connect(self.cache_path)
        try:
            con.execute(
                "CREATE TABLE IF NOT EXISTS embeddings ("
                " key TEXT PRIMARY KEY,"
                " dim INTEGER NOT NULL,"
                " vec BLOB NOT NULL)"
            )
            con.execute("CREATE INDEX IF NOT EXISTS idx_embeddings_dim ON embeddings(dim)")
            con.commit()
        finally:
            con.close()

    @staticmethod
    def _key(text: str) -> str:
        return hashlib.sha256(text.encode("utf-8", errors="ignore")).hexdigest()

    def _get_cached(self, keys: List[str]) -> dict:
        if not keys:
            return {}
        con = sqlite3.connect(self.cache_path)
        try:
            qmarks = ",".join("?" for _ in keys)
            rows = con.execute(
                f"SELECT key, dim, vec FROM embeddings WHERE key IN ({qmarks})",
                keys,
            ).fetchall()
            out = {}
            for k, dim, blob in rows:
                arr = np.frombuffer(blob, dtype=np.float32)
                if dim and arr.size == dim:
                    out[k] = arr
            return out
        finally:
            con.close()

    def _set_cached(self, items: List[tuple]):
        if not items:
            return
        con = sqlite3.connect(self.cache_path)
        try:
            con.executemany(
                "INSERT OR REPLACE INTO embeddings(key, dim, vec) VALUES(?,?,?)",
                items,
            )
            con.commit()
        finally:
            con.close()

    def encode_batch(self, texts: List[str], batch_size: int = 128, normalize: bool = True) -> List[List[float]]:
        keys = [self._key(t) for t in texts]
        cached = self._get_cached(keys)

        missing_idx = [i for i, k in enumerate(keys) if k not in cached]
        if missing_idx:
            missing_texts = [texts[i] for i in missing_idx]
            arr = self.model.encode(
                missing_texts,
                batch_size=batch_size,
                convert_to_numpy=True,
                normalize_embeddings=normalize,
                show_progress_bar=False,
            ).astype(np.float32)
            to_store = []
            for i, vec in zip(missing_idx, arr):
                k = keys[i]
                to_store.append((k, vec.shape[0], vec.tobytes()))
                cached[k] = vec
            self._set_cached(to_store)

        return [cached[k].tolist() for k in keys]