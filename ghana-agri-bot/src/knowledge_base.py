# knowledge_base.py - FINAL FIXED VERSION
"""
Enhanced Knowledge Base with proper type handling for embeddings
"""

from typing import List, Dict, Optional
import logging
import numpy as np
from src.chroma_client import get_collection
from src.embeddings import EmbeddingService

logger = logging.getLogger(__name__)

class KnowledgeBase:
    def __init__(self, collection_name: str = "ghana_agriculture"):
        self.collection = get_collection(collection_name)
        self.embedder = EmbeddingService("sentence-transformers/all-MiniLM-L6-v2")
        logger.info(f"KnowledgeBase ready. Collection: {collection_name}")

    def _ensure_list(self, embedding):
        """Convert embedding to list if it's not already"""
        if isinstance(embedding, np.ndarray):
            return embedding.tolist()
        elif isinstance(embedding, list):
            return embedding
        else:
            # Try to convert to list
            try:
                return list(embedding)
            except:
                return embedding

    def add_document(self, document_id: str, text: str, metadata: Dict):
        """Add a single document to the knowledge base"""
        try:
            # Check if document already exists
            existing = self.collection.get(ids=[document_id])
            if existing and existing.get('ids') and document_id in existing['ids']:
                logger.info(f"Skipping existing document ID: {document_id}")
                return
            
            # Generate embedding for the text
            embedding = self.embedder.encode_batch([text])[0]
            
            # Convert to list format (handles both numpy arrays and lists)
            embedding_list = self._ensure_list(embedding)
            
            # Add to collection
            self.collection.add(
                ids=[document_id],
                embeddings=[embedding_list],
                documents=[text],
                metadatas=[metadata or {}]
            )
            logger.info(f"Added document: {document_id}")
            
        except Exception as e:
            logger.error(f"Error adding document: {e}")
            raise  # Re-raise to see the actual error

    def add_documents_batch(self, document_ids: List[str], texts: List[str], metadatas: List[Dict]):
        """Add multiple documents in batch"""
        if not document_ids:
            return
        try:
            # Generate embeddings for all texts
            embeddings = self.embedder.encode_batch(texts, batch_size=128)
            
            # Convert to list format
            embeddings_list = [self._ensure_list(emb) for emb in embeddings]
            
            self.collection.add(
                ids=document_ids,
                embeddings=embeddings_list,
                documents=texts,
                metadatas=metadatas
            )
            logger.info(f"Added batch of {len(document_ids)} documents.")
        except Exception as e:
            logger.error(f"Error adding batch documents: {e}")
            raise

    def query(self, query_texts: List[str], n_results: int = 5, where: Optional[Dict] = None):
        """Query using multiple query texts"""
        try:
            # Generate embeddings for query texts
            query_embeddings = self.embedder.encode_batch(query_texts, batch_size=32)
            query_embeddings_list = [self._ensure_list(emb) for emb in query_embeddings]
            
            # Only include 'where' if it's not empty and not None
            query_args = dict(
                query_embeddings=query_embeddings_list,
                n_results=n_results,
                include=["documents", "metadatas", "distances"],
            )
            if where:
                query_args["where"] = where

            return self.collection.query(**query_args)
        except Exception as e:
            logger.error(f"KB query error: {e}")
            return {"documents": [], "metadatas": [], "distances": []}

    def search(self, query: str, n_results: int = 5, metadata_filter: Optional[Dict] = None) -> List[Dict]:
        """
        Search the knowledge base with a single query string
        Returns list of documents with metadata and relevance scores
        """
        try:
            # Enhanced query with Ghana agricultural context
            enhanced_query = f"{query} Ghana agriculture farming"
            
            # Generate embedding for the query
            query_embedding = self.embedder.encode_batch([enhanced_query])[0]
            
            # Convert to list format
            query_embedding_list = self._ensure_list(query_embedding)
            
            # Only include 'where' if it's not empty and not None
            query_args = dict(
                query_embeddings=[query_embedding_list],
                n_results=n_results,
                include=["documents", "metadatas", "distances"]
            )
            if metadata_filter:
                query_args["where"] = metadata_filter

            # Perform the search using embeddings
            results = self.collection.query(**query_args)
            
            # Extract and format results
            documents = results.get("documents", [[]])[0] if results.get("documents") else []
            metadatas = results.get("metadatas", [[]])[0] if results.get("metadatas") else []
            distances = results.get("distances", [[]])[0] if results.get("distances") else []
            
            formatted_results = []
            for doc, meta, dist in zip(documents, metadatas, distances):
                if doc is not None:
                    # Convert distance to similarity score (inverse)
                    similarity = 1 / (1 + dist) if dist else 1.0
                    
                    formatted_results.append({
                        "text": doc,
                        "metadata": meta or {},
                        "distance": dist,
                        "similarity": similarity
                    })
            
            # Sort by similarity (highest first)
            formatted_results.sort(key=lambda x: x['similarity'], reverse=True)
            
            return formatted_results[:n_results]
            
        except Exception as e:
            logger.error(f"Search error: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return []

    def get_all_documents(self, limit: int = 100) -> Dict:
        """Retrieve all documents for debugging"""
        try:
            return self.collection.get(limit=limit)
        except Exception as e:
            logger.error(f"Error getting all documents: {e}")
            return {"ids": [], "documents": [], "metadatas": []}