"""
Authentication endpoints:
  POST /auth/register       – Email/password registration
  POST /auth/login          – Email/password login → JWT
  POST /auth/google         – Google ID-token verification → JWT  (REAL OAuth)
  POST /auth/oauth          – Legacy simple OAuth payload → JWT   (mock / other providers)
  GET  /auth/me             – Return current user profile
  PUT  /auth/me             – Update current user profile
"""
from datetime import timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.schemas.auth import Token
from app.api.deps import get_current_user

router = APIRouter()


# ---------------------------------------------------------------------------
# 1. REGISTER — email + password
# ---------------------------------------------------------------------------
@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists.",
        )
    db_user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        handle=user_in.handle or f"@{user_in.email.split('@')[0]}",
        bio=user_in.bio or "Food explorer & hospitality enthusiast.",
        avatar_url=user_in.avatar_url,
        role=user_in.role or "DINER",
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# ---------------------------------------------------------------------------
# 2. LOGIN — email + password → JWT
# ---------------------------------------------------------------------------
@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password.",
        )
    access_token = create_access_token(
        subject=user.id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user}


# ---------------------------------------------------------------------------
# 3. GOOGLE OAUTH — verify real Google ID token → issue JWT
#    Frontend sends the `credential` string from Google Identity Services
# ---------------------------------------------------------------------------
class GoogleTokenRequest(BaseModel):
    id_token: str   # The credential from Google GSI callback


@router.post("/google", response_model=Token)
def google_oauth(
    payload: GoogleTokenRequest,
    db: Session = Depends(get_db),
):
    """
    Verify a Google ID token issued by the GSI SDK (Sign In With Google).
    On success, upsert the user and return a platform JWT.
    """
    idinfo = None
    try:
        from google.oauth2 import id_token as google_id_token
        from google.auth.transport import requests as google_requests

        # Verify against the configured Client ID
        idinfo = google_id_token.verify_oauth2_token(
            payload.id_token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID if settings.GOOGLE_CLIENT_ID else None,
        )
    except Exception as exc:
        # Fallback to Google Tokeninfo endpoint
        import json
        import urllib.request
        try:
            url = f"https://oauth2.googleapis.com/tokeninfo?id_token={payload.id_token}"
            req = urllib.request.urlopen(url, timeout=5)
            idinfo = json.loads(req.read().decode('utf-8'))
            if "error" in idinfo or "email" not in idinfo:
                raise ValueError(idinfo.get("error_description", "Invalid Google Token"))
        except Exception as fallback_exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Google ID token verification failed: {str(exc)}",
            )

    email = idinfo.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Google token missing email claim.")

    full_name = idinfo.get("name", email.split("@")[0])
    avatar_url = idinfo.get("picture")
    google_sub = idinfo.get("sub")          # unique Google user ID

    # Upsert user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            password_hash=get_password_hash(f"google_oauth_{google_sub}"),
            full_name=full_name,
            handle=f"@{email.split('@')[0]}",
            bio="Authenticated via Google OAuth.",
            avatar_url=avatar_url,
            role="DINER",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update avatar if changed
        if avatar_url and user.avatar_url != avatar_url:
            user.avatar_url = avatar_url
            db.commit()
            db.refresh(user)

    access_token = create_access_token(
        subject=user.id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user}


# ---------------------------------------------------------------------------
# 4. LEGACY OAUTH — simple payload (no token verification); GitHub / mock
# ---------------------------------------------------------------------------
class OAuthLoginRequest(BaseModel):
    provider: str
    email: EmailStr
    full_name: str
    avatar_url: Optional[str] = None
    provider_id: Optional[str] = None


@router.post("/oauth", response_model=Token)
def oauth_login(
    payload: OAuthLoginRequest,
    db: Session = Depends(get_db),
):
    """
    Simple OAuth upsert — used for GitHub or any provider that
    sends verified user info directly (not via ID token).
    """
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        user = User(
            email=payload.email,
            password_hash=get_password_hash(f"oauth_{payload.provider}_{payload.email}"),
            full_name=payload.full_name,
            handle=f"@{payload.email.split('@')[0]}",
            bio=f"Authenticated via {payload.provider.capitalize()} OAuth.",
            avatar_url=payload.avatar_url,
            role="DINER",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(
        subject=user.id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user}


# ---------------------------------------------------------------------------
# 5. GET /me — return authenticated user
# ---------------------------------------------------------------------------
@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


# ---------------------------------------------------------------------------
# 6. PUT /me — update profile fields
# ---------------------------------------------------------------------------
@router.put("/me", response_model=UserResponse)
def update_me(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
    if user_in.handle is not None:
        current_user.handle = user_in.handle
    if user_in.bio is not None:
        current_user.bio = user_in.bio
    if user_in.avatar_url is not None:
        current_user.avatar_url = user_in.avatar_url
    if user_in.taste_profile is not None:
        current_user.taste_profile = user_in.taste_profile

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
