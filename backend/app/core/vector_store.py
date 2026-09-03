import numpy as np
from typing import List, Dict, Any, Optional

class LocalVectorStore:
    def __init__(self):
        self.candidates = []

    def upsert(
        self,
        vector_id: int,
        embedding: List[float],
        entity_type: str,
        entity_id: str,
        price_tier: Optional[int] = None,
        cuisine_tags: Optional[List[str]] = None,
        geo_h3_index: Optional[int] = None
    ):
        # Remove existing if vector_id matches
        self.candidates = [c for c in self.candidates if c["vector_id"] != vector_id]
        
        self.candidates.append({
            "vector_id": vector_id,
            "embedding": np.array(embedding, dtype=np.float32),
            "entity_type": entity_type,
            "entity_id": entity_id,
            "price_tier": price_tier,
            "cuisine_tags": cuisine_tags or [],
            "geo_h3_index": geo_h3_index
        })

    def search(
        self,
        query_vector: List[float],
        limit: int = 500,
        entity_type: Optional[str] = None,
        price_tier: Optional[int] = None,
        cuisine_tags: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        if not self.candidates:
            return []

        q_vec = np.array(query_vector, dtype=np.float32)
        q_norm = np.linalg.norm(q_vec)
        if q_norm == 0:
            q_norm = 1e-9

        results = []
        for cand in self.candidates:
            # Filters
            if entity_type and cand["entity_type"] != entity_type:
                continue
            if price_tier and cand["price_tier"] != price_tier:
                continue
            if cuisine_tags:
                # Must overlap at least one tag
                if not any(tag in cand["cuisine_tags"] for tag in cuisine_tags):
                    continue

            c_vec = cand["embedding"]
            c_norm = np.linalg.norm(c_vec)
            if c_norm == 0:
                c_norm = 1e-9

            # Cosine similarity
            similarity = float(np.dot(q_vec, c_vec) / (q_norm * c_norm))
            
            results.append({
                "entity_id": cand["entity_id"],
                "entity_type": cand["entity_type"],
                "similarity": similarity,
                "price_tier": cand["price_tier"],
                "cuisine_tags": cand["cuisine_tags"]
            })

        # Sort by similarity desc
        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:limit]

# Global instance of the vector store
vector_store = LocalVectorStore()
