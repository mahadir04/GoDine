import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Post(Base):
    __tablename__ = "posts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    venue_id = Column(String(36), ForeignKey("venues.id", ondelete="CASCADE"), nullable=True)
    author_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    post_type = Column(String(30), default="POST")  # POST, STORY, PROMO, EVENT
    content = Column(Text, nullable=True)
    media_urls = Column(JSON, default=list)  # Stored as JSON array for cross-DB compatibility
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    discount_pct = Column(Integer, default=0)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    venue = relationship("Venue")
    author = relationship("User")
