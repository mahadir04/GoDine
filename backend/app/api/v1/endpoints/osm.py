from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional
from app.services.osm_service import fetch_osm_nearby_venues, search_osm_location

router = APIRouter()

@router.get("/nearby")
def get_osm_nearby(
    latitude: float = Query(..., description="Latitude coordinate"),
    longitude: float = Query(..., description="Longitude coordinate"),
    radius_meters: int = Query(5000, description="Bounding radius in meters")
):
    """
    Returns live OpenStreetMap nearby venues (restaurants, cafes, bakeries, hotels, motels, resthouses).
    """
    venues = fetch_osm_nearby_venues(lat=latitude, lon=longitude, radius_meters=radius_meters)
    return {"latitude": latitude, "longitude": longitude, "count": len(venues), "venues": venues}

@router.get("/geocode")
def geocode_location(query: str = Query(..., description="Place name or city query")):
    """
    Uses OpenStreetMap Nominatim for 100% free geocoding.
    """
    location = search_osm_location(query=query)
    return {"query": query, "location": location}
