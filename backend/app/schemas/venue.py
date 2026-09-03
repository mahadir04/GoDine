from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any

class VenueBase(BaseModel):
    name: str
    category: str  # RESTAURANT, HOTEL, MOTEL, RESTHOUSE, CAFE, BAKERY, LOUNGE
    description: Optional[str] = None
    price_tier: Optional[int] = 1
    latitude: float
    longitude: float
    address: str
    opening_hours: Optional[Dict[str, Any]] = None

class VenueCreate(VenueBase):
    pass

class VenueUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    price_tier: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    opening_hours: Optional[Dict[str, Any]] = None
    is_verified: Optional[bool] = None

class VenueResponse(VenueBase):
    id: str
    owner_id: str
    is_verified: bool
    average_rating: float
    created_at: datetime

    class Config:
        from_attributes = True
