import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Canvas from '../models/Canvas.js';

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
      
      // Find user by ID from token
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({ message: 'Token is not valid - user not found' });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: 'Account is deactivated' });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired' });
      }
      return res.status(401).json({ message: 'Token is not valid' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error in authentication' });
  }
};

// Optional auth middleware - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without user
    }

    const token = authHeader.substring(7);

    if (!token) {
      return next(); // Continue without user
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Silently continue without user if token is invalid
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue without user
  }
};

// Check canvas permission middleware
const checkCanvasPermission = (permission = 'view') => {
  return async (req, res, next) => {
    try {
      const canvasId = req.params.id || req.params.canvasId;
      
      if (!canvasId) {
        return res.status(400).json({ message: 'Canvas ID is required' });
      }

      const canvas = await Canvas.findById(canvasId);
      
      if (!canvas) {
        return res.status(404).json({ message: 'Canvas not found' });
      }

      // Check if user has permission
      const isOwner = canvas.owner.toString() === req.user._id.toString();
      const collaborator = canvas.collaborators.find(
        collab => collab.user.toString() === req.user._id.toString()
      );

      if (!isOwner && !collaborator) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Check specific permission level
      if (permission === 'edit' && !isOwner && collaborator.permission !== 'edit') {
        return res.status(403).json({ message: 'Edit permission required' });
      }

      req.canvas = canvas;
      next();
    } catch (error) {
      console.error('Canvas permission middleware error:', error);
      res.status(500).json({ message: 'Server error checking permissions' });
    }
  };
};

export { auth, optionalAuth, checkCanvasPermission };
