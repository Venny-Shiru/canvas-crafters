import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import canvasRoutes from './routes/canvas.js';
import userRoutes from './routes/user.js';
import { errorHandler, asyncHandler } from './middleware/errorHandler.js';
import canvasSocket from './sockets/canvasSocket.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      "https://canvas-crafters-git-main-venny-shiru.vercel.app",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176"
    ],
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: [
    process.env.CLIENT_URL || "http://localhost:5173",
    "https://canvas-crafters-git-main-venny-shiru.vercel.app",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176"
  ],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs (increased for development)
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically with CORS headers
app.use('/uploads', (req, res, next) => {
  // Set CORS headers for image resources
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
}, express.static('server/uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/canvas', canvasRoutes);
app.use('/api/user', userRoutes);
app.use('/api/users', userRoutes); // Add plural route for settings compatibility

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Canvas Crafters API is running',
    timestamp: new Date().toISOString()
  });
});

// Platform statistics endpoint
app.get('/api/stats', asyncHandler(async (req, res) => {
  try {
    // Import models here to avoid circular dependencies
    const { default: User } = await import('./models/User.js');
    const { default: Canvas } = await import('./models/Canvas.js');
    
    // Get total statistics
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalCanvases = await Canvas.countDocuments({ 'settings.isPublic': true });
    
    // Get total views from all public canvases
    const viewsResult = await Canvas.aggregate([
      { $match: { 'settings.isPublic': true } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    
    const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;
    
    // Get total likes from all public canvases
    const likesResult = await Canvas.aggregate([
      { $match: { 'settings.isPublic': true } },
      { $group: { _id: null, totalLikes: { $sum: { $size: '$likes' } } } }
    ]);
    
    const totalLikes = likesResult.length > 0 ? likesResult[0].totalLikes : 0;

    res.json({
      totalUsers,
      totalCanvases,
      totalViews,
      totalLikes
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error getting statistics' });
  }
}));

// Socket.io setup
canvasSocket(io);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Canvas Crafters server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});