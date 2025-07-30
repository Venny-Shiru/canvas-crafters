# Canvas Crafters Deployment Guide

## 🚀 Complete Deployment Setup

### Prerequisites
- GitHub account
- Vercel account (free)
- Railway account (free)
- MongoDB Atlas account (free)

---

## 📦 Step 1: Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Sign up for free account

2. **Create Database Cluster**
   - Create new project: "Canvas Crafters"
   - Build a database (free M0 cluster)
   - Choose cloud provider and region
   - Create cluster (takes 2-3 minutes)

3. **Configure Database Access**
   - Database Access → Add new user
   - Username: `canvas-crafters-user`
   - Password: Generate secure password (save it!)
   - Built-in Role: `Atlas admin`

4. **Configure Network Access**
   - Network Access → Add IP Address
   - Allow access from anywhere: `0.0.0.0/0`
   - (For production, restrict to specific IPs)

5. **Get Connection String**
   - Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Save this connection string for Railway

---

## 🖥️ Step 2: Backend Deployment (Railway)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Backend**
   - New Project → Deploy from GitHub repo
   - Connect your `canvas-crafters` repository
   - Railway will auto-detect Node.js

3. **Configure Environment Variables**
   - Go to your project → Variables tab
   - Add these variables:
   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://canvas-crafters-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/canvas-crafters
   JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random
   CLIENT_URL=https://canvas-crafters-frontend.vercel.app
   SOCKET_CORS_ORIGIN=https://canvas-crafters-frontend.vercel.app
   ```

4. **Custom Domain (Optional)**
   - Settings → Domains → Generate Domain
   - Note the Railway URL (e.g., `https://canvas-crafters-backend.railway.app`)

---

## 🌐 Step 3: Frontend Deployment (Vercel)

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - New Project → Import from GitHub
   - Select your `canvas-crafters` repository
   - Framework Preset: Vite
   - Root Directory: `client`
   - Vercel will auto-detect the setup

3. **Configure Build Settings** (Should be auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Node.js Version: 18.x

4. **Add Environment Variables**
   - Project Settings → Environment Variables
   - Add these variables:
   ```env
   VITE_API_URL=https://your-railway-backend.railway.app/api
   VITE_SOCKET_URL=https://your-railway-backend.railway.app
   VITE_APP_NAME=Canvas Crafters
   ```

5. **Deploy**
   - Click Deploy
   - Your app will be available at `https://canvas-crafters-frontend.vercel.app`

---

## 🔧 Step 4: Update Environment Variables

1. **Update Railway with Vercel URL**
   - Go back to Railway → Variables
   - Update `CLIENT_URL` and `SOCKET_CORS_ORIGIN` with your actual Vercel URL

2. **Update Vercel with Railway URL**
   - Go back to Vercel → Project Settings → Environment Variables
   - Update `VITE_API_URL` and `VITE_SOCKET_URL` with your actual Railway URL

3. **Redeploy Both**
   - Railway: Trigger new deployment
   - Vercel: Will auto-deploy on environment variable change

---

## ✅ Step 5: Test Your Deployment

1. **Visit Your Frontend**
   - Go to your Vercel URL
   - Should see Canvas Crafters homepage

2. **Test Registration**
   - Try creating a new account
   - Should work without errors

3. **Test Real-time Features**
   - Create a canvas
   - Open in multiple browser tabs
   - Test real-time collaboration

---

## 🎯 Final URLs

After deployment, you'll have:

- **Frontend**: `https://canvas-crafters-frontend.vercel.app`
- **Backend**: `https://canvas-crafters-backend.railway.app`
- **Database**: MongoDB Atlas cluster

---

## 🔍 Troubleshooting

### Common Issues:

**CORS Errors:**
- Ensure `CLIENT_URL` in Railway matches your Vercel URL exactly
- Check that CORS origins are configured correctly

**Database Connection Issues:**
- Verify MongoDB Atlas connection string
- Check that IP whitelist includes `0.0.0.0/0`
- Ensure database user has correct permissions

**Build Failures:**
- **"vite: command not found"**: Fixed with updated vercel.json configuration
- Check that all environment variables are set
- Verify build commands are correct
- Check logs in Railway/Vercel dashboards
- Ensure `client/package.json` exists with proper dependencies

**Git Issues:**
- If `git pull` stalls: Try `git fetch` first, then `git pull`
- Network issues: Check internet connection
- Authentication: Ensure GitHub credentials are valid

**Socket.io Connection Issues:**
- Ensure `VITE_SOCKET_URL` points to your Railway backend
- Check that Railway allows WebSocket connections

---

## 📊 Monitoring & Logs

**Railway:**
- View logs: Project → Deployments → Click deployment → Logs
- Monitor metrics: Project → Metrics

**Vercel:**
- View logs: Project → Functions → View Function Logs
- Monitor performance: Project → Analytics

**MongoDB Atlas:**
- Monitor database: Clusters → Metrics
- View logs: Database → Browse Collections

---

## 💰 Cost Breakdown

**Free Tier Limits:**
- **MongoDB Atlas**: 512MB storage, shared clusters
- **Railway**: $5/month credit, then $0.000463/GB-hour
- **Vercel**: 100GB bandwidth, unlimited static sites

**Expected Monthly Cost**: ~$0-5 for moderate usage

---

## 🚀 Going Production

When ready for production:

1. **Custom Domains**
   - Register domain (e.g., `canvascrafters.com`)
   - Point to Vercel for frontend
   - Use subdomain for API (e.g., `api.canvascrafters.com`)

2. **Enhanced Security**
   - Restrict MongoDB IP access
   - Add rate limiting
   - Enable HTTPS everywhere
   - Set up monitoring and alerts

3. **Performance Optimization**
   - Enable Vercel Edge Network
   - Set up CDN for assets
   - Optimize database queries
   - Add caching layers

4. **Backup & Recovery**
   - Set up automated database backups
   - Document recovery procedures
   - Test disaster recovery

---

**🎉 Congratulations! Your Canvas Crafters app is now live!**
