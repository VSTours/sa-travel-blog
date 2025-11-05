# Travel Blog Admin Panel

## 🚀 Secure Admin Interface

This is the **separate admin application** for the South Africa Travel Blog platform. It includes:

- **🎮 Deployment Wizard**: Interactive setup for new deployments
- **📊 Analytics Dashboard**: Real-time revenue and performance tracking  
- **⚙️ Admin Controls**: Manual post generation and system management
- **🔐 Security**: Isolated from public blog for protection

## Quick Start

```bash
# Install dependencies
cd admin
npm install

# Run development server (port 3001)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Access URLs

- **Development**: http://localhost:3001
- **Production**: https://admin.yourblog.com (subdomain recommended)

## Features

### Deployment Wizard
- 12-step interactive setup
- API key validation
- Database configuration
- Content strategy selection
- Automated deployment

### Admin Dashboard  
- Revenue tracking by source
- Post performance analytics
- Email subscriber management
- Affiliate network metrics
- Manual content generation

## Security Features

✅ **Separate codebase** from public blog  
✅ **Different port/domain** (3001 vs 3000)  
✅ **Admin-only routes** protected by authentication  
✅ **Hidden from public** - no links from main site  

## Architecture

```
admin/                    # Secure admin app
├── components/
│   └── TravelBlogDeployer.tsx    # Main deployment wizard
├── pages/
│   ├── index.tsx        # Admin dashboard
│   └── _app.tsx         # App wrapper
└── styles/
    └── globals.css      # Admin-specific styling
```

## Deployment

The admin panel should be deployed separately from the main blog:

1. **Main Blog**: yourblog.com (port 3000)
2. **Admin Panel**: admin.yourblog.com (port 3001)

This separation provides security and allows independent updates.

## Next Steps

1. Install dependencies: `npm install`
2. Start development: `npm run dev`  
3. Access at: http://localhost:3001
4. Use deployment wizard to set up your blog
5. Switch to admin dashboard to manage content

---

**Your admin panel is ready!** 🎉