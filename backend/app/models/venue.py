import uuid
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Venue(Base):
    __tablename__ = "venues"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False)  # RESTAURANT, HOTEL, MOTEL, RESTHOUSE, CAFE, BAKERY, LOUNGE
    description = Column(Text, nullable=True)
    price_tier = Column(Integer, default=1)  # 1 to 4
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(Text, nullable=False)
    opening_hours = Column(JSON, nullable=False, default=dict)
    is_verified = Column(Boolean, default=False)
    average_rating = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User")
