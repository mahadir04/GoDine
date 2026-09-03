import json
import urllib.request
import urllib.parse
from typing import List, Dict, Any, Optional

OVERPASS_API_URL = "https://overpass-api.de/api/interpreter"
NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search"

def fetch_osm_nearby_venues(lat: float, lon: float, radius_meters: int = 5000) -> List[Dict[str, Any]]:
    query = f"""
    [out:json][timeout:25];
    (
      nwr["amenity"~"restaurant|cafe|bakery"](around:{radius_meters},{lat},{lon});
      nwr["tourism"~"hotel|motel|guest_house"](around:{radius_meters},{lat},{lon});
    );
    out center tags;
    """
    
    try:
        data = urllib.parse.urlencode({'data': query}).encode('utf-8')
        req = urllib.request.Request(
            OVERPASS_API_URL, 
            data=data,
            headers={'User-Agent': 'GoDine-Platform/2.0'}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            res_json = json.loads(response.read().decode('utf-8'))
            
        elements = res_json.get('elements', [])
        venues = []
        
        for elem in elements:
            tags = elem.get('tags', {})
            name = tags.get('name')
            if not name:
                continue
                
            elem_lat = elem.get('lat') or (elem.get('center', {}).get('lat'))
            elem_lon = elem.get('lon') or (elem.get('center', {}).get('lon'))
            
            if not elem_lat or not elem_lon:
                continue
                
            amenity = tags.get('amenity')
            tourism = tags.get('tourism')
            category = 'RESTAURANT'
            if tourism in ['hotel', 'motel', 'guest_house']:
                category = 'HOTEL'
            elif amenity == 'cafe':
                category = 'CAFE'
            elif amenity == 'bakery':
                category = 'BAKERY'
                
            city = tags.get('addr:city') or tags.get('addr:suburb') or 'Dhaka'
            street = tags.get('addr:street') or 'Main Street'
            address = f"{street}, {city}"
            
            venues.append({
                "id": f"osm_{elem.get('id')}",
                "name": name,
                "category": category,
                "latitude": float(elem_lat),
                "longitude": float(elem_lon),
                "address": address,
                "is_verified": True,
                "price_tier": 2,
                "average_rating": 4.5,
                "description": f"Verified {category.capitalize()} mapped via OpenStreetMap."
            })
            
        return venues
    except Exception as e:
        print(f"OSM Fetch Error: {e}")
        return []

def search_osm_location(query_str: str) -> Optional[Dict[str, Any]]:
    try:
        params = urllib.parse.urlencode({
            'q': query_str,
            'format': 'json',
            'limit': 1
        })
        url = f"{NOMINATIM_SEARCH_URL}?{params}"
        req = urllib.request.Request(url, headers={'User-Agent': 'GoDine-Platform/2.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            res_json = json.loads(response.read().decode('utf-8'))
            if res_json and len(res_json) > 0:
                item = res_json[0]
                return {
                    "display_name": item.get('display_name'),
                    "lat": float(item.get('lat')),
                    "lon": float(item.get('lon'))
                }
    except Exception as e:
        print(f"Nominatim Search Error: {e}")
    return None
