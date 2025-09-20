"""
Explore ChromaDB Contents
See what's in your knowledge base
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

import chromadb
from config.settings import CHROMA_PERSIST_DIR, COLLECTION_NAME
import json

def explore_chromadb():
    """Explore ChromaDB contents"""
    
    print("🔍 Exploring ChromaDB Knowledge Base")
    print("=" * 50)
    
    # Connect to ChromaDB
    client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
    
    # Get collection
    try:
        collection = client.get_collection(name=COLLECTION_NAME)
        print(f"✅ Connected to collection: {COLLECTION_NAME}")
    except:
        print(f"❌ Collection {COLLECTION_NAME} not found")
        return
    
    # Get collection stats
    count = collection.count()
    print(f"\n📊 Total documents: {count}")
    
    # Get all documents (careful with large collections)
    if count > 0:
        results = collection.get(limit=min(count, 100))  # Limit to 100 for display
        
        print(f"\n📚 Showing first {min(count, 10)} documents:\n")
        
        for i in range(min(10, len(results['documents']))):
            doc = results['documents'][i]
            metadata = results['metadatas'][i] if results['metadatas'] else {}
            doc_id = results['ids'][i]
            
            print(f"Document {i+1} (ID: {doc_id[:20]}...):")
            print(f"  Content: {doc[:150]}...")
            print(f"  Metadata: {metadata}")
            print("-" * 40)
    
    # Show document categories
    print("\n📁 Document Categories:")
    categories = {}
    
    if count > 0:
        all_metadata = collection.get(limit=count)['metadatas']
        for metadata in all_metadata:
            if metadata:
                topic = metadata.get('topic', 'unknown')
                source = metadata.get('source', 'unknown')
                
                if source not in categories:
                    categories[source] = []
                categories[source].append(topic)
    
    for source, topics in categories.items():
        print(f"\n  {source}:")
        unique_topics = list(set(topics))
        for topic in unique_topics[:5]:  # Show first 5 topics
            print(f"    - {topic}")
    
    # Test search
    print("\n🧪 Testing Search Capability:")
    test_queries = [
        "satellite NDVI",
        "maize planting",
        "fertilizer application",
        "pest control"
    ]
    
    for query in test_queries:
        results = collection.query(
            query_texts=[query],
            n_results=1
        )
        
        if results['documents'][0]:
            print(f"\n  Query: '{query}'")
            print(f"  Found: {results['documents'][0][0][:100]}...")
    
    print("\n✨ ChromaDB exploration complete!")

def export_chromadb_to_json():
    """Export ChromaDB to JSON for backup"""
    
    client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
    collection = client.get_collection(name=COLLECTION_NAME)
    
    # Get all documents
    count = collection.count()
    if count > 0:
        results = collection.get(limit=count)
        
        export_data = {
            'collection_name': COLLECTION_NAME,
            'document_count': count,
            'documents': []
        }
        
        for i in range(len(results['ids'])):
            export_data['documents'].append({
                'id': results['ids'][i],
                'content': results['documents'][i],
                'metadata': results['metadatas'][i] if results['metadatas'] else {}
            })
        
        # Save to file
        export_file = Path('data/chromadb_export.json')
        with open(export_file, 'w') as f:
            json.dump(export_data, f, indent=2)
        
        print(f"✅ Exported {count} documents to {export_file}")

if __name__ == "__main__":
    explore_chromadb()
    
    print("\n" + "=" * 50)
    export_choice = input("\n💾 Export database to JSON? (y/n): ")
    if export_choice.lower() == 'y':
        export_chromadb_to_json()