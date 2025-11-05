
# ============================================================================
# FILE 7: backend/main.py
# ============================================================================
"""
Location: backend/main.py
Purpose: FastAPI main application
"""

from fastapi import FastAPI, BackgroundTasks, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import os
from datetime import datetime

from database import init_db, get_db, SessionLocal
from services.content_engine_gemini import ContentEngine
from services.email_service_zoho import EmailService
from models import BlogPost, EmailSubscriber, Monetization
import uuid

# Initialize
app = FastAPI(
    title="Travel Blog API",
    description="Luxury travel blog for South Africa",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
content_engine = ContentEngine()
email_service = EmailService()

# Initialize database
@app.on_event("startup")
def startup():
    init_db()

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/")
async def root():
    return {
        "message": "Travel Blog API",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# ============================================================================
# CONTENT ENDPOINTS
# ============================================================================

@app.post("/api/posts/generate")
async def generate_post(
    topic: str,
    background_tasks: BackgroundTasks,
    db = Depends(get_db)
):
    """Generate a new blog post"""
    
    niche = os.getenv("NICHE", "luxury-resorts")
    target_market = os.getenv("TARGET_MARKET", "US-millennial")
    region = os.getenv("GEO_REGION", "Cape Town")
    
    try:
        # Generate content
        post_data = await content_engine.generate_blog_post(
            topic=topic,
            niche=niche,
            target_market=target_market,
            region=region
        )
        
        # Create blog post
        post = BlogPost(
            id=str(uuid.uuid4()),
            title=post_data.get("title", "Untitled"),
            slug=post_data.get("slug", topic.lower().replace(" ", "-")),
            content=post_data.get("content", ""),
            excerpt=post_data.get("meta_description", ""),
            seo_data=post_data.get("seo_data", {}),
            keywords=post_data.get("keywords", []),
            status="draft"
        )
        
        db.add(post)
        db.commit()
        db.refresh(post)
        
        # Create monetization record
        monetization = Monetization(
            id=str(uuid.uuid4()),
            blog_post_id=post.id,
            affiliate_links=post_data.get("affiliate_suggestions", [])
        )
        db.add(monetization)
        db.commit()
        
        # Schedule email notification
        background_tasks.add_task(
            notify_subscribers_new_post,
            post.id,
            post.title
        )
        
        return {
            "status": "success",
            "post_id": post.id,
            "title": post.title,
            "message": "Post generated successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/posts")
async def list_posts(db = Depends(get_db)):
    """List all blog posts"""
    
    posts = db.query(BlogPost).filter(
        BlogPost.status == "published"
    ).order_by(BlogPost.published_at.desc()).all()
    
    return [
        {
            "id": p.id,
            "title": p.title,
            "slug": p.slug,
            "excerpt": p.excerpt,
            "views": p.views,
            "published_at": p.published_at.isoformat() if p.published_at else None
        }
        for p in posts
    ]

@app.get("/api/posts/{slug}")
async def get_post(slug: str, db = Depends(get_db)):
    """Get single blog post"""
    
    post = db.query(BlogPost).filter(BlogPost.slug == slug).first()
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Increment views
    post.views += 1
    db.commit()
    
    return {
        "id": post.id,
        "title": post.title,
        "slug": post.slug,
        "content": post.content,
        "views": post.views,
        "published_at": post.published_at.isoformat() if post.published_at else None
    }

# ============================================================================
# EMAIL ENDPOINTS
# ============================================================================

@app.post("/api/email/subscribe")
async def subscribe(email: str, db = Depends(get_db)):
    """Subscribe to newsletter"""
    
    # Check if already subscribed
    existing = db.query(EmailSubscriber).filter(
        EmailSubscriber.email == email
    ).first()
    
    if existing:
        return {"status": "already_subscribed"}
    
    # Add subscriber
    subscriber = EmailSubscriber(
        id=str(uuid.uuid4()),
        email=email,
        name=email.split("@")[0]
    )
    db.add(subscriber)
    db.commit()
    
    # Send welcome email
    email_service.send_welcome_email(email)
    
    return {"status": "subscribed", "email": email}

@app.post("/api/email/send-newsletter")
async def send_newsletter(subject: str, html_body: str, db = Depends(get_db)):
    """Send newsletter to all subscribers"""
    
    subscribers = db.query(EmailSubscriber).filter(
        EmailSubscriber.is_active == True
    ).all()
    
    subscriber_emails = [s.email for s in subscribers]
    
    result = email_service.send_newsletter(
        subscriber_emails,
        subject,
        html_body
    )
    
    return result

# ============================================================================
# DASHBOARD ENDPOINTS
# ============================================================================

@app.get("/api/dashboard/stats")
async def get_stats(db = Depends(get_db)):
    """Get blog statistics"""
    
    total_posts = db.query(BlogPost).filter(
        BlogPost.status == "published"
    ).count()
    
    total_views = db.query(BlogPost).filter(
        BlogPost.status == "published"
    ).count()
    
    total_subscribers = db.query(EmailSubscriber).filter(
        EmailSubscriber.is_active == True
    ).count()
    
    return {
        "total_posts": total_posts,
        "total_views": total_views,
        "total_subscribers": total_subscribers
    }

# ============================================================================
# BACKGROUND TASKS
# ============================================================================

async def notify_subscribers_new_post(post_id: str, post_title: str):
    """Notify subscribers of new post"""
    
    db = SessionLocal()
    
    try:
        subscribers = db.query(EmailSubscriber).filter(
            EmailSubscriber.is_active == True
        ).all()
        
        subscriber_emails = [s.email for s in subscribers]
        
        post_url = f"https://yourblog.com/posts/{post_id}"
        
        email_service.send_new_post_notification(
            subscriber_emails,
            post_title,
            post_url
        )
        
    finally:
        db.close()



