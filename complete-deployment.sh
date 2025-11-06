#!/bin/bash

# Quick Production Setup Script

echo "🎉 FRONTEND DEPLOYED SUCCESSFULLY!"
echo ""
echo "📍 Live URL: https://admin-rg7bi47yl-christiaans-projects-1c25e6d7.vercel.app"
echo ""
echo "🔄 Next: Deploy Backend"
echo ""
echo "Choose your backend deployment platform:"
echo "1. Railway (Recommended - Free tier)"
echo "2. Render (Alternative)"
echo "3. Manual VPS"
echo ""

read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo "🚂 Railway Deployment Steps:"
        echo "1. Go to: https://railway.app/dashboard"
        echo "2. Click 'New Project' → 'Empty Project'"
        echo "3. Connect your GitHub repo"
        echo "4. Select 'backend' folder as root directory"
        echo "5. Railway will auto-detect Dockerfile and deploy"
        echo ""
        echo "📋 Environment Variables to Set in Railway:"
        cat backend/.env | grep -v "^#" | grep -v "^$"
        ;;
    2)
        echo "🎨 Render Deployment Steps:"
        echo "1. Go to: https://render.com/dashboard"
        echo "2. Click 'New' → 'Web Service'"
        echo "3. Connect GitHub repo, select 'backend' folder"
        echo "4. Build command: pip install -r requirements.txt"
        echo "5. Start command: uvicorn main:app --host 0.0.0.0 --port \$PORT"
        ;;
    3)
        echo "🖥️  Manual VPS Steps:"
        echo "1. SSH into your server"
        echo "2. Clone the repo and cd backend/"
        echo "3. pip install -r requirements.txt"
        echo "4. Copy .env file with your credentials"
        echo "5. Run: uvicorn main:app --host 0.0.0.0 --port 8000"
        ;;
esac

echo ""
echo "🔗 After backend deployment:"
echo "• Update NEXT_PUBLIC_API_URL in Vercel to point to your backend"
echo "• Configure custom domain: blog.vaughnsterling.com"
echo "• Test all endpoints work correctly"
echo ""
echo "✅ You're almost live with a full AI-powered travel blog!"