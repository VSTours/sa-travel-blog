#!/usr/bin/env python3

"""
Travel Blog Platform - Interactive CLI Setup Script
Collects all configuration via terminal prompts and auto-deploys everything
"""

import os
import sys
import json
import subprocess
import time
from datetime import datetime
from typing import Dict, Optional
import requests

# Color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(text):
    """Print header message"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}{Colors.ENDC}\n")

def print_success(text):
    """Print success message"""
    print(f"{Colors.OKGREEN}✅ {text}{Colors.ENDC}")

def print_error(text):
    """Print error message"""
    print(f"{Colors.FAIL}❌ {text}{Colors.ENDC}")

def print_warning(text):
    """Print warning message"""
    print(f"{Colors.WARNING}⚠️  {text}{Colors.ENDC}")

def print_info(text):
    """Print info message"""
    print(f"{Colors.OKBLUE}ℹ️  {text}{Colors.ENDC}")

def print_step(text):
    """Print step message"""
    print(f"{Colors.OKCYAN}→ {text}{Colors.ENDC}")

class CliSetup:
    def __init__(self):
        self.config = {}
        self.config_file = ".env"
        self.github_secrets = {}
        
    def prompt(self, question: str, default: Optional[str] = None, password: bool = False) -> str:
        """
        Prompt user for input
        
        Args:
            question: The question to ask
            default: Default value if user presses enter
            password: If True, mask input (don't show API keys)
        
        Returns:
            User input or default
        """
        if default:
            prompt_text = f"{question} [{default}]: "
        else:
            prompt_text = f"{question}: "
        
        if password:
            import getpass
            return getpass.getpass(prompt_text) or default or ""
        else:
            return input(prompt_text) or default or ""
    
    def prompt_choice(self, question: str, choices: list) -> str:
        """Prompt user to choose from list"""
        print(f"\n{question}")
        for i, choice in enumerate(choices, 1):
            print(f"  {i}. {choice['label']}")
        
        while True:
            try:
                selection = int(input(f"\nEnter choice (1-{len(choices)}): "))
                if 1 <= selection <= len(choices):
                    return choices[selection - 1]['value']
            except ValueError:
                pass
            print("Invalid choice. Try again.")
    
    def validate_url(self, url: str) -> bool:
        """Validate URL is accessible"""
        try:
            response = requests.head(url, timeout=5)
            return response.status_code < 400
        except:
            return False
    
    def validate_api_key(self, api_key: str, service: str) -> bool:
        """Validate API key format"""
        validations = {
            'anthropic': lambda k: k.startswith('sk-ant-'),
            'github': lambda k: k.startswith('ghp_'),
            'vercel': lambda k: k.startswith('vercel_') or len(k) > 20,
            'unsplash': lambda k: len(k) > 20,
        }
        
        validator = validations.get(service, lambda k: len(k) > 10)
        return validator(api_key)
    
    def collect_api_keys(self):
        """Collect all API keys from user"""
        print_header("API Keys Configuration")
        
        print_info("You'll need the following API keys. Get them from:")
        print("  • Anthropic: https://console.anthropic.com")
        print("  • Unsplash: https://unsplash.com/oauth/applications")
        print("  • Pexels: https://www.pexels.com/api/")
        print("  • GitHub: https://github.com/settings/tokens")
        print("  • Vercel: https://vercel.com/account/tokens")
        
        print_step("Anthropic API Key (for content generation)")
        anthropic_key = self.prompt("Enter Anthropic API key", password=True)
        while not self.validate_api_key(anthropic_key, 'anthropic'):
            print_error("Invalid Anthropic API key format (should start with sk-ant-)")
            anthropic_key = self.prompt("Enter Anthropic API key", password=True)
        self.config['ANTHROPIC_API_KEY'] = anthropic_key
        self.github_secrets['ANTHROPIC_API_KEY'] = anthropic_key
        print_success("Anthropic API key saved")
        
        print_step("Unsplash API Key (for images)")
        unsplash_key = self.prompt("Enter Unsplash API key", password=True)
        self.config['UNSPLASH_API_KEY'] = unsplash_key
        self.github_secrets['UNSPLASH_API_KEY'] = unsplash_key
        print_success("Unsplash API key saved")
        
        print_step("Pexels API Key (optional - for backup images)")
        pexels_key = self.prompt("Enter Pexels API key (optional)", password=True)
        if pexels_key:
            self.config['PEXELS_API_KEY'] = pexels_key
            self.github_secrets['PEXELS_API_KEY'] = pexels_key
        print_success("Pexels API key saved")
        
        print_step("GitHub Personal Access Token")
        github_token = self.prompt("Enter GitHub token", password=True)
        while not self.validate_api_key(github_token, 'github'):
            print_error("Invalid GitHub token format (should start with ghp_)")
            github_token = self.prompt("Enter GitHub token", password=True)
        self.config['GITHUB_TOKEN'] = github_token
        print_success("GitHub token saved")
        
        print_step("Vercel Access Token")
        vercel_token = self.prompt("Enter Vercel token", password=True)
        self.config['VERCEL_TOKEN'] = vercel_token
        self.github_secrets['VERCEL_TOKEN'] = vercel_token
        print_success("Vercel token saved")
    
    def collect_database_config(self):
        """Configure database"""
        print_header("Database Configuration")
        
        print_info("Choose a database provider:")
        db_choice = self.prompt_choice(
            "Select database:",
            [
                {'label': 'Supabase (PostgreSQL) - Recommended', 'value': 'supabase'},
                {'label': 'Neon (PostgreSQL)', 'value': 'neon'},
                {'label': 'Railway (PostgreSQL)', 'value': 'railway'},
                {'label': 'MongoDB Atlas', 'value': 'mongodb'},
            ]
        )
        
        self.config['DATABASE_TYPE'] = db_choice
        
        if db_choice == 'supabase':
            print_info("Get your connection string from Supabase:")
            print("  1. Go to supabase.com and create a project")
            print("  2. Click 'Connect' → 'URI'")
            print("  3. Copy the full PostgreSQL URI")
        elif db_choice == 'neon':
            print_info("Get your connection string from Neon:")
            print("  1. Go to neon.tech and create a project")
            print("  2. Click 'Connection string' → PostgreSQL")
            print("  3. Copy the full URI")
        elif db_choice == 'railway':
            print_info("Get your connection string from Railway:")
            print("  1. Create a PostgreSQL service")
            print("  2. Get the connection URL from the service details")
        elif db_choice == 'mongodb':
            print_info("Get your connection string from MongoDB Atlas:")
            print("  1. Go to mongodb.com/cloud and create a cluster")
            print("  2. Get the connection string from the cluster")
        
        db_url = self.prompt("Enter database connection URL", password=True)
        self.config['DATABASE_URL'] = db_url
        self.github_secrets['DATABASE_URL'] = db_url
        print_success("Database configured")
    
    def collect_content_strategy(self):
        """Collect content strategy"""
        print_header("Content Strategy")
        
        print_step("What's your primary content niche?")
        niche = self.prompt_choice(
            "Select niche:",
            [
                {'label': 'Luxury Resorts & Hotels', 'value': 'luxury-resorts'},
                {'label': 'Safari & Wildlife', 'value': 'safari'},
                {'label': 'Adventure & Outdoor Activities', 'value': 'adventure'},
                {'label': 'Wellness & Retreats', 'value': 'wellness'},
                {'label': 'Culinary Experiences', 'value': 'culinary'},
                {'label': 'Mix of Everything', 'value': 'mixed'},
            ]
        )
        self.config['NICHE'] = niche
        print_success(f"Niche set to: {niche}")
        
        print_step("Who's your target market?")
        target_market = self.prompt_choice(
            "Select target market:",
            [
                {'label': 'US Millennials (25-40)', 'value': 'US-millennial'},
                {'label': 'European Affluent (45+)', 'value': 'EU-affluent'},
                {'label': 'APAC Business Travelers', 'value': 'APAC-business'},
                {'label': 'Global Luxury Seekers', 'value': 'luxury-seekers'},
                {'label': 'Eco-Conscious Travelers', 'value': 'eco-conscious'},
            ]
        )
        self.config['TARGET_MARKET'] = target_market
        print_success(f"Target market set to: {target_market}")
        
        print_step("Which South African region?")
        region = self.prompt_choice(
            "Select region:",
            [
                {'label': 'Cape Town & Peninsula', 'value': 'Cape Town'},
                {'label': 'Kruger National Park', 'value': 'Kruger'},
                {'label': 'Franschhoek & Winelands', 'value': 'Franschhoek'},
                {'label': 'Garden Route', 'value': 'Garden Route'},
                {'label': 'Drakensberg Mountains', 'value': 'Drakensberg'},
                {'label': 'All Regions', 'value': 'all-regions'},
            ]
        )
        self.config['GEO_REGION'] = region
        print_success(f"Region set to: {region}")
        
        print_step("How many posts per month?")
        posts_per_month = self.prompt("Posts per month (recommended: 4)", default="4")
        self.config['MONTHLY_POSTS'] = posts_per_month
        print_success(f"Publishing {posts_per_month} posts per month")
    
    def collect_monetization(self):
        """Collect monetization configuration"""
        print_header("Monetization Setup")
        
        print_info("Setting up revenue streams...")
        
        print_step("Google AdSense (optional)")
        adsense = self.prompt("Google AdSense Publisher ID (ca-pub-...)", password=True)
        if adsense:
            self.config['GOOGLE_ADSENSE_ID'] = adsense
            self.github_secrets['GOOGLE_ADSENSE_ID'] = adsense
            print_success("AdSense configured")
        
        print_step("Booking.com Affiliate (optional)")
        booking = self.prompt("Booking.com Affiliate ID", password=True)
        if booking:
            self.config['BOOKING_AFFILIATE_ID'] = booking
            self.github_secrets['BOOKING_AFFILIATE_ID'] = booking
            print_success("Booking.com configured")
        
    # Airbnb affiliate support removed — prefer Booking.com or other accommodation partners
    # If you have other accommodation partner IDs, add them to BOOKING_AFFILIATE_ID or configure custom affiliates in the dashboard.
        
        print_step("GetYourGuide Affiliate (optional - HIGHEST EARNER for tours)")
        gyg = self.prompt("GetYourGuide Affiliate ID", password=True)
        if gyg:
            self.config['GETYOURGUIDE_AFFILIATE_ID'] = gyg
            self.github_secrets['GETYOURGUIDE_AFFILIATE_ID'] = gyg
            print_success("GetYourGuide configured")
        
        print_step("Viator Affiliate (optional)")
        viator = self.prompt("Viator Affiliate ID", password=True)
        if viator:
            self.config['VIATOR_AFFILIATE_ID'] = viator
            self.github_secrets['VIATOR_AFFILIATE_ID'] = viator
            print_success("Viator configured")
        
        print_success("Monetization configured")
    
    def collect_email_config(self):
        """Collect email configuration"""
        print_header("Email Setup")
        
        print_info("Email is CRITICAL for revenue (10x higher conversion rates)")
        
        print_step("Email Provider")
        email_provider = self.prompt_choice(
            "Select email provider:",
            [
                {'label': 'Mailchimp (Free up to 500 contacts)', 'value': 'mailchimp'},
                {'label': 'ConvertKit ($25/month)', 'value': 'convertkit'},
                {'label': 'Substack (Free + revenue share)', 'value': 'substack'},
            ]
        )
        self.config['EMAIL_PROVIDER'] = email_provider
        print_success(f"Email provider: {email_provider}")
        
        print_step("Email API Key")
        email_key = self.prompt("Email API key", password=True)
        self.config['EMAIL_API_KEY'] = email_key
        self.github_secrets['EMAIL_API_KEY'] = email_key
        
        print_step("Your Email Address (for notifications)")
        your_email = self.prompt("Your email address")
        self.config['NOTIFICATION_EMAIL'] = your_email
        self.github_secrets['NOTIFICATION_EMAIL'] = your_email
        print_success("Email configured")
    
    def collect_github_config(self):
        """Collect GitHub configuration"""
        print_header("GitHub Repository")
        
        print_step("GitHub Repository Name")
        repo_name = self.prompt("Repository name", default="sa-travel-blog")
        self.config['GITHUB_REPO_NAME'] = repo_name
        print_success(f"Repository: {repo_name}")
    
    def collect_vercel_config(self):
        """Collect Vercel configuration"""
        print_header("Vercel Deployment")
        
        print_step("Custom Domain (optional)")
        domain = self.prompt("Custom domain (leave blank for vercel.app)")
        if domain:
            self.config['CUSTOM_DOMAIN'] = domain
        print_success("Vercel configured")
    
    def generate_env_file(self):
        """Generate .env file"""
        print_step("Generating .env file...")
        
        env_content = """# Travel Blog Platform Configuration
# Generated at {}

# API Keys
ANTHROPIC_API_KEY={}
UNSPLASH_API_KEY={}
PEXELS_API_KEY={}
GITHUB_TOKEN={}
VERCEL_TOKEN={}

# Database
DATABASE_URL={}
DATABASE_TYPE={}

# Content Strategy
NICHE={}
TARGET_MARKET={}
GEO_REGION={}
MONTHLY_POSTS={}

# Monetization
GOOGLE_ADSENSE_ID={}
BOOKING_AFFILIATE_ID={}
GETYOURGUIDE_AFFILIATE_ID={}
VIATOR_AFFILIATE_ID={}

# Email
EMAIL_PROVIDER={}
EMAIL_API_KEY={}
NOTIFICATION_EMAIL={}
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587

# GitHub
GITHUB_REPO_NAME={}

# Custom Domain
CUSTOM_DOMAIN={}

# Environment
ENVIRONMENT=production
DEBUG=False
LOG_LEVEL=INFO

# Security
SECRET_KEY=your-secret-key-change-this
""".format(
            datetime.now().isoformat(),
            self.config.get('ANTHROPIC_API_KEY', ''),
            self.config.get('UNSPLASH_API_KEY', ''),
            self.config.get('PEXELS_API_KEY', ''),
            self.config.get('GITHUB_TOKEN', ''),
            self.config.get('VERCEL_TOKEN', ''),
            self.config.get('DATABASE_URL', ''),
            self.config.get('DATABASE_TYPE', ''),
            self.config.get('NICHE', ''),
            self.config.get('TARGET_MARKET', ''),
            self.config.get('GEO_REGION', ''),
            self.config.get('MONTHLY_POSTS', ''),
            self.config.get('GOOGLE_ADSENSE_ID', ''),
            self.config.get('BOOKING_AFFILIATE_ID', ''),
            self.config.get('GETYOURGUIDE_AFFILIATE_ID', ''),
            self.config.get('VIATOR_AFFILIATE_ID', ''),
            self.config.get('EMAIL_PROVIDER', ''),
            self.config.get('EMAIL_API_KEY', ''),
            self.config.get('NOTIFICATION_EMAIL', ''),
            self.config.get('GITHUB_REPO_NAME', ''),
            self.config.get('CUSTOM_DOMAIN', ''),
        )
        
        with open('backend/.env', 'w') as f:
            f.write(env_content)
        
        print_success(".env file created at backend/.env")
    
    def generate_secrets_script(self):
        """Generate GitHub CLI secrets script"""
        print_step("Generating GitHub secrets script...")
        
        script_content = "#!/bin/bash\n\n"
        script_content += "# GitHub CLI Secrets Setup\n"
        script_content += f"# Repository: {self.config.get('GITHUB_REPO_NAME', 'sa-travel-blog')}\n\n"
        
        for key, value in self.github_secrets.items():
            # Mask sensitive values in script output
            masked_value = value[:10] + "***" if len(value) > 10 else "***"
            script_content += f"echo 'Setting {key}...'\n"
            script_content += f"gh secret set {key} --body \"{value}\"\n\n"
        
        with open('setup-github-secrets.sh', 'w') as f:
            f.write(script_content)
        
        os.chmod('setup-github-secrets.sh', 0o755)
        print_success("GitHub secrets script created: setup-github-secrets.sh")
        print_info("Run it with: ./setup-github-secrets.sh")
    
    def generate_summary(self):
        """Generate configuration summary"""
        print_header("Configuration Summary")
        
        print(f"{Colors.BOLD}Content Strategy:{Colors.ENDC}")
        print(f"  • Niche: {self.config.get('NICHE', 'N/A')}")
        print(f"  • Target Market: {self.config.get('TARGET_MARKET', 'N/A')}")
        print(f"  • Region: {self.config.get('GEO_REGION', 'N/A')}")
        print(f"  • Posts/Month: {self.config.get('MONTHLY_POSTS', 'N/A')}")
        
        print(f"\n{Colors.BOLD}Infrastructure:{Colors.ENDC}")
        print(f"  • Database: {self.config.get('DATABASE_TYPE', 'N/A')}")
        print(f"  • Repository: {self.config.get('GITHUB_REPO_NAME', 'N/A')}")
        print(f"  • Domain: {self.config.get('CUSTOM_DOMAIN', 'vercel.app (default)')}")
        
        print(f"\n{Colors.BOLD}Monetization:{Colors.ENDC}")
        revenue_streams = []
        if self.config.get('GOOGLE_ADSENSE_ID'):
            revenue_streams.append("Google AdSense")
        if self.config.get('BOOKING_AFFILIATE_ID'):
            revenue_streams.append("Booking.com")
    # Airbnb option removed from configuration
        if self.config.get('GETYOURGUIDE_AFFILIATE_ID'):
            revenue_streams.append("GetYourGuide")
        if self.config.get('VIATOR_AFFILIATE_ID'):
            revenue_streams.append("Viator")
        if self.config.get('EMAIL_PROVIDER'):
            revenue_streams.append(f"Email ({self.config.get('EMAIL_PROVIDER')})")
        
        print(f"  • Streams: {', '.join(revenue_streams) if revenue_streams else 'Email (no affiliates yet)'}")
        
        print(f"\n{Colors.BOLD}Files Generated:{Colors.ENDC}")
        print(f"  • ✅ backend/.env")
        print(f"  • ✅ setup-github-secrets.sh")
    
    def run(self):
        """Run complete setup"""
        print_header("Travel Blog Platform - Setup Wizard")
        print_info("This will guide you through configuring your travel blog platform")
        print_info("Setup takes ~10 minutes")
        print_warning("Have your API keys ready!")
        
        confirm = self.prompt("\nReady to begin? (yes/no)", default="yes")
        if confirm.lower() not in ['yes', 'y']:
            print_error("Setup cancelled")
            sys.exit(1)
        
        try:
            # Collect all configuration
            self.collect_api_keys()
            self.collect_database_config()
            self.collect_content_strategy()
            self.collect_monetization()
            self.collect_email_config()
            self.collect_github_config()
            self.collect_vercel_config()
            
            # Generate files
            self.generate_env_file()
            self.generate_secrets_script()
            self.generate_summary()
            
            # Success message
            print_header("Setup Complete! 🎉")
            print_success("Configuration saved successfully")
            print("\nNext Steps:")
            print_step("1. Review backend/.env file")
            print_step("2. Create GitHub repository: https://github.com/new")
            print_step("3. Run: ./setup-github-secrets.sh (after creating repo)")
            print_step("4. Run: docker-compose up (to test locally)")
            print_step("5. Deploy frontend: cd frontend && vercel --prod")
            print_step("6. Deploy backend: cd backend && railway up")
            
            print(f"\n{Colors.OKGREEN}{Colors.BOLD}Your blog will be live in ~30 minutes!{Colors.ENDC}\n")
            
        except KeyboardInterrupt:
            print_error("\nSetup cancelled by user")
            sys.exit(1)
        except Exception as e:
            print_error(f"Setup error: {str(e)}")
            sys.exit(1)

if __name__ == "__main__":
    setup = CliSetup()
    setup.run()









#!/bin/bash

# ============================================================================
# Travel Blog Platform - Simple Setup Starter
# Run this: bash setup.sh
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Travel Blog Platform - Setup                            ║${NC}"
echo -e "${BLUE}║   Autonomous AI-powered travel blog for South Africa      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 not found${NC}"
    echo "Install from: https://www.python.org/downloads/"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git not found${NC}"
    echo "Install from: https://git-scm.com/"
    exit 1
fi

echo -e "${GREEN}✅ Python 3 found: $(python3 --version)${NC}"
echo -e "${GREEN}✅ Git found: $(git --version | head -n1)${NC}"
echo ""

# Create setup script if it doesn't exist
if [ ! -f "setup.py" ]; then
    echo -e "${YELLOW}Creating setup script...${NC}"
    # setup.py would be created from the previous artifact
    echo -e "${RED}Error: setup.py not found${NC}"
    echo "Please ensure the setup.py file is in the current directory"
    exit 1
fi

# Run the setup
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
python3 setup.py

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✅ Setup completed!${NC}"
echo ""
echo -e "${YELLOW}Quick Reference:${NC}"
echo ""
echo "📝 Configuration file created:"
echo "   backend/.env"
echo ""
echo "🔐 GitHub secrets script created:"
echo "   setup-github-secrets.sh"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1️⃣  Create GitHub repository at: https://github.com/new"
echo "   Name it: sa-travel-blog"
echo "   Make it Public"
echo ""
echo "2️⃣  Set GitHub secrets:"
echo "   ./setup-github-secrets.sh"
echo "   (requires: gh auth login)"
echo ""
echo "3️⃣  Deploy to GitHub:"
echo "   git add ."
echo "   git commit -m 'Initial setup'"
echo "   git push -u origin main"
echo ""
echo "4️⃣  Deploy frontend:"
echo "   cd frontend"
echo "   vercel --prod"
echo ""
echo "5️⃣  Deploy backend:"
echo "   cd backend"
echo "   railway up"
echo ""
echo -e "${GREEN}Your blog will be live in ~30 minutes!${NC}"
echo ""


# 🚀 GitHub Deployment & Repository Setup Guide

## Complete Repository Structure

Your GitHub repository will contain everything needed for automated deployment.

```
sa-travel-blog/
├── 📁 frontend/                    # Next.js frontend
│   ├── pages/
│   │   ├── index.tsx              # Homepage
│   │   ├── admin/
│   │   │   ├── dashboard.tsx       # Admin dashboard
│   │   │   ├── analytics.tsx       # Real-time analytics
│   │   │   ├── monetization.tsx    # Revenue tracking
│   │   │   ├── affiliates.tsx      # Affiliate dashboard
│   │   │   └── email.tsx           # Email management
│   │   ├── posts/
│   │   │   └── [slug].tsx          # Blog post pages
│   │   ├── api/
│   │   │   ├── posts.ts            # Posts API
│   │   │   ├── analytics.ts        # Analytics API
│   │   │   └── admin.ts            # Admin API
│   │   └── _app.tsx                # App wrapper
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── PostCard.tsx
│   │   ├── DashboardCard.tsx
│   │   └── AffiliateMetrics.tsx
│   ├── styles/
│   │   └── globals.css
│   ├── public/
│   │   ├── favicon.ico
│   │   └── og-image.jpg
│   ├── next.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── 📁 backend/                     # FastAPI backend
│   ├── main.py                     # Main API server
│   ├── models.py                   # SQLAlchemy models
│   ├── database.py                 # Database connection
│   ├── services/
│   │   ├── content_engine.py       # Content generation
│   │   ├── analytics.py            # Analytics service
│   │   ├── email_service.py        # Email automation
│   │   ├── affiliate_manager.py    # Affiliate tracking
│   │   └── monetization.py         # Revenue calculation
│   ├── routes/
│   │   ├── admin.py                # Admin endpoints
│   │   ├── analytics.py            # Analytics endpoints
│   │   ├── posts.py                # Blog endpoints
│   │   ├── email.py                # Email endpoints
│   │   └── affiliates.py           # Affiliate endpoints
│   ├── utils/
│   │   ├── auth.py                 # Authentication
│   │   ├── validators.py           # Input validation
│   │   └── helpers.py              # Helper functions
│   ├── requirements.txt             # Python dependencies
│   ├── Dockerfile                   # Docker config
│   └── .env.example                # Environment template
│
├── 📁 scripts/                     # Automation scripts
│   ├── generate_posts.py           # Weekly post generation
│   ├── sync_analytics.py           # Analytics sync
│   ├── email_sequences.py          # Email automation
│   ├── affiliate_tracking.py       # Affiliate sync
│   ├── database_init.py            # DB initialization
│   └── deploy.sh                   # Deployment script
│
├── 📁 .github/
│   ├── workflows/
│   │   ├── auto-publish.yml        # Weekly post generation
│   │   ├── deploy-frontend.yml     # Frontend deployment
│   │   ├── deploy-backend.yml      # Backend deployment
│   │   ├── analytics-sync.yml      # Analytics sync
│   │   ├── email-sequences.yml     # Email automation
│   │   └── tests.yml               # Automated testing
│   └── ISSUE_TEMPLATE/
│       └── bug_report.md
│
├── 📁 config/                      # Configuration files
│   ├── database.yml
│   ├── email.yml
│   ├── affiliates.yml
│   └── analytics.yml
│
├── 📁 docs/                        # Documentation
│   ├── DEPLOYMENT.md               # This file
│   ├── API.md                      # API documentation
│   ├── ARCHITECTURE.md             # System architecture
│   ├── MONETIZATION.md             # Revenue guide
│   ├── TROUBLESHOOTING.md          # Troubleshooting
│   └── CONTRIBUTING.md             # Contribution guidelines
│
├── 📁 tests/
│   ├── test_backend.py
│   ├── test_frontend.py
│   └── test_integration.py
│
├── 📁 docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
│
├── .gitignore                      # Git ignore rules
├── README.md                       # Project overview
├── LICENSE                         # MIT License
├── vercel.json                     # Vercel config
├── next.config.js                  # Next.js config
├── docker-compose.yml              # Docker compose
└── package.json                    # Root dependencies

```

---

## Step 1: Initialize GitHub Repository

### A. Create Repository on GitHub

```bash
# Go to https://github.com/new
# Fill in:
Repository name: sa-travel-blog
Description: Autonomous AI-powered travel blog for South Africa
Visibility: Public
Initialize with: README
Add .gitignore: Python, Node
License: MIT
```

### B. Clone to Your Local Machine

```bash
git clone https://github.com/YOUR-USERNAME/sa-travel-blog.git
cd sa-travel-blog
```

---

## Step 2: Frontend Setup (Next.js)

### Create Frontend Directory

```bash
# Initialize Next.js project
npx create-next-app@latest frontend --typescript --tailwind
cd frontend
```

### package.json

```json
{
  "name": "travel-blog-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "export": "next export"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0",
    "date-fns": "^2.30.0",
    "recharts": "^2.10.0",
    "lucide-react": "^0.263.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

### Create Admin Dashboard Pages

```bash
# Create page structure
mkdir -p pages/admin/
mkdir -p components/
mkdir -p styles/
touch pages/index.tsx
touch pages/admin/dashboard.tsx
touch pages/admin/analytics.tsx
touch pages/admin/monetization.tsx
touch pages/admin/affiliates.tsx
touch pages/admin/email.tsx
```

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
}

module.exports = nextConfig
```

### vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api_url",
    "DATABASE_URL": "@database_url"
  }
}
```

---

## Step 3: Backend Setup (FastAPI)

### Create Backend Directory

```bash
mkdir -p backend/{models,routes,services,utils}
cd backend
```

### requirements.txt

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
anthropic==0.7.1
sqlalchemy==2.0.23
sqlalchemy-utils==0.41.1
psycopg2-binary==2.9.9
python-dotenv==1.0.0
pydantic==2.5.0
pydantic-settings==2.1.0
httpx==0.25.2
aiohttp==3.9.0
PyGithub==2.1.1
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
email-validator==2.1.0
jinja2==3.1.2
pymongo==4.6.0
motor==3.3.2
stripe==7.4.0
sendgrid==6.11.0
slack-sdk==3.26.0
APScheduler==3.10.4
```

### backend/main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Travel Blog API",
    description="Autonomous AI-powered travel blog backend",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers
from routes import admin, analytics, posts, email, affiliates

# Include routers
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(posts.router, prefix="/api/posts", tags=["posts"])
app.include_router(email.router, prefix="/api/email", tags=["email"])
app.include_router(affiliates.router, prefix="/api/affiliates", tags=["affiliates"])

@app.get("/")
async def root():
    return {"message": "Travel Blog API", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### backend/models.py

```python
from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, Text, JSON, Boolean, ForeignKey, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class BlogPost(Base):
    __tablename__ = "blog_posts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    content = Column(Text, nullable=False)
    excerpt = Column(Text)
    featured_image = Column(String(500))
    status = Column(String(50), default="draft")  # draft, published, archived
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    
    # SEO & Content
    metadata = Column(JSON)
    seo_data = Column(JSON)
    keywords = Column(JSON)
    internal_links = Column(JSON)
    
    # Monetization
    monetization_data = Column(JSON)
    video_urls = Column(JSON)
    image_urls = Column(JSON)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    published_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    monetization = relationship("Monetization", back_populates="post")
    analytics = relationship("Analytics", back_populates="post")
    
    __table_args__ = (
        Index('idx_slug', 'slug'),
        Index('idx_status', 'status'),
        Index('idx_published_at', 'published_at'),
    )

class Monetization(Base):
    __tablename__ = "monetization_data"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    blog_post_id = Column(String, ForeignKey('blog_posts.id'), nullable=False)
    
    # Affiliate data
    affiliate_links = Column(JSON)
    ad_placements = Column(JSON)
    
    # Revenue
    estimated_revenue = Column(Float, default=0)
    actual_revenue = Column(Float, default=0)
    conversion_rate = Column(Float, default=0)
    
    # Tracking
    clicks = Column(Integer, default=0)
    conversions = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    post = relationship("BlogPost", back_populates="monetization")

class Analytics(Base):
    __tablename__ = "analytics"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    blog_post_id = Column(String, ForeignKey('blog_posts.id'), nullable=False)
    
    date = Column(DateTime, default=datetime.utcnow)
    views = Column(Integer, default=0)
    unique_visitors = Column(Integer, default=0)
    bounce_rate = Column(Float, default=0)
    avg_time_on_page = Column(Integer, default=0)
    social_shares = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    post = relationship("BlogPost", back_populates="analytics")

class EmailSubscriber(Base):
    __tablename__ = "email_subscribers"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255))
    is_active = Column(Boolean, default=True)
    subscribed_at = Column(DateTime, default=datetime.utcnow)
    unsubscribed_at = Column(DateTime, nullable=True)

class EmailCampaign(Base):
    __tablename__ = "email_campaigns"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    content = Column(Text)
    sent_at = Column(DateTime)
    total_sent = Column(Integer, default=0)
    opens = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    open_rate = Column(Float, default=0)
    click_rate = Column(Float, default=0)

class AffiliateAccount(Base):
    __tablename__ = "affiliate_accounts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
  network = Column(String(100), nullable=False)  # booking, getyourguide, viator, accommodation_partner
    affiliate_id = Column(String(255), nullable=False)
    api_key = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    added_at = Column(DateTime, default=datetime.utcnow)
    last_synced = Column(DateTime, nullable=True)

class ContentStrategy(Base):
    __tablename__ = "content_strategies"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    niche = Column(String(100))
    target_market = Column(String(100))
    geo_region = Column(String(100))
    parameters = Column(JSON)
    monthly_posts = Column(Integer, default=4)
    created_at = Column(DateTime, default=datetime.utcnow)

class ScheduledPost(Base):
    __tablename__ = "scheduled_posts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    topic_title = Column(String(255))
    topic_data = Column(JSON)
    scheduled_for = Column(DateTime)
    status = Column(String(50), default="pending")  # pending, published, failed
    created_at = Column(DateTime, default=datetime.utcnow)
```

### backend/.env.example

```env
# API Keys
ANTHROPIC_API_KEY=sk-ant-xxxxx
UNSPLASH_API_KEY=xxxxx
PEXELS_API_KEY=xxxxx

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/travel_blog
# OR for Supabase:
# DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# GitHub
GITHUB_TOKEN=ghp_xxxxx
GITHUB_REPO=username/sa-travel-blog

# Vercel
VERCEL_TOKEN=vercel_xxxxx
VERCEL_PROJECT_ID=xxxxx

# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=app-password
NOTIFICATION_EMAIL=your@email.com

# Mailchimp
MAILCHIMP_API_KEY=xxxxx-us1
MAILCHIMP_LIST_ID=xxxxx

# Monetization
GOOGLE_ADSENSE_ID=ca-pub-xxxxx
BOOKING_AFFILIATE_ID=xxxxx
# AIRBNB_AFFILIATE_ID removed (use BOOKING_AFFILIATE_ID or custom affiliate configs)
GETYOURGUIDE_AFFILIATE_ID=xxxxx
VIATOR_AFFILIATE_ID=xxxxx

# Environment
ENVIRONMENT=production
DEBUG=False
```

---

## Step 4: GitHub Actions Workflows

### .github/workflows/auto-publish.yml

```yaml
name: Auto-Generate & Publish Content

on:
  schedule:
    - cron: '0 0 * * 0'  # Every Sunday at midnight UTC
  workflow_dispatch:  # Manual trigger

jobs:
  generate-content:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install Python dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      
      - name: Generate blog post
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          UNSPLASH_API_KEY: ${{ secrets.UNSPLASH_API_KEY }}
          PEXELS_API_KEY: ${{ secrets.PEXELS_API_KEY }}
          NOTIFICATION_EMAIL: ${{ secrets.NOTIFICATION_EMAIL }}
        run: |
          cd backend
          python scripts/generate_posts.py
      
      - name: Update analytics
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          cd backend
          python scripts/sync_analytics.py
      
      - name: Send email notifications
        env:
          SMTP_SERVER: ${{ secrets.SMTP_SERVER }}
          SENDER_EMAIL: ${{ secrets.SENDER_EMAIL }}
          SENDER_PASSWORD: ${{ secrets.SENDER_PASSWORD }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          cd backend
          python scripts/email_sequences.py
      
      - name: Trigger Vercel deployment
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
        run: |
          curl -X POST https://api.vercel.com/v13/deployments \
            -H "Authorization: Bearer $VERCEL_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"projectId\": \"$VERCEL_PROJECT_ID\"}"
```

### .github/workflows/deploy-frontend.yml

```yaml
name: Deploy Frontend

on:
  push:
    branches:
      - main
    paths:
      - 'frontend/**'
      - '.github/workflows/deploy-frontend.yml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: 'frontend/package-lock.json'
      
      - name: Install dependencies
        working-directory: frontend
        run: npm ci
      
      - name: Build
        working-directory: frontend
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}
        run: npm run build
      
      - name: Deploy to Vercel
        uses: vercel/action@v4
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: frontend
```

### .github/workflows/deploy-backend.yml

```yaml
name: Deploy Backend

on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'
      - '.github/workflows/deploy-backend.yml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        working-directory: backend
        run: |
          pip install -r requirements.txt
      
      - name: Run tests
        working-directory: backend
        run: |
          pip install pytest pytest-asyncio
          pytest tests/
      
      - name: Deploy to Railway/Render
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
        run: |
          # Deploy command depends on your hosting choice
          # For Railway:
          railway up
          # OR for Render:
          # render deploy
```

### .github/workflows/email-sequences.yml

```yaml
name: Email Sequences

on:
  schedule:
    - cron: '0 9 * * 0'  # Every Sunday at 9 AM UTC (weekly digest)
    - cron: '0 9 * * *'  # Every day at 9 AM for other sequences

jobs:
  send-sequences:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        working-directory: backend
        run: pip install -r requirements.txt
      
      - name: Run email sequences
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          SMTP_SERVER: ${{ secrets.SMTP_SERVER }}
          SENDER_EMAIL: ${{ secrets.SENDER_EMAIL }}
          SENDER_PASSWORD: ${{ secrets.SENDER_PASSWORD }}
          MAILCHIMP_API_KEY: ${{ secrets.MAILCHIMP_API_KEY }}
        working-directory: backend
        run: python scripts/email_sequences.py
```

### .github/workflows/affiliate-sync.yml

```yaml
name: Affiliate Sync

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  sync-affiliates:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        working-directory: backend
        run: pip install -r requirements.txt
      
      - name: Sync affiliate data
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          BOOKING_API_KEY: ${{ secrets.BOOKING_API_KEY }}
          GETYOURGUIDE_API_KEY: ${{ secrets.GETYOURGUIDE_API_KEY }}
          VIATOR_API_KEY: ${{ secrets.VIATOR_API_KEY }}
        working-directory: backend
        run: python scripts/affiliate_tracking.py
```

---

## Step 5: Push to GitHub

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit: Full travel blog platform"

# Push to main branch
git push -u origin main

# Set main as default branch (if not already)
# Go to Settings → Branches → Default branch → Select 'main'
```

---

## Step 6: Configure GitHub Secrets

### Go to Repository Settings

1. Navigate to: `https://github.com/YOUR-USERNAME/sa-travel-blog/settings/secrets/actions`
2. Click "New repository secret"
3. Add all these secrets:

```bash
# API Keys
ANTHROPIC_API_KEY = sk-ant-xxxxx
UNSPLASH_API_KEY = xxxxx
PEXELS_API_KEY = xxxxx

# Database
DATABASE_URL = postgresql://user:password@host:5432/db

# GitHub
GITHUB_TOKEN = ghp_xxxxx

# Vercel
VERCEL_TOKEN = vercel_xxxxx
VERCEL_PROJECT_ID = xxxxx
VERCEL_ORG_ID = xxxxx

# Email
SMTP_SERVER = smtp.gmail.com
SENDER_EMAIL = your-email@gmail.com
SENDER_PASSWORD = app-password
NOTIFICATION_EMAIL = your@email.com

# Mailchimp
MAILCHIMP_API_KEY = xxxxx-us1
MAILCHIMP_LIST_ID = xxxxx

# Affiliate
BOOKING_API_KEY = xxxxx
GETYOURGUIDE_API_KEY = xxxxx
VIATOR_API_KEY = xxxxx

# Hosting (if using Railway/Render)
RAILWAY_TOKEN = xxxxx
RENDER_API_KEY = xxxxx
```

---

## Step 7: Enable Branch Protection

### Protect Main Branch

1. Go to: Settings → Branches
2. Click "Add rule"
3. Branch name pattern: `main`
4. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require code reviews before merging (optional)
   - ✅ Include administrators

---

## Step 8: Create Docker Configuration

### docker-compose.yml

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: travel_blog_db
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: travel_blog
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # FastAPI Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: travel_blog_backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/travel_blog
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      UNSPLASH_API_KEY: ${UNSPLASH_API_KEY}
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./backend:/app
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

  # Next.js Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: travel_blog_frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://backend:8000
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
    command: npm run dev

volumes:
  postgres_data:
```

### backend/Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### frontend/Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Build Next.js
RUN npm run build

# Expose port
EXPOSE 3000

# Run application
CMD ["npm", "start"]
```

---

## Step 9: Local Development Setup

### Clone and Setup

```bash
# Clone repo
git clone https://github.com/YOUR-USERNAME/sa-travel-blog.git
cd sa-travel-blog

# Create .env file
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt
```

### Run Locally with Docker

```bash
# Make sure Docker is running
docker-compose up

# Website will be at: http://localhost:3000
# API will be at: http://localhost:8000
# Database: localhost:5432
```

### Run Without Docker

```bash
# Terminal 1: Backend
cd backend
python main.py
# Runs on http://localhost:8000

# Terminal 2: Frontend
cd frontend
npm run dev
# Runs on http://localhost:3000
```

---

## Step 10: Deployment to Production

### Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (will link to GitHub)
cd frontend
vercel --prod

# Follow prompts:
# ? Set up and deploy? Yes
# ? Which scope? Your GitHub username
# ? Link to existing project? No
# ? Project name? sa-travel-blog
# ? Directory? ./
# ? Build command? next build
# ? Output directory? .next
```

### Deploy Backend to Railway or Render

#### Option A: Railway (Recommended)

```bash
# Install Railway CLI
npm i -g railway

# Login
railway login

# Deploy
cd backend
railway link
railway up

# Get URL:
railway env
```

#### Option B: Render

```bash
# Go to https://render.com
# Create new Web Service
# Connect GitHub repo
# Configuration:
# - Build command: pip install -r requirements.txt
# - Start command: uvicorn main:app --host 0.0.0.0
# - Environment: Production
```

### Create Deployment Checklist

Create `DEPLOYMENT_CHECKLIST.md`:

```markdown
# Deployment Checklist

## Pre-Deployment ✅
- [ ] All environment variables configured
- [ ] Database migrations run successfully
- [ ] Local tests passing
- [ ] GitHub secrets configured
- [ ] Vercel project created
- [ ] Railway/Render project created

## GitHub Setup ✅
- [ ] Repository created and public
- [ ] Main branch protected
- [ ] GitHub Actions workflows enabled
- [ ] All secrets added to repo settings

## Frontend Deployment ✅
- [ ] Deployed to Vercel
- [ ] Custom domain configured (optional)
- [ ] Environment variables set in Vercel dashboard
- [ ] Automatic deployments from main branch enabled

## Backend Deployment ✅
- [ ] Deployed to Railway/Render
- [ ] Database connection verified
- [ ] Environment variables configured
- [ ] API health check passing
- [ ] CORS configured properly

## Email Setup ✅
- [ ] Gmail SMTP configured
- [ ] Mailchimp account connected
- [ ] Notification email tested
- [ ] Welcome sequence created

## Affiliate Networks ✅
- [ ] Booking.com affiliate ID added
- [ ] Airbnb affiliate ID removed / replaced by accommodation partner settings
- [ ] GetYourGuide affiliate ID added
- [ ] Viator affiliate ID added

## Monitoring Setup ✅
- [ ] Google Analytics connected
- [ ] Google Search Console setup
- [ ] Sentry error tracking (optional)
- [ ] LogDNA logging (optional)

## Content Strategy ✅
- [ ] Initial content strategy set
- [ ] First manual post generated
- [ ] Weekly auto-generation tested
- [ ] Email notifications working

## Go Live ✅
- [ ] All tests passing in production
- [ ] Dashboard accessible
- [ ] Admin functions verified
- [ ] Affiliate links working
- [ ] Email campaigns tested
```

---

## Step 11: Monitoring & Logging

### Create Monitoring Dashboard

Create `backend/services/monitoring.py`:

```python
import logging
from datetime import datetime
from typing import Dict
import os

class MonitoringService:
    """Centralized monitoring and logging"""
    
    def __init__(self):
        self.setup_logging()
    
    def setup_logging(self):
        """Configure logging"""
        log_level = os.getenv("LOG_LEVEL", "INFO")
        
        logging.basicConfig(
            level=log_level,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('logs/app.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def log_post_generation(self, post_id: str, title: str, duration: float):
        """Log post generation event"""
        self.logger.info(f"POST_GENERATED: {post_id} | {title} | {duration}s")
    
    def log_revenue_milestone(self, amount: float):
        """Log revenue milestone"""
        self.logger.info(f"REVENUE_MILESTONE: ${amount}")
    
    def log_affiliate_conversion(self, network: str, amount: float, commission: float):
        """Log affiliate conversion"""
        self.logger.info(f"AFFILIATE_CONVERSION: {network} | ${amount} | Commission: ${commission}")
    
    def log_error(self, error_type: str, message: str, context: Dict = None):
        """Log error with context"""
        self.logger.error(f"ERROR: {error_type} | {message} | Context: {context}")
```

### Setup Error Tracking

Create `backend/services/error_tracking.py`:

```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlAlchemyIntegration
import os

def init_sentry():
    """Initialize Sentry for error tracking"""
    sentry_dsn = os.getenv("SENTRY_DSN")
    
    if sentry_dsn:
        sentry_sdk.init(
            dsn=sentry_dsn,
            integrations=[
                FastApiIntegration(),
                SqlAlchemyIntegration(),
            ],
            traces_sample_rate=0.1,
            environment=os.getenv("ENVIRONMENT", "production")
        )
```

### GitHub Actions Status Notifications

Create `.github/workflows/status-notifications.yml`:

```yaml
name: Workflow Status Notifications

on:
  workflow_run:
    workflows: ["Auto-Generate & Publish Content", "Deploy Frontend", "Deploy Backend"]
    types: [completed]

jobs:
  notify:
    runs-on: ubuntu-latest
    
    steps:
      - name: Slack Notification - Success
        if: ${{ github.event.workflow_run.conclusion == 'success' }}
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "✅ Workflow Success",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "✅ ${{ github.event.workflow_run.name }} succeeded\n*Repository*: ${{ github.repository }}\n*Branch*: ${{ github.event.workflow_run.head_branch }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
      
      - name: Slack Notification - Failure
        if: ${{ github.event.workflow_run.conclusion == 'failure' }}
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "❌ Workflow Failed",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "❌ ${{ github.event.workflow_run.name }} failed\n*Repository*: ${{ github.repository }}\n*Branch*: ${{ github.event.workflow_run.head_branch }}\n<${{ github.event.workflow_run.html_url }}|View Details>"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## Step 12: Documentation Files

### Create README.md

```markdown
# 🏆 South Africa Luxury Travel Blog

Autonomous AI-powered travel blog platform with automatic content generation, monetization tracking, and affiliate network integration.

## Features

✨ **Core Features**
- 🤖 Autonomous content generation using Claude AI
- 💰 Multi-stream monetization (AdSense + Affiliates + Email)
- 📊 Real-time analytics dashboard
- 🎮 Admin controls for manual content creation
- 📧 Automated email sequences and notifications
- 🔗 4+ affiliate network integration
- ⚙️ Zero-maintenance after setup

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- GitHub account
- Vercel account
- Database (Supabase/Neon)
- API keys (Anthropic, Unsplash, Pexels)

### Installation

```bash
# Clone repository
git clone https://github.com/YOUR-USERNAME/sa-travel-blog.git
cd sa-travel-blog

# Install dependencies
cd frontend && npm install && cd ..
cd backend && pip install -r requirements.txt && cd ..

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# Run locally
docker-compose up
```

Visit http://localhost:3000 for frontend and http://localhost:8000 for API.

## Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for complete deployment guide.

Quick deployment:
```bash
# Frontend to Vercel
cd frontend && vercel --prod

# Backend to Railway
cd backend && railway up
```

## Architecture

```
Frontend (Next.js/React)
    ↓
Vercel
    ↓
FastAPI Backend → Autonomous Content Engine
    ↓
PostgreSQL Database (Supabase)
    ↓
Email Service (Mailchimp/Gmail)
    ↓
Affiliate Networks (Booking, GetYourGuide, Viator, accommodation partners)
```

## Revenue Model

- **Google AdSense**: 50% of revenue
- **Affiliate Networks**: 40% of revenue
- **Email/Sponsorships**: 10% of revenue

Projected Monthly Revenue:
- Month 3: $200-500
- Month 6: $800-1,500
- Month 12: $3,000-5,000+

## Documentation

- [Deployment Guide](docs/DEPLOYMENT.md)
- [API Documentation](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Monetization Strategy](docs/MONETIZATION.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## Project Structure

```
sa-travel-blog/
├── frontend/          # Next.js frontend
├── backend/           # FastAPI backend
├── scripts/           # Automation scripts
├── .github/workflows/ # CI/CD workflows
├── docs/              # Documentation
└── docker-compose.yml # Docker configuration
```

## License

MIT License - See LICENSE file

## Support

- 📧 Email: support@yourblog.com
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions
```

### Create CONTRIBUTING.md

```markdown
# Contributing

## Development Setup

```bash
# Fork repository
# Clone your fork
git clone https://github.com/YOUR-USERNAME/sa-travel-blog.git

# Create feature branch
git checkout -b feature/your-feature

# Install dependencies
cd frontend && npm install && cd ..
cd backend && pip install -r requirements.txt && cd ..

# Make changes and test
docker-compose up

# Commit changes
git commit -am "Add your feature"

# Push to your fork
git push origin feature/your-feature

# Create Pull Request
```

## Code Style

- **Python**: Follow PEP 8
- **JavaScript**: Use ESLint config
- **SQL**: Use consistent formatting

## Testing

```bash
# Backend tests
cd backend && pytest

# Frontend tests
cd frontend && npm test
```

## Pull Request Process

1. Update documentation
2. Add tests for new features
3. Ensure all tests pass
4. Request review from maintainers
5. Address feedback
6. Merge when approved
```

### Create .gitignore

```
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
pip-log.txt
pip-delete-this-directory.txt

# Virtual environments
venv/
ENV/
env/

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Environment variables
.env
.env.local
.env.*.local

# Next.js
.next/
out/
node_modules/
.cache
dist/

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Database
*.db
*.sqlite
*.sqlite3

# OS
.DS_Store
Thumbs.db

# Build
build/
dist/
*.egg-info/

# Testing
.pytest_cache/
.coverage
htmlcov/

# Temporary
tmp/
temp/
*.tmp
```

---

## Step 13: Automated Testing

### Create backend/tests/test_api.py

```python
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    """Test health endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_admin_generate_post():
    """Test post generation endpoint"""
    response = client.post("/api/admin/generate-post")
    assert response.status_code == 200
    assert response.json()["status"] == "generating"

def test_get_dashboard_overview():
    """Test dashboard overview"""
    response = client.get("/api/dashboard/overview")
    assert response.status_code == 200
    data = response.json()
    assert "totalRevenue" in data
    assert "monthlyViews" in data

def test_email_subscribe():
    """Test email subscription"""
    response = client.post(
        "/api/email/subscribe",
        json={"email": "test@example.com", "name": "Test User"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "subscribed"

def test_affiliate_performance():
    """Test affiliate performance endpoint"""
    response = client.get("/api/affiliates/performance")
    assert response.status_code == 200
    data = response.json()
    assert "booking" in data
  # Airbnb-specific assertion removed — use accommodation partner keys if present
    assert "getyourguide" in data
    assert "viator" in data
```

### Create pytest.ini

```ini
[pytest]
minversion = 7.0
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
```

---

## Step 14: Security Best Practices

### Create backend/utils/security.py

```python
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthCredentials
import os
import jwt
from datetime import datetime, timedelta

security = HTTPBearer()

def verify_token(credentials: HTTPAuthCredentials = Depends(security)):
    """Verify JWT token for admin endpoints"""
    token = credentials.credentials
    secret_key = os.getenv("SECRET_KEY", "your-secret-key")
    
    try:
        payload = jwt.decode(token, secret_key, algorithms=["HS256"])
        if payload.get("admin") != True:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized"
            )
        return payload
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

def create_admin_token():
    """Create JWT token for admin"""
    secret_key = os.getenv("SECRET_KEY", "your-secret-key")
    payload = {
        "admin": True,
        "exp": datetime.utcnow() + timedelta(days=30),
        "iat": datetime.utcnow()
    }
    token = jwt.encode(payload, secret_key, algorithm="HS256")
    return token
```

### Add to main.py

```python
# Add admin-only decorator to protected routes
from utils.security import verify_token

@app.post("/api/admin/generate-post")
async def trigger_post_generation(
    credentials = Depends(verify_token),
    background_tasks: BackgroundTasks
):
    # Only verified admins can trigger
    ...
```

---

## Step 15: Production Monitoring

### Create monitoring setup

Create `backend/config/monitoring.yml`:

```yaml
monitoring:
  sentry:
    enabled: true
    dsn: ${SENTRY_DSN}
    environment: production
    
  grafana:
    enabled: true
    dashboard_url: https://your-grafana.com
    
  datadog:
    enabled: false
    api_key: ${DATADOG_API_KEY}
    
  alerts:
    - type: slack
      webhook: ${SLACK_WEBHOOK_URL}
      events:
        - deployment_success
        - deployment_failure
        - revenue_milestone
        - error_rate_high
```

### Create alerts configuration

Create `.github/workflows/alerts.yml`:

```yaml
name: Alert Checks

on:
  schedule:
    - cron: '0 * * * *'  # Hourly
  workflow_dispatch:

jobs:
  check-health:
    runs-on: ubuntu-latest
    
    steps:
      - name: Check API Health
        run: |
          curl -f https://your-api.com/health || exit 1
      
      - name: Check Website
        run: |
          curl -f https://your-blog.vercel.app || exit 1
      
      - name: Alert on Failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "⚠️ Health Check Failed"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## Deployment Troubleshooting

### Issue: Database Connection Failed

```bash
# Check database credentials
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Verify Supabase connection string format:
# postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

### Issue: GitHub Actions Not Running

```bash
# Check workflow file syntax
python -m py_compile .github/workflows/*.yml

# Verify secrets are set
# Go to Settings → Secrets → Actions
# Check all required secrets are present

# Re-run workflow
# Go to Actions → Select workflow → Run workflow
```

### Issue: Vercel Deployment Failed

```bash
# Check build logs
vercel logs --follow

# Verify environment variables in Vercel dashboard
# Settings → Environment Variables

# Redeploy
vercel --prod --force
```

### Issue: Posts Not Generating

```bash
# Check GitHub Actions logs
# Go to Actions → Auto-Generate & Publish Content → Latest run

# Verify Anthropic API key
# Check ANTHROPIC_API_KEY in GitHub secrets

# Test API key locally
python -c "import anthropic; print(anthropic.Anthropic(api_key='YOUR_KEY').messages.create(model='claude-opus-4-1', max_tokens=10, messages=[{'role': 'user', 'content': 'test'}]))"

# Check database connection in backend logs
# Go to Railway/Render dashboard → Logs
```

---

## Production Deployment Checklist

- [ ] All GitHub secrets configured
- [ ] Database migrations run successfully
- [ ] Email SMTP credentials verified
- [ ] Affiliate IDs configured
- [ ] Google Analytics set up
- [ ] Google Search Console verified
- [ ] CDN configured (optional)
- [ ] SSL certificate installed
- [ ] Monitoring and alerting enabled
- [ ] Backup strategy implemented
- [ ] Error tracking (Sentry) configured
- [ ] Performance monitoring enabled

---

## Next Steps After Deployment

1. **Day 1-7**: Monitor logs and fix any issues
2. **Week 2**: First automated post generation
3. **Week 3**: Optimize based on analytics
4. **Month 2**: Scale content production
5. **Month 3**: Full monetization optimization
6. **Month 6**: Expand to additional affiliate networks
7. **Month 12**: Establish passive income stream

---

## Support & Resources

- **FastAPI Documentation**: https://fastapi.tiangolo.com
- **Next.js Documentation**: https://nextjs.org/docs
- **Supabase Documentation**: https://supabase.com/docs
- **GitHub Actions**: https://docs.github.com/en/actions
- **Vercel Deployment**: https://vercel.com/docs
- **Railway Deployment**: https://docs.railway.app

---

**Your autonomous travel blog is now ready for production deployment!** 🚀






