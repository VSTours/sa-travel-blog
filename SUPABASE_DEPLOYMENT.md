# 🚀 Supabase Deployment Guide
*Deploy your entire Travel Blog Platform in 15 minutes*

## Why Supabase?
- **All-in-one**: Database + Authentication + Edge Functions + Storage
- **Generous free tier**: Perfect for getting started
- **Instant APIs**: Auto-generated REST and GraphQL APIs
- **Edge Functions**: Deploy your FastAPI backend as serverless functions
- **Real-time**: Built-in subscriptions and live updates

---

## 🎯 STEP 1: Create Supabase Project (5 minutes)

### 1.1 Sign up & Create Project
```bash
# Visit: https://supabase.com/dashboard
# Click "New Project"
# Choose: Organization (create new if needed)
# Project Name: travel-blog-platform
# Database Password: [choose strong password]
# Region: Choose closest to your users
```

### 1.2 Get Your Credentials
Once created, go to **Settings > API** and copy:
- `Project URL` 
- `anon public key`
- `service_role key` (keep secret!)

---

## 🗄️ STEP 2: Setup Database Schema (3 minutes)

### 2.1 Create Tables
Go to **SQL Editor** in Supabase Dashboard and run:

```sql
-- Blog posts table
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  destination TEXT NOT NULL,
  ai_provider TEXT NOT NULL,
  affiliate_links JSONB DEFAULT '{}',
  seo_meta JSONB DEFAULT '{}',
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table
CREATE TABLE analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES blog_posts(id),
  event_type TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI providers table
CREATE TABLE ai_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  api_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - restrict later)
CREATE POLICY "Allow all operations" ON blog_posts FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON analytics FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON ai_providers FOR ALL USING (true);
```

---

## ⚡ STEP 3: Deploy Backend as Edge Functions (5 minutes)

### 3.1 Install Supabase CLI
```bash
npm install -g supabase
supabase login
```

### 3.2 Initialize Supabase in Project
```bash
cd "/home/missnoirex/Documents/VS_Pilot/VSCode deployment"
supabase init
```

### 3.3 Create Edge Function for AI Content Generation
```bash
supabase functions new generate-content
```

This creates: `supabase/functions/generate-content/index.ts`

---

## 🔧 STEP 4: Configure Environment Variables

### 4.1 Update Frontend Environment
Create `.env.local` in `/admin` folder:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI Providers
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-key
NEXT_PUBLIC_ANTHROPIC_API_KEY=your-anthropic-key
NEXT_PUBLIC_OPENAI_API_KEY=your-openai-key

# Email Configuration
NEXT_PUBLIC_ZOHO_SMTP_HOST=smtp.zoho.com
NEXT_PUBLIC_ZOHO_SMTP_PORT=587
NEXT_PUBLIC_ZOHO_EMAIL=your-email@domain.com
NEXT_PUBLIC_ZOHO_PASSWORD=your-app-password

# Affiliate IDs
NEXT_PUBLIC_BOOKING_AFFILIATE_ID=your-booking-id
NEXT_PUBLIC_GETYOURGUIDE_AFFILIATE_ID=your-getyourguide-id
NEXT_PUBLIC_VIATOR_AFFILIATE_ID=your-viator-id
```

### 4.2 Set Supabase Secrets
```bash
supabase secrets set GEMINI_API_KEY=your-gemini-key
supabase secrets set ANTHROPIC_API_KEY=your-anthropic-key
supabase secrets set OPENAI_API_KEY=your-openai-key
```

---

## 🚀 STEP 5: Deploy Everything (2 minutes)

### 5.1 Deploy Edge Functions
```bash
supabase functions deploy generate-content --no-verify-jwt
```

### 5.2 Update Frontend API Endpoint
In your admin dashboard, the API will be:
```
https://your-project-id.supabase.co/functions/v1/generate-content
```

### 5.3 Deploy Frontend (if not already done)
```bash
cd admin
npm run build
npx vercel --prod
```

---

## 🎯 FINAL CONFIGURATION

### Update Vercel Environment Variables
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings > Environment Variables**
4. Add all the `NEXT_PUBLIC_*` variables from `.env.local`

### Test Your Platform
1. **Frontend**: https://your-vercel-url.vercel.app
2. **Database**: Check Supabase Dashboard > Table Editor
3. **Functions**: Check Supabase Dashboard > Edge Functions
4. **AI Content**: Test the content generation in your admin panel

---

## 📊 SUPABASE ADVANTAGES

✅ **Free Tier Includes:**
- 2 free projects
- Up to 50,000 monthly active users
- 500MB database space
- 1GB file storage
- 2GB bandwidth
- 500K Edge Function invocations

✅ **Built-in Features:**
- Real-time database subscriptions
- Authentication (if you want user logins later)
- File storage for images
- Automatic API generation
- Dashboard analytics

✅ **Scaling Path:**
- Start free, pay as you grow
- Easy to upgrade to Pro ($25/month)
- No infrastructure management
- Global CDN included

---

## 🔥 QUICK START COMMANDS

```bash
# 1. Create Supabase project (web dashboard)
# 2. Run SQL schema (copy from above)
# 3. Deploy functions:
cd "/home/missnoirex/Documents/VS_Pilot/VSCode deployment"
supabase functions deploy generate-content --no-verify-jwt

# 4. Update frontend config and redeploy:
cd admin
# Add environment variables to .env.local
npm run build
npx vercel --prod
```

**You'll have a fully functional AI travel blog in production in under 15 minutes!**

---

## 🆘 TROUBLESHOOTING

**Issue**: Edge function fails to deploy
**Solution**: Check you're logged into Supabase CLI: `supabase login`

**Issue**: Database connection fails  
**Solution**: Verify your Supabase URL and keys in environment variables

**Issue**: AI providers not working
**Solution**: Make sure secrets are set: `supabase secrets list`

---

**Ready to deploy? Let's start with creating your Supabase project!**