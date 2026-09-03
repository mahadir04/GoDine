from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict
from app.schemas.venue import VenueResponse

class PostBase(BaseModel):
    venue_id: Optional[str] = None
    post_type: Optional[str] = "POST"  # POST, STORY, PROMO, EVENT, REEL
    content: Optional[str] = None
    media_urls: Optional[List[str]] = []
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    discount_pct: Optional[int] = 0
    expires_at: Optional[datetime] = None

class PostCreate(PostBase):
    pass

class PostUpdate(BaseModel):
    post_type: Optional[str] = None
    content: Optional[str] = None
    media_urls: Optional[List[str]] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    discount_pct: Optional[int] = None
    expires_at: Optional[datetime] = None

class PostResponse(BaseModel):
    id: str
    venue_id: Optional[str] = None
    author_id: str
    post_type: str
    content: Optional[str] = None
    media_urls: List[str]
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    discount_pct: int
    expires_at: Optional[datetime] = None
    likes_count: int
    comments_count: int
    created_at: datetime
    venue: Optional[VenueResponse] = None

    class Config:
        from_attributes = True

class FeedItemResponse(BaseModel):
    post_id: str
    venue: Optional[Dict] = None
    post_type: str
    content: Optional[str] = None
    media_urls: List[str]
    match_confidence: float
    taste_alignment_tags: List[str]
    likes_count: int
    comments_count: int
    created_at: datetime
    discount_pct: int
    expires_at: Optional[datetime] = None
