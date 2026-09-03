from sqlalchemy.orm import Session
from app.models.venue import Venue
from app.models.review import Review
from app.models.post import Post
from typing import List, Dict, Any

def process_chat_query(db: Session, query: str) -> str:
    """
    Parses the user query for entities (categories, locations, dishes)
    and searches the database to return conversational recommendations.
    """
    q_lower = query.lower()

    # 1. Identify category search
    target_category = None
    categories_map = {
        "motel": "MOTEL",
        "resthouse": "RESTHOUSE",
        "rest house": "RESTHOUSE",
        "hotel": "HOTEL",
        "restaurant": "RESTAURANT",
        "cafe": "CAFE",
        "coffee": "CAFE",
        "bakery": "BAKERY",
        "cake": "BAKERY",
        "lounge": "LOUNGE"
    }
    for kw, cat in categories_map.items():
        if kw in q_lower:
            target_category = cat
            break

    # 2. Identify location search
    target_location = None
    locations = ["gulshan", "banani", "tejgaon", "niketon"]
    for loc in locations:
        if loc in q_lower:
            target_location = loc
            break

    # 3. Identify food/dish keyword
    target_dish = None
    dishes = ["biryani", "kacchi", "brisket", "bbq", "pastry", "croissant"]
    for dish in dishes:
        if dish in q_lower:
            target_dish = dish
            break

    # 4. Perform database search
    query_obj = db.query(Venue)
    
    if target_category:
        query_obj = query_obj.filter(Venue.category == target_category)
        
    venues = query_obj.all()
    
    # Filter by location in python-side to check address or name
    if target_location:
        venues = [v for v in venues if target_location in v.address.lower() or target_location in v.name.lower()]

    # If looking for a dish, check reviews or descriptions
    if target_dish:
        # Filter venues associated with that dish in reviews
        matching_venue_ids = set()
        reviews = db.query(Review).all()
        for r in reviews:
            if r.dish_name and target_dish in r.dish_name.lower():
                matching_venue_ids.add(r.venue_id)
            elif target_dish in r.review_text.lower():
                matching_venue_ids.add(r.venue_id)
        
        # Also check description
        for v in venues:
            if target_dish in (v.description or "").lower():
                matching_venue_ids.add(v.id)
                
        # If we have specific matching venues for the food, filter our list
        if matching_venue_ids:
            venues = [v for v in venues if v.id in matching_venue_ids]

    # 5. Compile conversational response
    if not venues:
        # General response if no direct match found
        return (
            "I couldn't find any direct matches in our geospatial database for your request. "
            "Could you try specifying a different category (e.g. motel, resthouse, cafe) or location (e.g. Gulshan, Banani)?"
        )

    response_lines = []
    response_lines.append(f"Here are the top matches I found in our database:")
    
    for idx, v in enumerate(venues[:3]):
        # Get some details
        is_promo_active = db.query(Post).filter(Post.venue_id == v.id, Post.post_type == "PROMO").first() is not None
        promo_tag = " [🔥 Active Promo]" if is_promo_active else ""
        
        rating_star = "★" * int(v.average_rating) if v.average_rating > 0 else "No ratings"
        
        line = (
            f"\n{idx+1}. **{v.name}** ({v.category}){promo_tag}"
            f"\n   - Rating: {v.average_rating} {rating_star}"
            f"\n   - Location: {v.address}"
            f"\n   - Details: {v.description or 'A lovely hospitality destination.'}"
        )
        
        # Include aspect highlights if reviews exist
        v_reviews = db.query(Review).filter(Review.venue_id == v.id).all()
        if v_reviews:
            aspect_sums = {"taste": 0.0, "service": 0.0, "ambience": 0.0}
            count = 0
            for r in v_reviews:
                if r.aspect_scores:
                    for aspect in aspect_sums:
                        val = r.aspect_scores.get(aspect)
                        if val is not None:
                            aspect_sums[aspect] += val
                            count += 1
            if count > 0:
                taste_score = round(aspect_sums["taste"] / (count / 3), 1)
                amb_score = round(aspect_sums["ambience"] / (count / 3), 1)
                line += f"\n   - AI Highlights: Taste: {taste_score}/5.0 | Ambience: {amb_score}/5.0"

        response_lines.append(line)
        
    # Append final chat guidance
    response_lines.append(
        "\nFeel free to ask me about details, or navigate to the Social Map view to locate them on Google Maps!"
    )
    
    return "\n".join(response_lines)
