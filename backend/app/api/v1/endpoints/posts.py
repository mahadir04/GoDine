from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import numpy as np

from app.core.database import get_db
from app.models.post import Post
from app.models.venue import Venue
from app.models.user import User
from app.schemas.post import PostCreate, PostUpdate, PostResponse
from app.api.deps import get_current_user
from app.core.vector_store import vector_store

router = APIRouter()

# CREATE POST — Any authenticated user can create posts.
# Only venue PROMO posts require the user to own that venue.
@router.post("/", response_model=PostResponse)
def create_post(
    post_in: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    venue = None
    if post_in.venue_id:
        venue = db.query(Venue).filter(Venue.id == post_in.venue_id).first()
        if not venue:
            # Venue tag not found — allow post with GPS coordinates only
            pass
        elif post_in.post_type == "PROMO" and venue.owner_id != current_user.id and current_user.role != "ADMIN":
            raise HTTPException(
                status_code=403,
                detail="Only the venue owner can create promotional posts for this venue."
            )
            
    db_post = Post(
        venue_id=post_in.venue_id if venue else None,
        author_id=current_user.id,
        post_type=post_in.post_type or "POST",
        content=post_in.content,
        media_urls=post_in.media_urls or [],
        latitude=post_in.latitude,
        longitude=post_in.longitude,
        discount_pct=post_in.discount_pct or 0,
        expires_at=post_in.expires_at,
        likes_count=0,
        comments_count=0
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    
    # Auto-index into vector DB
    mock_embedding = list(np.random.normal(0, 0.1, 128))
    cuisine_tags = ["Smoked BBQ", "High Protein"] if "smoke" in (post_in.content or "").lower() else []
    vector_store.upsert(
        vector_id=hash(db_post.id) % (2**31 - 1),
        embedding=mock_embedding,
        entity_type="POST",
        entity_id=db_post.id,
        price_tier=venue.price_tier if venue else 1,
        cuisine_tags=cuisine_tags
    )
    
    return db_post

# READ ALL POSTS
@router.get("/", response_model=List[PostResponse])
def list_posts(db: Session = Depends(get_db)):
    return db.query(Post).all()

# READ SINGLE POST
@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: str, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

# READ POSTS BY VENUE
@router.get("/venue/{venue_id}", response_model=List[PostResponse])
def list_venue_posts(venue_id: str, db: Session = Depends(get_db)):
    return db.query(Post).filter(Post.venue_id == venue_id).all()

# UPDATE POST
@router.put("/{post_id}", response_model=PostResponse)
def update_post(
    post_id: str,
    post_in: PostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    if post.author_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="You do not have permission to update this post.")
        
    update_data = post_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(post, field, value)
        
    db.add(post)
    db.commit()
    db.refresh(post)
    return post

# DELETE POST
@router.delete("/{post_id}")
def delete_post(
    post_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    if post.author_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="You do not have permission to delete this post.")
        
    db.delete(post)
    db.commit()
    return {"message": "Post deleted successfully", "id": post_id}
