
# ============================================================================
# FILE 5: backend/models.py (Database Models)
# ============================================================================
"""
Location: backend/models.py
Purpose: SQLAlchemy database models
"""

from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, Text, JSON, Boolean, ForeignKey, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class BlogPost(Base):
    __tablename__ = "blog_posts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    content = Column(Text, nullable=False)
    excerpt = Column(Text)
    featured_image = Column(String(500))
    status = Column(String(50), default="draft")
    views = Column(Integer, default=0)
    
    metadata = Column(JSON)
    seo_data = Column(JSON)
    keywords = Column(JSON)
    
    monetization_data = Column(JSON)
    video_urls = Column(JSON)
    image_urls = Column(JSON)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    published_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    monetization = relationship("Monetization", back_populates="post")
    analytics = relationship("Analytics", back_populates="post")
    
    __table_args__ = (
        Index('idx_slug', 'slug'),
        Index('idx_status', 'status'),
        Index('idx_published_at', 'published_at'),
    )

class Monetization(Base):
    __tablename__ = "monetization_data"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    blog_post_id = Column(String, ForeignKey('blog_posts.id'), nullable=False)
    
    affiliate_links = Column(JSON)
    estimated_revenue = Column(Float, default=0)
    actual_revenue = Column(Float, default=0)
    conversion_rate = Column(Float, default=0)
    
    clicks = Column(Integer, default=0)
    conversions = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    post = relationship("BlogPost", back_populates="monetization")

class Analytics(Base):
    __tablename__ = "analytics"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    blog_post_id = Column(String, ForeignKey('blog_posts.id'), nullable=False)
    
    date = Column(DateTime, default=datetime.utcnow)
    views = Column(Integer, default=0)
    unique_visitors = Column(Integer, default=0)
    bounce_rate = Column(Float, default=0)
    avg_time_on_page = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    post = relationship("BlogPost", back_populates="analytics")

class EmailSubscriber(Base):
    __tablename__ = "email_subscribers"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255))
    is_active = Column(Boolean, default=True)
    subscribed_at = Column(DateTime, default=datetime.utcnow)
    unsubscribed_at = Column(DateTime, nullable=True)

class EmailCampaign(Base):
    __tablename__ = "email_campaigns"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    content = Column(Text)
    sent_at = Column(DateTime)
    total_sent = Column(Integer, default=0)
    opens = Column(Integer, default=0)
    clicks = Column(Integer, default=0)

class AffiliateAccount(Base):
    __tablename__ = "affiliate_accounts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    network = Column(String(100), nullable=False)
    affiliate_id = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    added_at = Column(DateTime, default=datetime.utcnow)

class ContentStrategy(Base):
    __tablename__ = "content_strategies"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    niche = Column(String(100))
    target_market = Column(String(100))
    geo_region = Column(String(100))
    parameters = Column(JSON)
    monthly_posts = Column(Integer, default=4)
    created_at = Column(DateTime, default=datetime.utcnow)



