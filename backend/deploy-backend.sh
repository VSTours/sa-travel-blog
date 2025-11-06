#!/bin/bash

# Backend Deployment Script for Railway/Render

echo "🚀 Deploying Travel Blog Backend..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📋 Backend Deployment Options:${NC}"
echo "1. Railway (Recommended)"  
echo "2. Render"
echo "3. Manual Docker deployment"

echo -e "${YELLOW}📝 Prerequisites:${NC}"
echo "✓ FastAPI backend with Dockerfile"
echo "✓ Environment variables configured"
echo "✓ Database connection (Supabase)"
echo "✓ API keys for content generation"

echo -e "${BLUE}🔧 Ready to deploy files:${NC}"
echo "• main.py - FastAPI application"
echo "• requirements.txt - Dependencies"  
echo "• Dockerfile - Container configuration"
echo "• .env - Environment variables"

echo -e "${GREEN}📁 Backend Structure:${NC}"
ls -la

echo -e "${YELLOW}⚡ Quick Deploy Commands:${NC}"
echo "Railway: railway login && railway up"
echo "Render: Connect GitHub repo at render.com"
echo "Docker: docker build -t travel-blog-backend . && docker run -p 8000:8000 travel-blog-backend"

echo -e "${GREEN}✅ Backend ready for deployment!${NC}"
echo -e "${BLUE}🌐 Once deployed, update frontend API_URL to backend URL${NC}"