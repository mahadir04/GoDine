from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.reservation import Reservation
from app.models.venue import Venue
from app.models.user import User
from app.schemas.reservation import ReservationCreate, ReservationUpdate, ReservationResponse
from app.api.deps import get_current_user

router = APIRouter()

# CREATE RESERVATION
@router.post("/", response_model=ReservationResponse)
def create_reservation(
    reservation_in: ReservationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    venue = db.query(Venue).filter(Venue.id == reservation_in.venue_id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Target venue not found")
        
    db_res = Reservation(
        venue_id=reservation_in.venue_id,
        user_id=current_user.id,
        reservation_time=reservation_in.reservation_time,
        guests=reservation_in.guests or "2 Guests",
        status="CONFIRMED",
        special_requests=reservation_in.special_requests
    )
    db.add(db_res)
    db.commit()
    db.refresh(db_res)
    return db_res

# READ USER'S RESERVATIONS
@router.get("/", response_model=List[ReservationResponse])
def list_my_reservations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Reservation).filter(Reservation.user_id == current_user.id).all()

# READ VENUE'S RESERVATIONS (FOR OWNER)
@router.get("/venue/{venue_id}", response_model=List[ReservationResponse])
def list_venue_reservations(
    venue_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    if venue.owner_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="You do not own this venue.")
        
    return db.query(Reservation).filter(Reservation.venue_id == venue_id).all()

# UPDATE RESERVATION
@router.patch("/{reservation_id}", response_model=ReservationResponse)
def update_reservation(
    reservation_id: str,
    res_in: ReservationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found")
        
    venue = db.query(Venue).filter(Venue.id == res.venue_id).first()
    is_owner = venue and venue.owner_id == current_user.id
    if res.user_id != current_user.id and not is_owner and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Permission denied")
        
    update_data = res_in.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(res, field, val)
        
    db.add(res)
    db.commit()
    db.refresh(res)
    return res

# DELETE / CANCEL RESERVATION
@router.delete("/{reservation_id}")
def delete_reservation(
    reservation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found")
        
    venue = db.query(Venue).filter(Venue.id == res.venue_id).first()
    is_owner = venue and venue.owner_id == current_user.id
    if res.user_id != current_user.id and not is_owner and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Permission denied")
        
    db.delete(res)
    db.commit()
    return {"message": "Reservation cancelled and deleted successfully", "id": reservation_id}
