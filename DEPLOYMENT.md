# Canvas Crafters - Deployment Guide

## 🚀 Current Production Deployment

### ✅ **Working Stack (August 2025)**
- **Frontend**: Netlify - https://canvas-crafters.netlify.app
- **Backend**: Railway - https://canvas-crafters-production.up.railway.app
- **Database**: MongoDB Atlas

### 🔧 **Configuration Files**

#### Netlify Configuration (`netlify.toml`)
```toml
[build]
  command = "cd client && npm install && npm run build"
  publish = "client/dist"

[build.environment]
  VITE_API_URL = "https://canvas-crafters-production.up.railway.app/api"
  VITE_SOCKET_URL = "https://canvas-crafters-production.up.railway.app"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Environment Variables
```bash
# Production
VITE_API_URL=https://canvas-crafters-production.up.railway.app/api
VITE_SOCKET_URL=https://canvas-crafters-production.up.railway.app

# Development
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 🎯 **Test Credentials**
- Username: `testuser2`
- Password: `TestPass123`

### 📝 **Deployment Steps**

#### Frontend (Netlify)
1. Connect GitHub repository to Netlify
2. Set site name: `canvas-crafters`
3. Netlify auto-detects settings from `netlify.toml`
4. Deploy automatically on git push

#### Backend (Railway)
1. Connect GitHub repository to Railway
2. Railway auto-deploys from `server/` directory
3. Set environment variables in Railway dashboard
4. Deploy automatically on git push

### ✅ **Working Features**
- ✅ User authentication (login/register)
- ✅ Real-time collaboration
- ✅ Canvas editor with 20+ tools
- ✅ CORS properly configured
- ✅ Environment variables working
- ✅ Clean SPA routing (no URL corruption)

### 🚫 **Migration Notes**
- **From Vercel**: Switched due to URL corruption issues with SPA routing
- **CORS Update**: Added Netlify domain to Railway backend allowed origins
- **Build Process**: Simplified environment variable injection

### 🔍 **Troubleshooting**
- Clear browser cache if seeing old version
- Check browser console for environment variable logs
- Verify CORS headers in Network tab
- Test API directly: `https://canvas-crafters-production.up.railway.app/api/auth/login`

---
**Last Updated**: August 2025
**Status**: ✅ Fully Operational
