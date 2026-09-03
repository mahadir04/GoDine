from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.venue import Venue
from app.models.user import User
from app.schemas.venue import VenueCreate, VenueUpdate, VenueResponse
from app.api.deps import get_current_user
from app.services.geo_service import haversine_distance

router = APIRouter()

# CREATE VENUE
@router.post("/", response_model=VenueResponse)
def create_venue(
    venue_in: VenueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["OWNER", "ADMIN"]:
        raise HTTPException(
            status_code=403,
            detail="Only owners or admins can register hospitality venues."
        )
        
    db_venue = Venue(
        owner_id=current_user.id,
        name=venue_in.name,
        category=venue_in.category,
        description=venue_in.description,
        price_tier=venue_in.price_tier,
        latitude=venue_in.latitude,
        longitude=venue_in.longitude,
        address=venue_in.address,
        opening_hours=venue_in.opening_hours or {},
        is_verified=False,
        average_rating=0.0
    )
    db.add(db_venue)
    db.commit()
    db.refresh(db_venue)
    return db_venue

# SEARCH VENUES
@router.get("/search", response_model=List[VenueResponse])
def search_venues(
    query: Optional[str] = None,
    category: Optional[str] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    radius_km: float = 10.0,
    db: Session = Depends(get_db)
):
    all_venues = db.query(Venue).all()
    results = []
    
    for venue in all_venues:
        # Match text search
        if query:
            q = query.lower()
            name_match = q in venue.name.lower()
            desc_match = q in (venue.description or "").lower()
            cat_match = q in venue.category.lower()
            if not (name_match or desc_match or cat_match):
                continue

        # Match category
        if category:
            if category.upper() != "ALL" and venue.category.upper() != category.upper():
                continue
                
        # Match location
        if latitude is not None and longitude is not None:
            dist = haversine_distance(latitude, longitude, venue.latitude, venue.longitude)
            if dist > radius_km:
                continue
                
        results.append(venue)
        
    return results

# READ ALL VENUES
@router.get("/", response_model=List[VenueResponse])
def list_venues(db: Session = Depends(get_db)):
    return db.query(Venue).all()

# READ SINGLE VENUE
@router.get("/{venue_id}", response_model=VenueResponse)
def get_venue(venue_id: str, db: Session = Depends(get_db)):
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    return venue

# UPDATE VENUE
@router.put("/{venue_id}", response_model=VenueResponse)
def update_venue(
    venue_id: str,
    venue_in: VenueUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
        
    if venue.owner_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="You do not have permission to update this venue.")
        
    update_data = venue_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(venue, field, value)
        
    db.add(venue)
    db.commit()
    db.refresh(venue)
    return venue

# DELETE VENUE
@router.delete("/{venue_id}")
def delete_venue(
    venue_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
        
    if venue.owner_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="You do not have permission to delete this venue.")
        
    db.delete(venue)
    db.commit()
    return {"message": "Venue deleted successfully", "id": venue_id}
