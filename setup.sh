#!/bin/bash

echo "╔════════════════════════════════════════════════════════╗"
echo "║   Travel Blog Platform - Setup                         ║"
echo "║   AI-powered travel blog with Gemini                  ║"
echo "╚════════════════════════════════════════════════════════╝"

# Check prerequisites
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 required but not installed. Aborting." >&2; exit 1; }
command -v git >/dev/null 2>&1 || { echo "❌ Git required but not installed. Aborting." >&2; exit 1; }

echo "✅ Prerequisites checked"

# Create .env file for backend
ENV_FILE="backend/.env"

echo "Setting up environment configuration..."

# Interactive questions
read -p "Enter Gemini API Key: " GEMINI_API_KEY
read -p "Enter Unsplash API Key: " UNSPLASH_API_KEY
read -p "Enter Pexels API Key: " PEXELS_API_KEY
read -p "Enter Supabase Database URL: " DATABASE_URL
read -p "Enter Email Provider (mailchimp/convertkit/substack): " EMAIL_PROVIDER
read -p "Enter Email API Key: " EMAIL_API_KEY

# Niche selection
echo "Select your niche:"
echo "1) Luxury Resorts & Hotels"
echo "2) Safari & Wildlife"
echo "3) Adventure & Outdoor"
echo "4) Wellness & Retreats"
echo "5) Mix of Everything"
read -p "Enter choice (1-5): " NICHE_CHOICE

case $NICHE_CHOICE in
  1) NICHE="luxury-resorts";;
  2) NICHE="safari-wildlife";;
  3) NICHE="adventure-outdoor";;
  4) NICHE="wellness-retreats";;
  5) NICHE="mixed";;
  *) NICHE="luxury-resorts";;
esac

# Target market selection
echo "Select target market:"
echo "1) US Millennials"
echo "2) European Luxury Travelers"
echo "3) Asian Adventure Seekers"
echo "4) Global Digital Nomads"
read -p "Enter choice (1-4): " MARKET_CHOICE

case $MARKET_CHOICE in
  1) TARGET_MARKET="US-millennial";;
  2) TARGET_MARKET="EU-luxury";;
  3) TARGET_MARKET="ASIA-adventure";;
  4) TARGET_MARKET="global-nomad";;
  *) TARGET_MARKET="US-millennial";;
esac

# Region selection
echo "Select primary region:"
echo "1) Cape Town"
echo "2) Garden Route"
echo "3) Kruger National Park"
echo "4) All South Africa"
read -p "Enter choice (1-4): " REGION_CHOICE

case $REGION_CHOICE in
  1) REGION="Cape-Town";;
  2) REGION="Garden-Route";;
  3) REGION="Kruger";;
  4) REGION="South-Africa";;
  *) REGION="Cape-Town";;
esac

# Create backend/.env file
mkdir -p backend
cat > "$ENV_FILE" << EOF
GEMINI_API_KEY=$GEMINI_API_KEY
UNSPLASH_API_KEY=$UNSPLASH_API_KEY
PEXELS_API_KEY=$PEXELS_API_KEY
DATABASE_URL=$DATABASE_URL
EMAIL_PROVIDER=$EMAIL_PROVIDER
EMAIL_API_KEY=$EMAIL_API_KEY
NICHE=$NICHE
TARGET_MARKET=$TARGET_MARKET
REGION=$REGION
EOF

echo "✅ Environment configuration saved to $ENV_FILE"

# Create GitHub secrets script
SECRETS_SCRIPT="setup-github-secrets.sh"
cat > "$SECRETS_SCRIPT" << EOF
#!/bin/bash
gh secret set GEMINI_API_KEY --body "$GEMINI_API_KEY"
gh secret set UNSPLASH_API_KEY --body "$UNSPLASH_API_KEY"
gh secret set PEXELS_API_KEY --body "$PEXELS_API_KEY"
gh secret set DATABASE_URL --body "$DATABASE_URL"
gh secret set EMAIL_PROVIDER --body "$EMAIL_PROVIDER"
gh secret set EMAIL_API_KEY --body "$EMAIL_API_KEY"
gh secret set NICHE --body "$NICHE"
gh secret set TARGET_MARKET --body "$TARGET_MARKET"
gh secret set REGION --body "$REGION"
EOF

chmod +x "$SECRETS_SCRIPT"
echo "✅ GitHub secrets script created: $SECRETS_SCRIPT"

echo "
============================================================
  Configuration Summary
============================================================

Content Strategy:
  • Niche: $NICHE
  • Target Market: $TARGET_MARKET
  • Region: $REGION

Infrastructure:
  • AI Provider: Gemini
  • Database: Supabase
  • Repository: sa-travel-blog

Files Generated:
  • ✅ backend/.env
  • ✅ $SECRETS_SCRIPT

Next steps:
1. Run: ./setup-github-secrets.sh
2. Deploy backend: vercel --prod
3. Deploy frontend: cd frontend && vercel --prod

Your travel blog will be live at:
https://sa-travel-blog.vercel.app
"