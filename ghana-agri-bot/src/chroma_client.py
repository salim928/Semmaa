from typing import Optional
import chromadb
from chromadb.config import Settings
from src.project_paths import chroma_dir

DEFAULT_COLLECTION = "ghana_agriculture"

def get_client():
    base = chroma_dir()
    base.mkdir(parents=True, exist_ok=True)
    if hasattr(chromadb, "PersistentClient"):
        return chromadb.PersistentClient(path=str(base))
    return chromadb.Client(Settings(persist_directory=str(base), anonymized_telemetry=False))

def get_collection(name: Optional[str] = None):
    client = get_client()
    return client.get_or_create_collection(name=name or DEFAULT_COLLECTION, metadata={"hnsw:space": "cosine"})