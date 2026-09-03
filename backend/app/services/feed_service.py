from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict, Any, Optional
from datetime import datetime
import numpy as np

from app.models.post import Post
from app.models.venue import Venue
from app.services.geo_service import haversine_distance
from app.core.vector_store import vector_store

def generate_geospatial_feed(
    db: Session,
    latitude: float,
    longitude: float,
    radius_km: float = 10.0,
    page: int = 1,
    limit: int = 20,
    user_id: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Computes feed items matching the user's location, distance threshold, 
    and ranks them via Two-Tower similarity and contextual metadata.
    """
    # 1. Fetch posts within active geospatial radius
    # Join with venues to get coordinates if post has no custom coordinate
    query = db.query(Post).join(Venue, Post.venue_id == Venue.id, isouter=True)
    posts = query.all()

    feed_items = []
    
    # Simulate a user query vector based on GATv2 profile / taste profile
    # Normally this would be produced by the PyTorch Query Tower
    user_query_vector = list(np.random.normal(0, 0.1, 128))
    
    # Retrieve similarity rankings from vector store
    similarity_rankings = vector_store.search(user_query_vector, limit=500)
    sim_dict = {item["entity_id"]: item["similarity"] for item in similarity_rankings}

    for post in posts:
        # Determine coordinate
        post_lat = post.latitude if post.latitude is not None else (post.venue.latitude if post.venue else None)
        post_lon = post.longitude if post.longitude is not None else (post.venue.longitude if post.venue else None)
        
        if post_lat is None or post_lon is None:
            continue
            
        dist = haversine_distance(latitude, longitude, post_lat, post_lon)
        if dist > radius_km:
            continue

        # Calculate recommendation match confidence
        # Use vector similarity score or simulate one
        match_confidence = sim_dict.get(post.id, 0.5)
        # Add slight positive bias if the venue is highly rated or verified
        if post.venue:
            if post.venue.is_verified:
                match_confidence += 0.05
            match_confidence += (post.venue.average_rating / 5.0) * 0.1
            
        # Ensure between 0.0 and 1.0
        match_confidence = max(0.1, min(0.99, float(match_confidence)))
        
        # Tags for taste alignment mapping
        taste_tags = []
        if post.post_type == "PROMO":
            taste_tags.append("Exclusive Promo")
        if post.venue:
            if post.venue.category == "RESTAURANT":
                taste_tags.extend(["Hot Dishes", "Fine Dining"])
            elif post.venue.category == "CAFE":
                taste_tags.extend(["Quiet Vibe", "Coffee & Chill"])
            elif post.venue.category == "BAKERY":
                taste_tags.extend(["Freshly Baked", "Sweet Treats"])
                
        if post.discount_pct > 0:
            taste_tags.append(f"{post.discount_pct}% Off")

        venue_info = None
        if post.venue:
            venue_info = {
                "id": post.venue.id,
                "name": post.venue.name,
                "category": post.venue.category,
                "distance_km": round(dist, 2),
                "is_verified": post.venue.is_verified,
                "average_rating": post.venue.average_rating
            }

        feed_items.append({
            "post_id": post.id,
            "venue": venue_info,
            "post_type": post.post_type,
            "content": post.content,
            "media_urls": post.media_urls,
            "match_confidence": round(match_confidence, 3),
            "taste_alignment_tags": taste_tags,
            "likes_count": post.likes_count,
            "comments_count": post.comments_count,
            "created_at": post.created_at,
            "discount_pct": post.discount_pct,
            "expires_at": post.expires_at
        })

    # 3. Contextual Reranking: Sort feed_items by score
    # Score = match_confidence * 0.6 + (recency boost) + (promo boost) - (distance penalty)
    def calculate_score(item):
        score = item["match_confidence"] * 0.6
        if item["post_type"] == "PROMO":
            score += 0.15  # Promotion boost
        # Recency decay
        age_hours = (datetime.utcnow() - item["created_at"].replace(tzinfo=None)).total_seconds() / 3600.0
        recency = 1.0 / (1.0 + age_hours * 0.05)
        score += recency * 0.2
        # Distance decay
        dist = item["venue"]["distance_km"] if item["venue"] else 5.0
        score -= (dist / radius_km) * 0.1
        return score

    feed_items.sort(key=calculate_score, reverse=True)

    # Pagination slicing
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    return feed_items[start_idx:end_idx]
