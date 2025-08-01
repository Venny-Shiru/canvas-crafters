import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import routes
import authRoutes from '../server/routes/auth.js';
import canvasRoutes from '../server/routes/canvas.js';
import userRoutes from '../server/routes/user.js';

// Load environment variables
dotenv.config();

// MongoDB connection
const connectDB = async () => {
  try {
    if (mongoose.connections[0].readyState) {
      return;
    }
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/canvas-crafters';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// CORS configuration function to handle all Vercel deployments
const corsOrigins = (origin, callback) => {
  const allowedOrigins = [
    process.env.CLIENT_URL || "http://localhost:5173",
    "https://canvas-crafters.vercel.app",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176"
  ];
  
  // Allow Vercel preview deployments
  if (origin && origin.match(/^https:\/\/canvas-crafters-.*\.vercel\.app$/)) {
    allowedOrigins.push(origin);
  }
  
  // Allow all origins in allowedOrigins or no origin (for mobile apps)
  if (!origin || allowedOrigins.indexOf(origin) !== -1) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

// Root API endpoint
app.get('/api', (req, res) => {
  res.status(200).json({ 
    message: 'Canvas Crafters API',
    version: '1.0.0',
    status: 'running'
  });
});

// Export for Vercel
export default app;
