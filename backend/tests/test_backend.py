import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import math

from app.main import app
from app.core.database import Base, get_db
from app.services.sentiment_service import analyze_review_sentiment
from app.services.geo_service import haversine_distance

# Set up test sqlite database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

# Register trig functions on test sqlite
@pytest.fixture(scope="session", autouse=True)
def setup_sqlite_trig():
    from sqlalchemy import event
    @event.listens_for(engine, "connect")
    def connect(dbapi_connection, connection_record):
        dbapi_connection.create_function("acos", 1, math.acos)
        dbapi_connection.create_function("cos", 1, math.cos)
        dbapi_connection.create_function("sin", 1, math.sin)
        dbapi_connection.create_function("radians", 1, math.radians)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture()
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture()
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

def test_sentiment_analyzer():
    # Test English review with mixed aspect extraction (awesome food + crowded space)
    res1 = analyze_review_sentiment("Kacchi platter was awesome and mutton tender, but sitting space is too crowded.")
    assert abs(res1["overall_sentiment"]) < 0.1  # Mixed overall (neutral)
    assert res1["aspect_scores"]["taste"] > 3.0  # Positive taste rating
    assert res1["aspect_scores"]["ambience"] < 3.0 # Negative space/crowded rating

    # Test purely positive review
    res_pos = analyze_review_sentiment("Kacchi was delicious and service was fast, value for money")
    assert res_pos["overall_sentiment"] > 0.0

    # Test Banglish review with negations
    res2 = analyze_review_sentiment("Coffee was good but service is not fast, very slow")
    assert res2["aspect_scores"]["taste"] > 3.0
    assert res2["aspect_scores"]["service"] < 3.0

def test_geo_distance():
    # Dhaka Center to Gulshan-1 distance (around 2 km)
    dist = haversine_distance(23.777176, 90.399452, 23.778500, 90.400500)
    assert dist > 0
    assert dist < 5.0

def test_auth_workflow(client):
    # Register Diner
    reg_resp = client.post("/api/v1/auth/register", json={
        "email": "testdiner@geodine.com",
        "full_name": "Test User",
        "role": "DINER",
        "password": "password123"
    })
    assert reg_resp.status_code == 200
    assert reg_resp.json()["email"] == "testdiner@geodine.com"

    # Login Diner
    login_resp = client.post("/api/v1/auth/login", data={
        "username": "testdiner@geodine.com",
        "password": "password123"
    })
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()

def test_oauth_workflow(client):
    oauth_resp = client.post("/api/v1/auth/oauth", json={
        "provider": "google",
        "email": "google.user@geodine.com",
        "full_name": "Alex Rivera",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
    })
    assert oauth_resp.status_code == 200
    data = oauth_resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "google.user@geodine.com"

def test_google_oauth_endpoint(client):
    google_resp = client.post("/api/v1/auth/google", json={
        "id_token": "mock_google_id_token"
    })
    # Since mock_google_id_token won't pass Google's HTTP tokeninfo without network,
    # the endpoint returns 401 with detail, confirming route /api/v1/auth/google EXISTS (not 404).
    assert google_resp.status_code != 404


