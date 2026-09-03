from fastapi import APIRouter

from app.api.v1.endpoints import auth, venues, posts, feed, reviews, analytics, chat, reservations, osm

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(venues.router, prefix="/venues", tags=["venues"])
api_router.include_router(posts.router, prefix="/posts", tags=["posts"])
api_router.include_router(feed.router, prefix="/feed", tags=["feed"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(reservations.router, prefix="/reservations", tags=["reservations"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(osm.router, prefix="/osm", tags=["osm"])
