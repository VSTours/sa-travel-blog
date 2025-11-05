# 🔑 Supabase Authentication Setup

## Step 1: Get Your Supabase Access Token

Since we're in a non-TTY environment, we need to use token-based authentication:

### 1.1 Visit Supabase Dashboard
```
https://supabase.com/dashboard
```

### 1.2 Sign up/Login
- Sign up with GitHub (recommended)
- Or create account with email

### 1.3 Generate Access Token
- Go to: https://supabase.com/dashboard/account/tokens
- Click "Generate new token"
- Name: "Travel Blog CLI"
- Copy the token (starts with `sbp_`)

### 1.4 Set Token in Environment
```bash
export SUPABASE_ACCESS_TOKEN="sbp_your_token_here"
```

## Step 2: Create Your Project

### 2.1 Create New Project
- Go to: https://supabase.com/dashboard
- Click "New Project"
- Organization: Create new or use existing
- Name: `travel-blog-platform`
- Database Password: Choose strong password
- Region: Select closest to you

### 2.2 Get Project Details
Once created, go to **Settings > API** and copy:
- Project URL: `https://xxx.supabase.co`
- anon public key
- service_role key

## Step 3: Deploy with Token

```bash
# Set your access token
export SUPABASE_ACCESS_TOKEN="sbp_your_token_here"

# Run deployment script
./deploy-supabase.sh
```

---

## Quick Commands:

```bash
# 1. Get token from: https://supabase.com/dashboard/account/tokens
# 2. Set token:
export SUPABASE_ACCESS_TOKEN="sbp_your_token_here"

# 3. Create project at: https://supabase.com/dashboard

# 4. Deploy:
./deploy-supabase.sh
```

---

**Next: Visit https://supabase.com/dashboard to get started!**