# 🎯 MANUAL DATABASE SETUP

Since Docker isn't running (and we don't need it for production deployment), 
please execute the database schema manually:

## Step 1: Open Supabase SQL Editor
```
https://supabase.com/dashboard/project/zlilxsonhjwzxdtoxdxi/sql/new
```

## Step 2: Copy & Paste This SQL
Copy the entire content from `supabase/schema.sql` and paste it into the SQL Editor, then click "Run".

## Step 3: Verify Tables Created
Go to: https://supabase.com/dashboard/project/zlilxsonhjwzxdtoxdxi/editor
You should see these tables:
- blog_posts
- analytics  
- ai_providers
- affiliate_performance
- email_subscribers

---

**Once done, return here and we'll deploy the frontend!**