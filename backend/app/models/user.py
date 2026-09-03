import uuid
from sqlalchemy import Column, String, DateTime, JSON, Text
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(120), nullable=False)
    handle = Column(String(60), nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    role = Column(String(30), default="DINER")  # DINER, OWNER, ADMIN
    taste_profile = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
