import math
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# If running SQLite, register custom math functions on connection
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL, connect_args=connect_args
)

@event.listens_for(engine, "connect")
def connect(dbapi_connection, connection_record):
    if settings.DATABASE_URL.startswith("sqlite"):
        # Register math functions for sqlite geospatial calculation
        dbapi_connection.create_function("acos", 1, math.acos)
        dbapi_connection.create_function("cos", 1, math.cos)
        dbapi_connection.create_function("sin", 1, math.sin)
        dbapi_connection.create_function("radians", 1, math.radians)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
