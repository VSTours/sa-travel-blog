#!/bin/bash

# Travel Blog - Production Deployment Script

set -e

echo "🚀 Deploying Travel Blog to Production..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Step 1: Building optimized production build...${NC}"
npm run build

echo -e "${BLUE}🔧 Step 2: Deploying to Vercel...${NC}"

# Set Vercel token from environment
export VERCEL_TOKEN="GMbEUeH2liD953CBC50iXFln"

# Deploy to Vercel
npx vercel --prod --yes --token=$VERCEL_TOKEN

echo -e "${GREEN}✅ Frontend deployed successfully!${NC}"

echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "1. Set up custom domain: blog.vaughnsterling.com"
echo "2. Deploy backend to Railway/Render"
echo "3. Configure environment variables on Vercel dashboard"
echo "4. Test the live deployment"

echo -e "${GREEN}🎉 Deployment Complete!${NC}"