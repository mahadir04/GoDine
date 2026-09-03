from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.feed_service import generate_geospatial_feed
from app.schemas.post import FeedItemResponse
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[FeedItemResponse])
def get_personalized_feed(
    latitude: float = Query(..., description="Diner latitude coordinates"),
    longitude: float = Query(..., description="Diner longitude coordinates"),
    radius_km: float = Query(10.0, description="Geospatial bounding radius in km"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves AI-ranked geospatial newsfeed. Maps taste profiles, GNN node weights, 
    and relative distance metrics.
    """
    feed = generate_geospatial_feed(
        db=db,
        latitude=latitude,
        longitude=longitude,
        radius_km=radius_km,
        page=page,
        limit=limit,
        user_id=current_user.id
    )
    return feed
