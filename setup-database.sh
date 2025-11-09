#!/bin/bash

echo "🗄️ Setting up Supabase Database Schema..."
echo "========================================"

# Check if we can connect to Supabase
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found"
    exit 1
fi

echo "📋 Setting up database tables..."

# Execute the schema
cat << 'EOF' | supabase db remote --db-url "postgresql://postgres.zlilxsonhjwzxdtoxdxi:${SUPABASE_DB_PASSWORD}@aws-0-eu-west-3.pooler.supabase.com:6543/postgres"

-- Travel Blog Platform Database Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  destination TEXT NOT NULL,
  ai_provider TEXT NOT NULL,
  affiliate_links JSONB DEFAULT '{}',
  seo_meta JSONB DEFAULT '{}',
  published BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table for tracking
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI providers configuration
CREATE TABLE IF NOT EXISTS ai_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_destination ON blog_posts(destination);
CREATE INDEX IF NOT EXISTS idx_analytics_post_id ON analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);

-- Enable Row Level Security (RLS)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now)
DROP POLICY IF EXISTS "Allow all operations on blog_posts" ON blog_posts;
CREATE POLICY "Allow all operations on blog_posts" ON blog_posts FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on analytics" ON analytics;
CREATE POLICY "Allow all operations on analytics" ON analytics FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on ai_providers" ON ai_providers;
CREATE POLICY "Allow all operations on ai_providers" ON ai_providers FOR ALL USING (true);

-- Insert initial AI providers
INSERT INTO ai_providers (name, is_active) VALUES 
  ('gemini', true),
  ('anthropic', true),
  ('openai', true)
ON CONFLICT (name) DO NOTHING;

-- Sample welcome post
INSERT INTO blog_posts (title, content, excerpt, destination, ai_provider, published) VALUES 
  (
    'Welcome to Your AI Travel Blog',
    '<h1>Welcome to Your AI Travel Blog</h1><p>This is your first AI-generated travel blog post. Your platform is now ready to create amazing content about destinations around the world!</p><p>Features include:</p><ul><li>AI-powered content generation</li><li>Affiliate link integration</li><li>SEO optimization</li><li>Analytics tracking</li></ul>',
    'Welcome to your new AI-powered travel blog platform. Start generating amazing travel content today!',
    'Platform Launch',
    'gemini',
    true
  )
ON CONFLICT DO NOTHING;

EOF

echo "✅ Database schema setup complete!"
echo ""
echo "🎯 Next Steps:"
echo "1. Visit your admin dashboard: https://admin-1zw1zoz0q-christiaans-projects-1c25e6d7.vercel.app"
echo "2. Generate your first travel blog post"
echo "3. Check the posts in your Supabase dashboard"