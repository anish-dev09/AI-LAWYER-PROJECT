"""
Supreme Court Semantic Search System
Uses sentence-transformers and FAISS for retrieving relevant Supreme Court judgments
"""

import json
import numpy as np
import pickle
import os
from pathlib import Path
from sentence_transformers import SentenceTransformer
import faiss
from typing import List, Dict, Tuple


class SupremeCourtSearchEngine:
    def __init__(self, json_path: str = None):
        """Initialize the search engine with dataset and model"""
        # Use absolute path based on current file location
        base_dir = Path(__file__).parent
        self.json_path = json_path or str(base_dir / "data" / "supreme_court.json")
        self.model_name = "sentence-transformers/all-MiniLM-L6-v2"
        self.index_path = str(base_dir / "data" / "supreme_court_index.faiss")
        self.embeddings_path = str(base_dir / "data" / "supreme_court_embeddings.pkl")
        
        # Defer initialization
        self.data = None
        self.model = None
        self.index = None
        self.embeddings = None
        self._initialized = False
    
    def _ensure_initialized(self):
        """Lazy initialization - only load when first search is performed"""
        if self._initialized:
            return
        
        print("Initializing Supreme Court Search Engine...")
        
        # Load dataset
        self.data = self._load_dataset()
        
        # Initialize model
        print("Loading embedding model...")
        self.model = SentenceTransformer(self.model_name)
        
        # Load or create index
        if os.path.exists(self.index_path) and os.path.exists(self.embeddings_path):
            print("Loading existing FAISS index...")
            self.index = faiss.read_index(self.index_path)
            with open(self.embeddings_path, 'rb') as f:
                self.embeddings = pickle.load(f)
        else:
            print("Creating new FAISS index...")
            self._create_index()
        
        self._initialized = True
        print("Supreme Court Search Engine ready!")
    
    def _load_dataset(self) -> List[Dict]:
        """Load Supreme Court dataset from JSON"""
        with open(self.json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"Loaded {len(data)} Supreme Court cases")
        return data
    
    def _create_index(self):
        """Generate embeddings and create FAISS index"""
        # Extract questions for embedding
        questions = [item['question'] for item in self.data]
        
        print(f"Generating embeddings for {len(questions)} questions...")
        # Generate embeddings in batches for efficiency
        batch_size = 32
        all_embeddings = []
        
        for i in range(0, len(questions), batch_size):
            batch = questions[i:i+batch_size]
            embeddings = self.model.encode(batch, show_progress_bar=True)
            all_embeddings.append(embeddings)
        
        # Concatenate all embeddings
        self.embeddings = np.vstack(all_embeddings).astype('float32')
        
        # Create FAISS index
        dimension = self.embeddings.shape[1]
        self.index = faiss.IndexFlatIP(dimension)  # Inner product (cosine similarity)
        
        # Normalize embeddings for cosine similarity
        faiss.normalize_L2(self.embeddings)
        
        # Add to index
        self.index.add(self.embeddings)
        
        # Save index and embeddings
        faiss.write_index(self.index, self.index_path)
        with open(self.embeddings_path, 'wb') as f:
            pickle.dump(self.embeddings, f)
        
        print(f"Index created with {self.index.ntotal} vectors")
    
    def search(self, query: str, top_k: int = 5) -> List[Dict]:
        """
        Perform semantic search on Supreme Court dataset
        
        Args:
            query: User's legal question
            top_k: Number of results to return (default 5)
            
        Returns:
            List of dictionaries containing search results with confidence scores
        """
        # Ensure engine is initialized
        self._ensure_initialized()
        
        # Generate query embedding
        query_embedding = self.model.encode([query], show_progress_bar=False)
        query_embedding = query_embedding.astype('float32')
        
        # Normalize for cosine similarity
        faiss.normalize_L2(query_embedding)
        
        # Search
        scores, indices = self.index.search(query_embedding, top_k)
        
        # Prepare results
        results = []
        for idx, score in zip(indices[0], scores[0]):
            if idx < len(self.data):  # Ensure valid index
                data_item = self.data[idx]
                result = {
                    "case_name": data_item.get("case_name", "Unknown Case"),
                    "judgement_date": data_item.get("judgement_date", "Date not available"),
                    "matched_question": data_item.get("question", ""),
                    "answer": data_item.get("answer", ""),
                    "confidence_score": float(score)
                }
                results.append(result)
        
        return results
    
    def rebuild_index(self):
        """Rebuild the FAISS index (useful if dataset is updated)"""
        if os.path.exists(self.index_path):
            os.remove(self.index_path)
        if os.path.exists(self.embeddings_path):
            os.remove(self.embeddings_path)
        
        # Reload dataset
        self.data = self._load_dataset()
        self._create_index()
        print("Index rebuilt successfully")


# Singleton instance
_search_engine = None


def get_search_engine() -> SupremeCourtSearchEngine:
    """Get or create singleton search engine instance"""
    global _search_engine
    if _search_engine is None:
        _search_engine = SupremeCourtSearchEngine()
    return _search_engine


if __name__ == "__main__":
    # Test the search engine
    print("Initializing Supreme Court Search Engine...")
    engine = SupremeCourtSearchEngine()
    
    # Test queries
    test_queries = [
        "Was the remand order valid under PMLA?",
        "Can police officer be prosecuted without sanction?",
        "What are the rights of accused in gang rape cases?"
    ]
    
    for query in test_queries:
        print(f"\n{'='*80}")
        print(f"Query: {query}")
        print('='*80)
        results = engine.search(query, top_k=5)
        
        for i, result in enumerate(results, 1):
            print(f"\n{i}. {result['case_name']}")
            print(f"   Date: {result['judgement_date']}")
            print(f"   Confidence: {result['confidence_score']:.3f}")
            print(f"   Q: {result['matched_question'][:100]}...")
            print(f"   A: {result['answer'][:150]}...")
