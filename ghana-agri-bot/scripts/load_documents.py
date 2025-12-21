# Load agricultural documents
"""
Document Loader Script
Purpose: Load agricultural PDFs and text files into the knowledge base
"""

# Add project root for imports
import sys, json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.knowledge_base import KnowledgeBase

DOCUMENTS_DIR = ROOT / "data" / "documents"
BATCH_SIZE = 1000  # tune as RAM allows

def chunk_text(text: str, max_chars: int = 1600):
    for i in range(0, len(text), max_chars):
        yield text[i:i + max_chars]

def extract_metadata(content: str, filename: str) -> dict:
    meta = {"source": filename}
    low = content.lower()
    for crop in ("maize", "cassava", "tomato", "cocoa", "rice", "yam"):
        if crop in low:
            meta["crop"] = crop
            break
    return meta

def load_text(p: Path) -> str:
    return p.read_text(encoding="utf-8", errors="ignore")

def load_documents():
    kb = KnowledgeBase()
    print("\nDocument Loader for Ghana Agricultural Bot")
    print("==================================================")
    print(f"📚 Loading documents into knowledge base...\nLooking in: {DOCUMENTS_DIR}")

    supported = {".txt", ".json"}
    for file_path in DOCUMENTS_DIR.rglob("*"):
        if file_path.suffix.lower() not in supported:
            continue

        print(f"\n📄 Processing: {file_path.relative_to(DOCUMENTS_DIR)}")
        if file_path.suffix.lower() == ".json":
            data = json.loads(load_text(file_path))
            docs = data.get("documents", [])
            for di, doc in enumerate(docs):
                doc_id = doc.get("id", f"{file_path.stem}_{di}")
                text = doc.get("content", "")
                metadata = doc.get("metadata", {"source": file_path.name})
                chunks = list(chunk_text(text))
                ids = [f"{doc_id}_c{i}" for i in range(len(chunks))]
                metas = [metadata] * len(chunks)
                for off in range(0, len(ids), BATCH_SIZE):
                    kb.add_documents_batch(ids[off:off+BATCH_SIZE], chunks[off:off+BATCH_SIZE], metas[off:off+BATCH_SIZE])
                    print(f"  Added batch up to chunk {off + len(ids[off:off+BATCH_SIZE])}")
            continue

        content = load_text(file_path)
        if not content.strip():
            print("  Skipped (empty)")
            continue

        metadata = extract_metadata(content, file_path.name)
        chunks = list(chunk_text(content))
        ids = [f"{file_path.stem}_c{i}" for i in range(len(chunks))]
        metas = [metadata] * len(chunks)
        for off in range(0, len(ids), BATCH_SIZE):
            kb.add_documents_batch(ids[off:off+BATCH_SIZE], chunks[off:off+BATCH_SIZE], metas[off:off+BATCH_SIZE])
            if off % (BATCH_SIZE * 5) == 0:
                print(f"  Added batch up to chunk {off + len(ids[off:off+BATCH_SIZE])}")

if __name__ == "__main__":
    load_documents()