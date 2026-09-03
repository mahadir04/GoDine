from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, Dict, Any

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    handle: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Optional[str] = "DINER"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    handle: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    taste_profile: Optional[Dict[str, Any]] = None

class UserResponse(UserBase):
    id: str
    taste_profile: Optional[Dict[str, Any]] = {}
    created_at: datetime

    class Config:
        from_attributes = True
