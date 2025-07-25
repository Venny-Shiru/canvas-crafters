const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
      // Silently fail and continue without user
      console.log('Optional auth failed:', error.message);
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue without user
  }
};

// Admin check middleware
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
};

// Canvas permission middleware
const checkCanvasPermission = (requiredPermission = 'view') => {
  return async (req, res, next) => {
    try {
      const Canvas = require('../models/Canvas');
      const canvasId = req.params.id || req.params.canvasId;
      
      const canvas = await Canvas.findById(canvasId);
      
      if (!canvas) {
        return res.status(404).json({ message: 'Canvas not found' });
      }

      // Check if canvas is public and only view permission is required
      if (requiredPermission === 'view' && canvas.settings.isPublic) {
        req.canvas = canvas;
        return next();
      }

      // Authentication required for non-public canvases or edit operations
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const userPermission = canvas.getUserPermission(req.user._id);
      
      if (!userPermission) {
        return res.status(403).json({ message: 'Access denied to this canvas' });
      }

      // Check if user has required permission
      if (requiredPermission === 'edit' && !canvas.canEdit(req.user._id)) {
        return res.status(403).json({ message: 'Edit permission required' });
      }

      req.canvas = canvas;
      next();
    } catch (error) {
      console.error('Canvas permission check error:', error);
      res.status(500).json({ message: 'Server error checking canvas permissions' });
    }
  };
};

module.exports = {
  auth,
  optionalAuth,
  requireAdmin,
  checkCanvasPermission
};