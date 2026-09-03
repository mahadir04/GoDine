import uuid
from datetime import datetime, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import numpy as np

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.api.v1.api_router import api_router
from app.core.security import get_password_hash
from app.core.vector_store import vector_store

from app.models.user import User
from app.models.venue import Venue
from app.models.post import Post
from app.models.review import Review
from app.services.sentiment_service import analyze_review_sentiment

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local testing convenience
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

static_dir = os.path.join(os.path.dirname(__file__), "static")
index_file = os.path.join(static_dir, "index.html")

@app.get("/")
def read_root():
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "Welcome to GoDine API Gateway. Visit /docs for Swagger API documentation."}

@app.on_event("startup")
def startup_event():
    # Initialize DB schemas
    Base.metadata.create_all(bind=engine)

if os.path.exists(static_dir):
    assets_dir = os.path.join(static_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return {"detail": "Not Found"}
        file_path = os.path.join(static_dir, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(index_file)
