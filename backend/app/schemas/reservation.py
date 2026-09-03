from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.schemas.venue import VenueResponse

class ReservationBase(BaseModel):
    venue_id: str
    reservation_time: str
    guests: str = "2 Guests"
    special_requests: Optional[str] = None

class ReservationCreate(ReservationBase):
    pass

class ReservationUpdate(BaseModel):
    reservation_time: Optional[str] = None
    guests: Optional[str] = None
    status: Optional[str] = None
    special_requests: Optional[str] = None

class ReservationResponse(BaseModel):
    id: str
    venue_id: str
    user_id: str
    reservation_time: str
    guests: str
    status: str
    special_requests: Optional[str] = None
    created_at: datetime
    venue: Optional[VenueResponse] = None

    class Config:
        from_attributes = True
