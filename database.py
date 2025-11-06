
# ============================================================================
# FILE 6: backend/database.py
# ============================================================================
"""
Location: backend/database.py
Purpose: Database connection and setup
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import os
from models import Base

DATABASE_URL = os.getenv("DATABASE_URL")

# Create engine
engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")



