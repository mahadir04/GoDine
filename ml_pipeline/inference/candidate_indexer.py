import numpy as np
import os
import sys

# Configure python path to find app module
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.app.core.database import SessionLocal
from backend.app.models.user import User
from backend.app.models.venue import Venue
from backend.app.models.post import Post
from backend.app.models.review import Review
from backend.app.core.vector_store import vector_store

def index_candidates():
    print("Initiating Geospatial Candidate Vector Indexing...")
    db = SessionLocal()
    try:
        venues = db.query(Venue).all()
        posts = db.query(Post).all()
        
        print(f"Loaded {len(venues)} venues and {len(posts)} posts from database.")
        
        # Index venues
        for v in venues:
            # Generate simulated 128-d candidate embedding
            emb = list(np.random.normal(0, 0.1, 128))
            vector_id = hash(v.id) % (2**31 - 1)
            
            vector_store.upsert(
                vector_id=vector_id,
                embedding=emb,
                entity_type="VENUE",
                entity_id=v.id,
                price_tier=v.price_tier,
                cuisine_tags=[v.category, "Local"]
            )
            print(f"Indexed Venue candidate: {v.name} (ID: {v.id})")
            
        # Index posts
        for p in posts:
            emb = list(np.random.normal(0, 0.1, 128))
            vector_id = hash(p.id) % (2**31 - 1)
            
            vector_store.upsert(
                vector_id=vector_id,
                embedding=emb,
                entity_type="POST",
                entity_id=p.id,
                price_tier=p.venue.price_tier if p.venue else 1,
                cuisine_tags=["Promo", "FlashSale"] if p.post_type == "PROMO" else ["Update"]
            )
            print(f"Indexed Post candidate ID: {p.id}")
            
        print("Candidate indexing process completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    index_candidates()
