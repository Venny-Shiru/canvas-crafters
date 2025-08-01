import express from 'express';
import { query, validationResult } from 'express-validator';
import User from '../models/User.js';
import Canvas from '../models/Canvas.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @route   GET /api/user/profile/:username
// @desc    Get user profile by username
// @access  Public
router.get('/profile/:username', optionalAuth, asyncHandler(async (req, res) => {
  try {
    const { username } = req.params;

    // Find user by username
    const user = await User.findOne({ username, isActive: true })
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's canvases
    const canvases = await Canvas.find({ 
      owner: user._id, 
      isActive: true,
      ...((!req.user || req.user._id.toString() !== user._id.toString()) && { 'settings.isPublic': true })
    })
    .select('title thumbnail createdAt settings.isPublic stats.views stats.likes')
    .populate('owner', 'username avatar')
    .sort({ createdAt: -1 });

    // Get user statistics
    const stats = {
      canvasCount: canvases.length,
      totalViews: canvases.reduce((sum, canvas) => sum + (canvas.stats.views || 0), 0),
      totalLikes: canvases.reduce((sum, canvas) => sum + (canvas.stats.likes || 0), 0),
      joinDate: user.createdAt
    };

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        createdAt: user.createdAt
      },
      canvases,
      stats
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error getting user profile' });
  }
}));

// @route   GET /api/user/search
// @desc    Search users by username
// @access  Public
router.get('/search', [
  query('q')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Search query must be between 1 and 50 characters'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { q, page = 1, limit = 10 } = req.query;

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Search users by username
    const users = await User.find({
      username: { $regex: q, $options: 'i' },
      isActive: true
    })
    .select('username avatar createdAt')
    .sort({ username: 1 })
    .limit(parseInt(limit))
    .skip(skip);

    // Get total count for pagination
    const total = await User.countDocuments({
      username: { $regex: q, $options: 'i' },
      isActive: true
    });

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNext: skip + users.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error searching users' });
  }
}));

export default router;
