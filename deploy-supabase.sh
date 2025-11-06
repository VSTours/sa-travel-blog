#!/bin/bash

echo "🚀 Deploying Travel Blog Platform to Supabase..."
echo "==============================================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Check if user is logged in
echo "🔑 Checking Supabase authentication..."
if ! supabase projects list &> /dev/null; then
    echo "❌ Please log in to Supabase first:"
    echo "   supabase login"
    exit 1
fi

echo "✅ Supabase CLI ready"

# Get project details
echo ""
echo "🏗️  Please provide your Supabase project details:"
echo "   (Get these from: https://supabase.com/dashboard > Your Project > Settings > API)"
echo ""
read -p "Project URL (https://xxx.supabase.co): " SUPABASE_URL
read -p "Anon Public Key: " SUPABASE_ANON_KEY
read -s -p "Service Role Key (secret): " SUPABASE_SERVICE_KEY
echo ""

# Validate inputs
if [[ -z "$SUPABASE_URL" || -z "$SUPABASE_ANON_KEY" || -z "$SUPABASE_SERVICE_KEY" ]]; then
    echo "❌ All fields are required. Please try again."
    exit 1
fi

# Extract project ID from URL
PROJECT_ID=$(echo $SUPABASE_URL | sed 's/https:\/\/\([^.]*\).supabase.co/\1/')

# Link to Supabase project
echo "🔗 Linking to Supabase project: $PROJECT_ID"
supabase link --project-ref $PROJECT_ID

# Set up environment variables for edge functions
echo "🔧 Setting up AI provider keys..."
read -p "Gemini API Key (optional): " GEMINI_KEY
read -p "Anthropic API Key (optional): " ANTHROPIC_KEY  
read -p "OpenAI API Key (optional): " OPENAI_KEY

# Set secrets in Supabase
if [[ -n "$GEMINI_KEY" ]]; then
    supabase secrets set GEMINI_API_KEY="$GEMINI_KEY"
    echo "✅ Gemini API key configured"
fi

if [[ -n "$ANTHROPIC_KEY" ]]; then
    supabase secrets set ANTHROPIC_API_KEY="$ANTHROPIC_KEY"
    echo "✅ Anthropic API key configured"
fi

if [[ -n "$OPENAI_KEY" ]]; then
    supabase secrets set OPENAI_API_KEY="$OPENAI_KEY"
    echo "✅ OpenAI API key configured"
fi

# Deploy edge functions
echo "🚀 Deploying Edge Functions..."
supabase functions deploy generate-content --no-verify-jwt

if [ $? -eq 0 ]; then
    echo "✅ Edge Functions deployed successfully"
else
    echo "❌ Edge Function deployment failed"
    exit 1
fi

# Create frontend environment file
echo "📝 Creating frontend environment configuration..."
cat > admin/.env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# Backend API (Edge Functions)
NEXT_PUBLIC_API_URL=$SUPABASE_URL/functions/v1

,.# AI Provider Keys (for frontend validation)
NEXT_PUBLIC_GEMINI_API_KEY=$GEMINI_KEY
NEXT_PUBLIC_ANTHROPIC_API_KEY=$ANTHROPIC_KEY
NEXT_PUBLIC_OPENAI_API_KEY=$OPENAI_KEY

# Email Config
uration (add your details)
NEXT_PUBLIC_ZOHO_SMTP_HOST=smtp.zoho.com
NEXT_PUBLIC_ZOHO_SMTP_PORT=587
NEXT_PUBLIC_ZOHO_EMAIL=your-email@domain.com
NEXT_PUBLIC_ZOHO_PASSWORD=your-app-password

# Affiliate IDs (add your affiliate IDs)
NEXT_PUBLIC_BOOKING_AFFILIATE_ID=your-booking-id
NEXT_PUBLIC_GETYOURGUIDE_AFFILIATE_ID=your-getyourguide-id
NEXT_PUBLIC_VIATOR_AFFILIATE_ID=your-viator-id
EOF

echo "✅ Environment file created: admin/.env.local"

# Build and deploy frontend
echo "🏗️  Building frontend..."
cd admin
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend built successfully"
    
    echo "🚀 Deploying to Vercel..."
    npx vercel --prod --yes
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 DEPLOYMENT COMPLETE!"
        echo "======================="
        echo ""
        echo "✅ Database: $SUPABASE_URL"
        echo "✅ Backend: $SUPABASE_URL/functions/v1"
        echo "✅ Frontend: Check Vercel output above"
        echo ""
        echo "🔗 Next Steps:"
        echo "1. Test your admin panel"
        echo "2. Generate your first blog post"
        echo "3. Check the Supabase dashboard for data"
        echo ""
        echo "📊 Monitor your platform:"
        echo "- Supabase Dashboard: https://supabase.com/dashboard/project/$PROJECT_ID"
        echo "- Edge Functions Logs: Dashboard > Edge Functions"
        echo "- Database Tables: Dashboard > Table Editor"
        echo ""
    else
        echo "❌ Vercel deployment failed"
    fi
else
    echo "❌ Frontend build failed"
    exit 1
fi

cd ..

echo "🎯 Your Travel Blog Platform is now live!"
echo "Happy blogging! 🌍✈️"