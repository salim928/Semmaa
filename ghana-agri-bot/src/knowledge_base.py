# RAG and vector database
"""
Knowledge Base Manager with RAG Implementation
Purpose: Handle document storage, retrieval, and vector search for agricultural content
"""

import logging
from pathlib import Path
from typing import List, Dict, Optional
import json

import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import numpy as np

from config.settings import (
    CHROMA_PERSIST_DIR, 
    COLLECTION_NAME, 
    EMBEDDING_MODEL,
    DOCUMENTS_DIR
)

logger = logging.getLogger(__name__)

class KnowledgeBase:
    def __init__(self):
        """Initialize ChromaDB and embedding model"""
        # Initialize sentence transformer for embeddings
        self.embedder = SentenceTransformer(EMBEDDING_MODEL)
        
        # Initialize ChromaDB with persistence
        self.chroma_client = chromadb.PersistentClient(
            path=CHROMA_PERSIST_DIR,
            settings=Settings(anonymized_telemetry=True)
        )
        
        # Get or create collection
        try:
            self.collection = self.chroma_client.get_collection(name=COLLECTION_NAME)
            logger.info(f"Loaded existing collection: {COLLECTION_NAME}")
        except:
            self.collection = self.chroma_client.create_collection(
                name=COLLECTION_NAME,
                metadata={"description": "Ghana agricultural knowledge base"}
            )
            logger.info(f"Created new collection: {COLLECTION_NAME}")
            self._load_initial_data()
    
    def _load_initial_data(self):
        """Load initial agricultural knowledge"""
        # Initial knowledge base (you'll expand this with real documents)
        initial_documents = [
            {
                "text": "Maize planting in Ghana: Major season is from late March to April when the long rains begin. Minor season is September to October. Plant at 75cm x 25cm spacing with 2 seeds per hole.",
                "metadata": {"crop": "maize", "topic": "planting", "source": "CSIR Guidelines"}
            },
            {
                "text": "NPK 15-15-15 fertilizer application for maize: Apply 250kg/ha at planting as basal application. Top dress with 125kg/ha Urea at 4 weeks after planting.",
                "metadata": {"crop": "maize", "topic": "fertilizer", "source": "MoFA Recommendations"}
            },
            {
                "text": "Cocoa black pod disease management: Spray copper-based fungicides like Nordox 75WP at 50g/15L water every 2 weeks during rainy season. Remove infected pods immediately.",
                "metadata": {"crop": "cocoa", "topic": "disease", "source": "Ghana Cocoa Board"}
            },
            {
                "text": "Fall armyworm control in maize: Scout fields twice weekly. Apply Emamectin benzoate or Spinetoram at first sign of infestation. Best applied in evening when larvae are active.",
                "metadata": {"crop": "maize", "topic": "pest", "source": "CSIR Research"}
            },
            {
                "text": "Cassava planting in Ghana: Best planted at the onset of rains (March-April or September-October). Use stem cuttings of 20-25cm length. Plant at 1m x 1m spacing.",
                "metadata": {"crop": "cassava", "topic": "planting", "source": "CSIR Guidelines"}
            },
            {
                "text": "Tomato production in Ghana: Transplant seedlings 4 weeks after sowing. Space at 60cm x 45cm. Apply 250kg/ha NPK 15-15-15 at transplanting.",
                "metadata": {"crop": "tomato", "topic": "planting", "source": "MoFA Guidelines"}
            }
        ]
        
        # Add documents to collection
        for i, doc in enumerate(initial_documents):
            self.add_document(
                document_id=f"initial_{i}",
                text=doc["text"],
                metadata=doc["metadata"]
            )
        
        logger.info(f"Loaded {len(initial_documents)} initial documents")
    
    def add_document(self, document_id: str, text: str, metadata: Dict = None):
        """
        Add a document to the knowledge base, skipping if ID already exists.
        """
        try:
            # Check if document_id already exists
            existing = self.collection.get(ids=[document_id])
            if existing and existing.get('ids') and document_id in existing['ids']:
                logger.info(f"Skipping existing document ID: {document_id}")
                return
            # Generate embedding
            embedding = self.embedder.encode(text).tolist()
            # Add to ChromaDB
            self.collection.add(
                ids=[document_id],
                embeddings=[embedding],
                documents=[text],
                metadatas=[metadata or {}]
            )
            
            logger.info(f"Added document: {document_id}")
            
        except Exception as e:
            logger.error(f"Error adding document: {e}")
    
    def add_documents_batch(self, document_ids: List[str], texts: List[str], metadatas: List[Dict]):
        """
        Add multiple documents to the knowledge base in a single batch.
        """
        try:
            # Generate embeddings for all texts
            embeddings = self.embedder.encode(texts).tolist()
            # Add to ChromaDB in batch
            self.collection.add(
                ids=document_ids,
                embeddings=embeddings,
                documents=texts,
                metadatas=metadatas
            )
            logger.info(f"Added batch of {len(document_ids)} documents.")
        except Exception as e:
            logger.error(f"Error adding batch documents: {e}")
    
    def search(self, query: str, n_results: int = 3) -> List[Dict]:
        """
        Search for relevant documents using semantic similarity
        
        Args:
            query: Search query
            n_results: Number of results to return
            
        Returns:
            List of relevant documents with metadata
        """
        try:
            # Generate query embedding
            query_embedding = self.embedder.encode(query).tolist()
            
            # Search in ChromaDB
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results
            )
            
            # Format results
            formatted_results = []
            if results['documents'] and results['documents'][0]:
                for i, doc in enumerate(results['documents'][0]):
                    formatted_results.append({
                        'text': doc,
                        'metadata': results['metadatas'][0][i] if results['metadatas'] else {},
                        'distance': results['distances'][0][i] if results['distances'] else 0
                    })
            
            logger.info(f"Found {len(formatted_results)} results for query: {query[:50]}...")
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error searching documents: {e}")
            return []
    
    def get_context_for_query(
        self, 
        query: str, 
        max_context_length: int = 500,
        satellite: Optional[Dict] = None,
        weather: Optional[Dict] = None,
        web_search: Optional[Dict] = None
    ) -> str:
        """
        Get relevant context for a query to enhance LLM response.
        Optionally include satellite, weather, and web search outputs.

        Args:
            query: User query
            max_context_length: Maximum length of context to return
            satellite: Satellite agent output (optional)
            weather: Weather agent output (optional)
            web_search: Web search agent output (optional)

        Returns:
            Formatted context string
        """
        results = self.search(query, n_results=2)
        context_parts = ["Relevant information from knowledge base:\n"]

        if results:
            for i, result in enumerate(results, 1):
                text = result['text'][:max_context_length]
                source = result['metadata'].get('source', 'Unknown')
                context_parts.append(f"{i}. {text} (Source: {source})\n")
        else:
            context_parts.append("No relevant knowledge base results found.\n")

        # Add satellite context if available
        if satellite:
            if satellite.get('formatted_report'):
                context_parts.append(f"\nSatellite analysis:\n{satellite['formatted_report']}\n")
            elif satellite.get('ndvi'):
                ndvi = satellite['ndvi'].get('current', 'N/A')
                context_parts.append(f"\nSatellite NDVI: {ndvi}\n")

        # Add weather context if available
        if weather and weather.get('agricultural_advisory'):
            context_parts.append(f"\nWeather advisory:\n{weather['agricultural_advisory']}\n")

        # Add web search context if available
        if web_search and web_search.get('context'):
            context_parts.append(f"\nWeb search insights:\n{web_search['context']}\n")

        return "\n".join(context_parts)
    
    def update_from_feedback(self, query: str, response: str, feedback: str):
        """
        Update knowledge base based on user feedback
        
        Args:
            query: Original query
            response: Generated response
            feedback: User feedback (positive/negative)
        """
        if feedback == "positive":
            # Store successful Q&A pairs for future reference
            doc_id = f"feedback_{hash(query + response) % 1000000}"
            self.add_document(
                document_id=doc_id,
                text=f"Question: {query}\nAnswer: {response}",
                metadata={
                    "type": "validated_qa",
                    "feedback": "positive"
                }
            )
            logger.info("Added positive feedback to knowledge base")