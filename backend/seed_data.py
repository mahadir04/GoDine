import uuid
from app.core.database import SessionLocal, engine, Base
import app.models
from app.models.user import User
from app.models.venue import Venue
from app.models.post import Post
from app.core.security import get_password_hash

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Create or get Demo Users
        owner = db.query(User).filter(User.email == "owner@geodine.com").first()
        if not owner:
            owner = User(
                id=str(uuid.uuid4()),
                email="owner@geodine.com",
                password_hash=get_password_hash("owner123"),
                full_name="Merchant Partner",
                handle="@merchant_partner",
                bio="Verified Hospitality Partner & Hotel/Restaurant Owner.",
                avatar_url="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80",
                role="OWNER"
            )
            db.add(owner)
            db.commit()
            db.refresh(owner)

        diner = db.query(User).filter(User.email == "diner@geodine.com").first()
        if not diner:
            diner = User(
                id=str(uuid.uuid4()),
                email="diner@geodine.com",
                password_hash=get_password_hash("diner123"),
                full_name="Mahir Hasan",
                handle="@mahir_hasan",
                bio="Food explorer & hospitality enthusiast.",
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
                role="DINER"
            )
            db.add(diner)
            db.commit()
            db.refresh(diner)

        # 2. Check if Venues exist
        if db.query(Venue).count() == 0:
            venues_data = [
                {
                    "name": "Grand Horizon Hotel & Spa",
                    "category": "HOTEL",
                    "description": "5-Star luxury oceanfront hotel with private beach, rooftop pool, and fine dining.",
                    "price_tier": 4,
                    "latitude": 23.777176,
                    "longitude": 90.399452,
                    "address": "104 Ocean Promenade, Beach Road",
                    "is_verified": True,
                    "average_rating": 4.9,
                    "opening_hours": {"mon_sun": "24 Hours"}
                },
                {
                    "name": "Copper Kettle Bistro & Bar",
                    "category": "RESTAURANT",
                    "description": "Artisanal ramen, smoked ribs, craft cocktails, and vibrant evening jazz.",
                    "price_tier": 2,
                    "latitude": 23.780000,
                    "longitude": 90.410000,
                    "address": "42 Culinary Row, Gourmet District",
                    "is_verified": True,
                    "average_rating": 4.8,
                    "opening_hours": {"mon_sun": "11:00 AM - 11:00 PM"}
                },
                {
                    "name": "Bean & Brew Roastery",
                    "category": "CAFE",
                    "description": "Specialty espresso bar, sourdough croissants, and quiet co-working spaces.",
                    "price_tier": 1,
                    "latitude": 23.770000,
                    "longitude": 90.390000,
                    "address": "15 Barista Way, Coffee Quarter",
                    "is_verified": True,
                    "average_rating": 4.7,
                    "opening_hours": {"mon_sun": "7:00 AM - 10:00 PM"}
                },
                {
                    "name": "Sunset Highway Motel",
                    "category": "MOTEL",
                    "description": "Cozy road-trip boutique motel with modern amenities and EV charging stations.",
                    "price_tier": 2,
                    "latitude": 23.765000,
                    "longitude": 90.380000,
                    "address": "Mile 12 Interstate Highway, West Express",
                    "is_verified": True,
                    "average_rating": 4.6,
                    "opening_hours": {"mon_sun": "24 Hours"}
                },
                {
                    "name": "Pine Valley Hill Resthouse",
                    "category": "RESTHOUSE",
                    "description": "Scenic hill country resthouse with panoramic mountain views and fireplace lounge.",
                    "price_tier": 3,
                    "latitude": 23.790000,
                    "longitude": 90.420000,
                    "address": "Pine Mountain Ridge, Highland Pass",
                    "is_verified": True,
                    "average_rating": 4.9,
                    "opening_hours": {"mon_sun": "8:00 AM - 9:00 PM"}
                }
            ]

            created_venues = []
            for v_info in venues_data:
                v = Venue(
                    id=str(uuid.uuid4()),
                    owner_id=owner.id,
                    name=v_info["name"],
                    category=v_info["category"],
                    description=v_info["description"],
                    price_tier=v_info["price_tier"],
                    latitude=v_info["latitude"],
                    longitude=v_info["longitude"],
                    address=v_info["address"],
                    is_verified=v_info["is_verified"],
                    average_rating=v_info["average_rating"],
                    opening_hours=v_info["opening_hours"]
                )
                db.add(v)
                created_venues.append(v)

            db.commit()
            print(f"Successfully seeded {len(created_venues)} venues into database!")

            # 3. Seed Posts for Venues
            posts_data = [
                {
                    "venue": created_venues[1], # Copper Kettle
                    "content": "Tonkotsu Ramen Special! Slow-simmered pork broth with fresh hand-pulled noodles.",
                    "post_type": "PROMO",
                    "discount_pct": 20,
                    "media_urls": ["https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=900&auto=format&fit=crop&q=80"]
                },
                {
                    "venue": created_venues[0], # Grand Horizon Hotel
                    "content": "Sunset at our infinity pool terrace. Book your weekend luxury getaway today!",
                    "post_type": "POST",
                    "discount_pct": 15,
                    "media_urls": ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&auto=format&fit=crop&q=80"]
                },
                {
                    "venue": created_venues[2], # Bean & Brew
                    "content": "Freshly roasted Ethiopian Yirgacheffe coffee paired with warm butter croissants.",
                    "post_type": "POST",
                    "discount_pct": 0,
                    "media_urls": ["https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=900&auto=format&fit=crop&q=80"]
                }
            ]

            for p_info in posts_data:
                p = Post(
                    id=str(uuid.uuid4()),
                    venue_id=p_info["venue"].id,
                    author_id=owner.id,
                    post_type=p_info["post_type"],
                    content=p_info["content"],
                    media_urls=p_info["media_urls"],
                    latitude=p_info["venue"].latitude,
                    longitude=p_info["venue"].longitude,
                    discount_pct=p_info["discount_pct"],
                    likes_count=42,
                    comments_count=8
                )
                db.add(p)

            db.commit()
            print("Successfully seeded posts and promos!")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
