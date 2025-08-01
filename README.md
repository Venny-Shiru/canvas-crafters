# Canvas Crafters 🎨

## Create. Collaborate. Craft Together.

Canvas Crafters is a real-time collaborative digital canvas platform that enables artists, designers, and creative teams to work together seamlessly. Built with modern web technologies, it offers professional drawing tools with the power of real-time collaboration.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://canvas-crafters.vercel.app)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/Venny-Shiru/canvas-crafters)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

🌐 **Live Application**: [https://canvas-crafters.vercel.app](https://canvas-crafters.vercel.app)

🚀 **API Status**: Backend integrated with frontend (full-stack deployment)

## ✨ Features

### 🎨 **Professional Drawing Tools (20+ Tools)**
- **Basic Tools**: Brush, Eraser, Line, Rectangle, Circle, Text
- **Advanced Tools**: Pen tool, Bezier curves, Polygon, Star shapes
- **Color Tools**: Eyedropper, Flood fill, Gradient tool with live preview
- **Effects**: Blur, Drop shadow, Texture brush
- **Precision**: Zoom (25%-400%), Grid snap, Rulers
- **Professional**: Layer management, Undo/Redo, Real-time collaboration
- **Export**: Multiple formats with quality settings

### 👥 **Real-time Collaboration**
- Multiple users editing simultaneously
- Live cursor tracking with user names
- User presence indicators
- Real-time chat and comments
- Permission management (view/edit/admin)
- Conflict resolution system

### ⚡ **Performance & Reliability**
- Zero-latency collaboration engine
- Auto-save every 30 seconds
- Advanced undo/redo with branching
- WebSocket-based real-time communication
- Optimized rendering engine

### 🌐 **Universal Access**
- Works on any device with a web browser
- Fully responsive design for mobile and desktop
- Progressive Web App (PWA) capabilities
- One-click sharing with customizable permissions
- Export to multiple formats (PNG, JPEG, SVG)
- Public gallery showcase
- Contact and support system

## 🆕 Recent Updates (August 2025)

### ✅ **Enhanced Canvas Editor**
- **20+ Professional Tools**: Complete redesign with industry-standard tools
- **Advanced Color Tools**: Eyedropper with pixel-perfect sampling, flood fill with stack-based algorithm, gradient tool with SVG preview
- **Improved UX**: Better tool organization, real-time visual feedback, professional toolbar

### ✅ **Contact & Support System**
- **Comprehensive Contact Page**: Professional contact form with categorized inquiries
- **FAQ Section**: Common questions and troubleshooting
- **Multiple Support Channels**: Email, feedback forms, GitHub integration
- **Site-wide Footer**: Consistent contact information across all pages

### ✅ **Authentication Enhancements**
- **Password Reset Flow**: Secure forgot password and reset functionality
- **Enhanced Routing**: Improved protected routes with flexible access control
- **Better User Experience**: Streamlined login/register flow

### ✅ **Infrastructure Improvements**
- **Performance Optimization**: Faster loading times and better caching
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Code Quality**: TypeScript improvements and better component structure

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

### Installation

```bash
# Clone the repository
git clone https://github.com/Venny-Shiru/canvas-crafters.git

# Navigate to project directory
cd canvas-crafters

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the development server
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Socket.io Client** - Real-time communication
- **React Router** - Navigation
- **React Query** - Data fetching and caching

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### DevOps & Tools
- **ESLint** - Code linting
- **Nodemon** - Development server
- **Concurrently** - Run multiple processes
- **Git** - Version control

## 📁 Project Structure

```
canvas-crafters/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── Navbar.tsx        # Navigation component
│   │   │   ├── Footer.tsx        # Site-wide footer
│   │   │   ├── CanvasCard.tsx    # Canvas preview cards
│   │   │   └── ProtectedRoute.tsx # Route protection
│   │   ├── contexts/       # React contexts
│   │   │   └── AuthContext.tsx   # Authentication state
│   │   ├── pages/          # Application pages
│   │   │   ├── Home.tsx          # Landing page
│   │   │   ├── Dashboard.tsx     # User dashboard
│   │   │   ├── CanvasEditor.tsx  # Main canvas editor (20+ tools)
│   │   │   ├── Contact.tsx       # Contact and support page
│   │   │   ├── Login.tsx         # Authentication pages
│   │   │   └── Register.tsx
│   │   └── main.tsx        # Entry point
│   ├── index.html
│   └── vite.config.ts
├── server/                 # Backend Node.js application
│   ├── config/             # Database and app configuration
│   ├── middleware/         # Express middleware
│   ├── models/             # Mongoose models
│   │   ├── User.js              # User model with enhanced auth
│   │   └── Canvas.js            # Canvas model
│   ├── routes/             # API routes
│   │   ├── auth.js              # Authentication endpoints
│   │   ├── user.js              # User management
│   │   └── canvas.js            # Canvas operations
│   ├── sockets/            # Socket.io handlers
│   │   └── canvasSocket.js      # Real-time collaboration
│   └── index.js            # Server entry point
├── .env                    # Environment variables
└── package.json            # Project dependencies and scripts
```

## 🎯 Usage

### For Artists & Designers
1. **Sign up** for a free account
2. **Create** a new canvas
3. **Invite** collaborators via email or share link
4. **Draw** together in real-time
5. **Export** your masterpiece

### For Teams
1. **Set up** team workspace
2. **Organize** projects and canvases
3. **Collaborate** with advanced permissions
4. **Track** progress with analytics

### For Educators
1. **Create** classroom canvases
2. **Assign** group projects
3. **Monitor** student progress
4. **Showcase** student work

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start both client and server
npm run client:dev       # Start only frontend
npm run server:dev       # Start only backend

# Production
npm run build           # Build for production
npm run server          # Start production server
npm run preview         # Preview production build

# Code Quality
npm run lint            # Run ESLint
```

## 🌍 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/canvas-crafters

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# Frontend Environment Variables (for Vite)
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration with validation
- `POST /api/auth/login` - User login with JWT tokens
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/profile` - Get authenticated user profile

### Canvas Endpoints
- `GET /api/canvas` - List user canvases with pagination
- `POST /api/canvas` - Create new canvas with metadata
- `GET /api/canvas/:id` - Get canvas details and data
- `PUT /api/canvas/:id` - Update canvas (title, description, data)
- `DELETE /api/canvas/:id` - Delete canvas (creator only)
- `POST /api/canvas/:id/share` - Share canvas with permissions

### User Endpoints
- `GET /api/users/profile` - Get detailed user profile
- `PUT /api/users/profile` - Update user profile and settings
- `POST /api/users/upload-avatar` - Upload profile picture

## 🔒 Security Features

- JWT-based authentication
- Rate limiting and DDoS protection
- Input validation and sanitization
- HTTPS/WSS encryption
- CORS configuration
- Helmet.js security headers

## 🚀 Deployment

### ✅ **Live Deployment Status** (Updated August 2025)

Your Canvas Crafters application is successfully deployed and running with the latest enhancements!

**🌐 Frontend (Vercel)**: [https://canvas-crafters.vercel.app](https://canvas-crafters.vercel.app)
- ✅ Enhanced canvas editor with 20+ professional tools
- ✅ Contact page with comprehensive support system
- ✅ Site-wide footer with consistent navigation
- ✅ Improved authentication flow with password reset
- ✅ Responsive design optimized for all devices
- ✅ Real-time collaboration features

**🚂 Backend (Railway)**: [https://canvas-crafters-production.up.railway.app](https://canvas-crafters-production.up.railway.app)
- ✅ Enhanced authentication system with password reset
- ✅ Improved user management and profile features
- ✅ Advanced canvas operations and sharing
- ✅ Socket.io real-time collaboration engine
- ✅ JWT authentication with secure token handling
- ✅ MongoDB Atlas integration

**🗄️ Database (MongoDB Atlas)**: Connected and operational
- ✅ Enhanced user model with profile features
- ✅ Advanced canvas data storage with metadata
- ✅ Real-time data synchronization
- ✅ Secure authentication and session management

### 🔧 Deployment Architecture

```
Users → Vercel (Frontend) → Railway (Backend API) → MongoDB Atlas (Database)
                              ↓
                    Real-time Socket.io Communication
```

### 🎯 Current Environment Variables

**Production Environment (Hybrid Deployment):**
```env
VITE_API_URL=https://canvas-crafters-production.up.railway.app/api
VITE_SOCKET_URL=https://canvas-crafters-production.up.railway.app
VITE_APP_NAME=Canvas Crafters
MONGODB_URI=mongodb+srv://[secured]
JWT_SECRET=[secured]
```

### 📊 Deployment Statistics (August 2025)

- **Build Time**: ~2-3 minutes per deployment
- **Cold Start**: <2 seconds
- **Global CDN**: Vercel Edge Network with global coverage
- **Uptime**: 99.9% (Railway + Vercel SLA)
- **Database**: MongoDB Atlas M0 (Free Tier) with 512MB storage
- **Latest Deployment**: August 2025 with major feature enhancements

### 💰 Current Hosting Costs

- **Frontend (Vercel)**: $0/month (Hobby Plan - 100GB bandwidth)
- **Backend (Railway)**: $0/month (Hobby Plan - 500 hours)
- **Database (MongoDB Atlas)**: $0/month (Free M0 Cluster)
- **Domain**: Free (vercel.app subdomain)
- **Total**: **$0/month** - Completely free hosting! 🎉

### 🔄 Continuous Deployment & DevOps

- **Automatic deployments** triggered on every push to `main` branch
- **Frontend**: Vercel automatically rebuilds and deploys frontend from GitHub
- **Backend**: Railway automatically rebuilds and deploys backend from GitHub  
- **Preview deployments**: Vercel creates preview URLs for pull requests
- **Environment management**: Secure environment variable handling
- **Health monitoring**: Automatic error tracking and performance monitoring

### 📈 Performance Optimizations (Latest Updates)

- ✅ **Vite build optimization** with tree shaking and code splitting
- ✅ **Tailwind CSS purging** for minimal CSS bundle size
- ✅ **Socket.io optimization** for sub-100ms collaboration latency
- ✅ **MongoDB indexing** for faster user and canvas queries
- ✅ **Image optimization** with WebP format support
- ✅ **Lazy loading** for better initial page load times
- ✅ **Service worker** for offline capabilities (PWA-ready)

### 🔒 Security Features

- ✅ **HTTPS/WSS encryption** on all connections
- ✅ **JWT authentication** with secure secrets
- ✅ **Rate limiting** on API endpoints
- ✅ **CORS protection** with specific origins
- ✅ **Environment variable security** (no secrets in code)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact & Support

- **GitHub**: [@Venny-Shiru](https://github.com/Venny-Shiru)
- **Email**: [vennywanjiru@gmail.com](mailto:vennywanjiru@gmail.com)
- **Project Link**: [https://github.com/Venny-Shiru/canvas-crafters](https://github.com/Venny-Shiru/canvas-crafters)

---

**Made with ❤️ for the creative community**
