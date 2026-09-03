import uuid
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    venue_id = Column(String(36), ForeignKey("venues.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    dish_name = Column(String(150), nullable=True)
    rating = Column(Integer, nullable=False)  # 1 to 5
    review_text = Column(Text, nullable=False)
    sentiment_score = Column(Float, nullable=True)  # Overall sentiment: -1.0 to 1.0
    aspect_scores = Column(JSON, default=dict)  # {"taste": 0.9, "service": -0.8...}
    is_flagged_spam = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    venue = relationship("Venue")
    user = relationship("User")
