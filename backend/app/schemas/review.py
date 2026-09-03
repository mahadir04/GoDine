from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any

class ReviewCreate(BaseModel):
    venue_id: str
    dish_name: Optional[str] = None
    rating: int = Field(..., ge=1, le=5)
    review_text: str

class ReviewUpdate(BaseModel):
    dish_name: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    review_text: Optional[str] = None

class ReviewResponse(BaseModel):
    id: str
    venue_id: str
    user_id: str
    dish_name: Optional[str] = None
    rating: int
    review_text: str
    sentiment_score: Optional[float] = None
    aspect_scores: Dict[str, Any]
    is_flagged_spam: bool
    created_at: datetime

    class Config:
        from_attributes = True
