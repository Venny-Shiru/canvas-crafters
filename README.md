# Canvas Crafters 🎨

## Create. Collaborate. Craft Together.

Canvas Crafters is a real-time collaborative digital canvas platform that enables artists, designers, and creative teams to work together seamlessly. Built with modern web technologies, it offers professional drawing tools with the power of real-time collaboration.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://lovable.dev/projects/2a4c49c6-ff4d-4c9a-a7f1-7eb11580d449)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

## ✨ Features

### 🎨 **Professional Drawing Tools**
- Complete suite of digital art tools
- Brush engine with pressure sensitivity
- Layer management system
- Vector and raster support
- Color palettes and gradients

### 👥 **Real-time Collaboration**
- Multiple users editing simultaneously
- Live cursor tracking
- User presence indicators
- Real-time chat and comments
- Permission management (view/edit)

### ⚡ **Performance & Reliability**
- Zero-latency collaboration engine
- Auto-save every 30 seconds
- Conflict resolution system
- Undo/redo with branching
- WebRTC for low-latency communication

### 🌐 **Universal Access**
- Works on any device with a web browser
- Responsive design for mobile and desktop
- One-click sharing with customizable permissions
- Export to multiple formats
- Public gallery showcase

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
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   ├── pages/          # Application pages
│   │   └── main.tsx        # Entry point
│   ├── index.html
│   └── vite.config.ts
├── server/                 # Backend Node.js application
│   ├── config/             # Database and app configuration
│   ├── middleware/         # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── sockets/            # Socket.io handlers
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

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Canvas Endpoints
- `GET /api/canvas` - List user canvases
- `POST /api/canvas` - Create new canvas
- `GET /api/canvas/:id` - Get canvas details
- `PUT /api/canvas/:id` - Update canvas
- `DELETE /api/canvas/:id` - Delete canvas

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## 🔒 Security Features

- JWT-based authentication
- Rate limiting and DDoS protection
- Input validation and sanitization
- HTTPS/WSS encryption
- CORS configuration
- Helmet.js security headers

## 🚀 Deployment

### Recommended Setup: Vercel + Railway + MongoDB Atlas

**Frontend (Vercel):**
1. Connect your GitHub repository to Vercel
2. Set the root directory to `client`
3. Vercel will auto-detect Vite and deploy
4. Add environment variables in Vercel dashboard

**Backend (Railway):**
1. Connect your GitHub repository to Railway
2. Railway will auto-detect Node.js and deploy
3. Add environment variables in Railway dashboard
4. Your backend will be available at `https://your-app.railway.app`

**Database (MongoDB Atlas):**
1. Create a free MongoDB Atlas cluster
2. Get the connection string
3. Add it to Railway environment variables

### Environment Variables Setup

**Vercel Environment Variables:**
```env
VITE_API_URL=https://your-railway-backend.railway.app/api
VITE_SOCKET_URL=https://your-railway-backend.railway.app
VITE_APP_NAME=Canvas Crafters
```

**Railway Environment Variables:**
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://your-atlas-connection-string
JWT_SECRET=your-super-secret-jwt-key
CLIENT_URL=https://your-vercel-app.vercel.app
SOCKET_CORS_ORIGIN=https://your-vercel-app.vercel.app
```

### Alternative Deployment Options
- **Lovable**: Visit [Lovable Project](https://lovable.dev/projects/2a4c49c6-ff4d-4c9a-a7f1-7eb11580d449) → Share → Publish
- **Netlify**: For frontend deployment
- **Render**: Full-stack deployment alternative
- **Heroku**: Traditional PaaS option

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev) - AI-powered web development
- Icons by [Lucide React](https://lucide.dev)
- UI components inspired by modern design systems

## 📞 Contact & Support

- **GitHub**: [@Venny-Shiru](https://github.com/Venny-Shiru)
- **Email**: [your-email@canvas-crafters.com]
- **Project Link**: [https://github.com/Venny-Shiru/canvas-crafters](https://github.com/Venny-Shiru/canvas-crafters)

---

**Made with ❤️ for the creative community**
