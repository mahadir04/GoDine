import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    venue_id = Column(String, ForeignKey("venues.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    reservation_time = Column(String, nullable=False)  # e.g. "2026-09-12 · 7:30 PM"
    guests = Column(String, nullable=False, default="2 Guests")
    status = Column(String, default="CONFIRMED")  # CONFIRMED, PENDING, CANCELLED, COMPLETED
    special_requests = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    venue = relationship("Venue", backref="reservations")
    user = relationship("User", backref="reservations")
