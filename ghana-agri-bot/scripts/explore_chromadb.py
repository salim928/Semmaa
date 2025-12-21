"""
Explore ChromaDB Contents
See what's in your knowledge base
"""

# Add project root to sys.path
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.chroma_client import get_collection
from src.project_paths import chroma_dir

def explore_chromadb():
    base = chroma_dir()
    col = get_collection("ghana_agriculture")

    print("🔍 Exploring ChromaDB Knowledge Base")
    print("==================================================")
    try:
        count = col.count() if hasattr(col, "count") else len(col.get().get("ids", []))
        print(f"Collection: ghana_agriculture")
        print(f"Persist dir: {base}")
        print(f"Documents: {count}")

        res = col.query(query_texts=["maize fertilizer guidelines"], n_results=5, include=["metadatas", "documents"])
        docs = res.get("documents", [[]])
        metas = res.get("metadatas", [[]])
        n = min(5, len(docs[0]) if docs and docs[0] else 0)
        if n == 0:
            print("No results for sample query.")
            return
        print("\nTop results:")
        for i in range(n):
            meta = metas[0][i] or {}
            print(f"- #{i+1}: crop={meta.get('crop')} source={meta.get('source')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    explore_chromadb()