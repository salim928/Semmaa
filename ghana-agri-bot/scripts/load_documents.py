# Load agricultural documents
"""
Document Loader Script
Purpose: Load agricultural PDFs and text files into the knowledge base
"""

import os
import sys
from pathlib import Path
import json
import re

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from src.knowledge_base import KnowledgeBase
from config.settings import DOCUMENTS_DIR

def load_text_file(file_path: Path) -> str:
    """Load content from text file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()

def load_pdf_file(file_path: Path) -> str:
    """Load content from PDF file"""
    try:
        import pypdf
        reader = pypdf.PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text
    except ImportError:
        print("pypdf is not installed. Skipping PDF files.")
        return ""
    except Exception as e:
        print(f"Error loading PDF {file_path}: {e}")
        return ""

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50):
    """
    Generator that yields text chunks for embedding.
    """
    start = 0
    text_len = len(text)
    while start < text_len:
        end = start + chunk_size
        if end < text_len:
            sentence_end = text.rfind('.', start, end)
            if sentence_end > start:
                end = sentence_end + 1
        chunk = text[start:end].strip()
        if chunk:
            yield chunk
        start = end - overlap

def extract_metadata(text: str, file_name: str) -> dict:
    """Extract metadata from document content"""
    metadata = {
        "source": file_name
    }
    
    # Try to detect crop type
    crops = ["maize", "cocoa", "cassava", "tomato", "rice", "groundnut"]
    for crop in crops:
        if crop.lower() in text.lower():
            metadata["crop"] = crop
            break
    
    # Try to detect topic
    topics = {
        "planting": ["planting", "sowing", "spacing"],
        "fertilizer": ["fertilizer", "NPK", "urea", "nutrient"],
        "pest": ["pest", "insect", "armyworm", "borer"],
        "disease": ["disease", "fungus", "virus", "infection"],
        "harvest": ["harvest", "maturity", "yield"]
    }
    
    for topic, keywords in topics.items():
        if any(keyword.lower() in text.lower() for keyword in keywords):
            metadata["topic"] = topic
            break
    
    return metadata

BATCH_SIZE = 100  # Tune as needed

def load_documents():
    kb = KnowledgeBase()
    
    print("📚 Loading documents into knowledge base...")
    print(f"Looking in: {DOCUMENTS_DIR}")
    
    # Supported file extensions
    supported_extensions = ['.txt', '.pdf', '.json']
    
    documents_loaded = 0
    
    for file_path in Path(DOCUMENTS_DIR).glob("*"):
        if file_path.suffix.lower() not in supported_extensions:
            continue
        
        print(f"\n📄 Processing: {file_path.name}")
        
        # Load content based on file type
        if file_path.suffix.lower() == '.txt':
            content = load_text_file(file_path)
        elif file_path.suffix.lower() == '.pdf':
            content = load_pdf_file(file_path)
        elif file_path.suffix.lower() == '.json':
            # Handle JSON files with multiple documents
            with open(file_path, 'r') as f:
                data = json.load(f)
                if 'documents' in data:
                    for doc in data['documents']:
                        doc_id = doc.get('id', f"doc_{documents_loaded}")
                        text = doc.get('content', '')
                        metadata = doc.get('metadata', {})
                        
                        # Chunk and add to knowledge base
                        chunks = chunk_text(text)
                        for i, chunk in enumerate(chunks):
                            kb.add_document(
                                document_id=f"{doc_id}_chunk_{i}",
                                text=chunk,
                                metadata=metadata
                            )
                        documents_loaded += 1
                continue
        else:
            continue
        
        if not content.strip():
            print(f"  Skipped (empty or unreadable): {file_path.name}")
            continue
        
        # Extract metadata
        metadata = extract_metadata(content, file_path.name)
        
        # Chunk the content and add to knowledge base efficiently
        chunk_count = 0
        MAX_CHUNKS = 1000  # <-- Add this line to limit per document
        batch_ids, batch_texts, batch_metadatas = [], [], []
        for i, chunk in enumerate(chunk_text(content)):
            doc_id = f"{file_path.stem}_chunk_{i}"
            batch_ids.append(doc_id)
            batch_texts.append(chunk)
            batch_metadatas.append(metadata)
            if len(batch_ids) >= BATCH_SIZE:
                kb.add_documents_batch(batch_ids, batch_texts, batch_metadatas)
                print(f"  Added batch up to chunk {i}")
                batch_ids, batch_texts, batch_metadatas = [], [], []
        # Add any remaining chunks
        if batch_ids:
            kb.add_documents_batch(batch_ids, batch_texts, batch_metadatas)
            print(f"  Added final batch for {file_path.name}")
        
        documents_loaded += 1
    
    # Load web augmented snippets if available
    web_snippets_path = "data/documents/web_augmented_snippets.txt"
    trusted_domains = ["csir.org.gh", "mofa.gov.gh", "fao.org", "agra.org"]

    if os.path.exists(web_snippets_path):
        with open(web_snippets_path, "r", encoding="utf-8") as f:
            web_snippets = f.read().split("---\n")
            for snippet in web_snippets:
                if snippet.strip():
                    # Extract source line
                    source_line = next((line for line in snippet.splitlines() if line.startswith("Source: ")), "")
                    if any(domain in source_line for domain in trusted_domains):
                        kb.add_document(
                            document_id=f"web_snippet_{documents_loaded}",
                            text=snippet.strip(),
                            metadata={"source": "web_augmented"}
                        )
                        print(f"  Loaded web snippet {documents_loaded}")
                        documents_loaded += 1
    
    print(f"\n✅ Successfully loaded {documents_loaded} documents")
    
    # Test the knowledge base
    test_queries = [
        "When should I plant maize?",
        "How to control cocoa diseases?",
        "Fertilizer for cassava"
    ]
    
    print("\n🧪 Testing knowledge base with sample queries:")
    for query in test_queries:
        results = kb.search(query, n_results=1)
        if results:
            print(f"\nQuery: {query}")
            print(f"Found: {results[0]['text'][:100]}...")

def download_sample_documents():
    """Download sample agricultural documents"""
    print("\n📥 Creating sample documents...")
    
    # Sample document about maize farming
    maize_doc = """
    MAIZE PRODUCTION GUIDE FOR GHANA
    
    1. LAND PREPARATION
    Clear the land and plough to a depth of 15-20cm. In Ghana, land preparation 
    should be done 2-3 weeks before the onset of rains.
    
    2. PLANTING TIME
    Major season: Late March to April (Southern Ghana)
    Minor season: September to October
    Northern Ghana: May to June (single season)
    
    3. SEED RATE AND SPACING
    Use 20-25 kg/ha of certified seeds
    Spacing: 75cm between rows, 25cm between plants
    Plant 2-3 seeds per hole at 5cm depth
    
    4. FERTILIZER APPLICATION
    Basal application: Apply NPK 15-15-15 at 250 kg/ha during planting
    Top dressing: Apply Urea at 125 kg/ha, 4 weeks after planting
    
    5. WEED CONTROL
    First weeding: 2-3 weeks after planting
    Second weeding: 6-7 weeks after planting
    Can use pre-emergence herbicides like Atrazine
    
    6. PEST MANAGEMENT
    Fall Armyworm: Scout regularly, apply Emamectin benzoate at first sign
    Stem borers: Use Cypermethrin or Deltamethrin
    
    7. HARVEST
    Maturity: 90-120 days depending on variety
    Harvest when husks are dry and kernels are hard
    """
    
    # Save sample document
    sample_file = DOCUMENTS_DIR / "maize_production_guide.txt"
    with open(sample_file, 'w') as f:
        f.write(maize_doc)
    
    print(f"✓ Created sample document: {sample_file}")
    
    # Create a JSON document with multiple entries
    json_doc = {
        "documents": [
            {
                "id": "cocoa_1",
                "content": "Cocoa black pod disease is caused by Phytophthora species. Control with copper-based fungicides like Ridomil Plus 72WP or Nordox 75WP. Spray every 2-3 weeks during rainy season. Remove infected pods immediately and bury them away from the farm.",
                "metadata": {"crop": "cocoa", "topic": "disease", "source": "Ghana Cocoa Board"}
            },
            {
                "id": "cassava_1",
                "content": "Cassava planting in Ghana: Use stem cuttings of 20-25cm length from mature plants (10-12 months old). Plant at 1m x 1m spacing. Best planted at onset of rains. Apply NPK 15-15-15 at 200kg/ha if soil is poor.",
                "metadata": {"crop": "cassava", "topic": "planting", "source": "CSIR Guidelines"}
            }
        ]
    }
    
    json_file = DOCUMENTS_DIR / "crop_guidelines.json"
    with open(json_file, 'w') as f:
        json.dump(json_doc, f, indent=2)
    
    print(f"✓ Created JSON document: {json_file}")

def main():
    """Main function"""
    print("🌾 Document Loader for Ghana Agricultural Bot")
    print("=" * 50)
    
    # Check if documents directory has files
    doc_count = len(list(DOCUMENTS_DIR.glob('*')))
    
    if doc_count == 0:
        print("\n📭 No documents found in documents directory")
        choice = input("Would you like to create sample documents? (y/n): ")
        if choice.lower() == 'y':
            download_sample_documents()
    
    # Load documents
    load_documents()
    
    print("\n✅ Document loading complete!")

if __name__ == "__main__":
    main()