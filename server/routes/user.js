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
      .populate('canvases', 'title thumbnail createdAt settings.isPublic views likeCount')
      .populate('collaborations', 'title thumbnail owner createdAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter canvases based on privacy settings
    let visibleCanvases = user.canvases;
    
    // If not the owner, only show public canvases
    if (!req.user || req.user._id.toString() !== user._id.toString()) {
      visibleCanvases = user.canvases.filter(canvas => canvas.settings.isPublic);
    }

    // Get user statistics
    const stats = {
      canvasCount: visibleCanvases.length,
      totalViews: visibleCanvases.reduce((sum, canvas) => sum + canvas.views, 0),
      totalLikes: visibleCanvases.reduce((sum, canvas) => sum + (canvas.likeCount || 0), 0),
      collaborationCount: user.collaborations.length,
      joinDate: user.createdAt
    };

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
        lastLogin: req.user && req.user._id.toString() === user._id.toString() 
          ? user.lastLogin 
          : undefined
      },
      canvases: visibleCanvases,
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
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 2, max: 30 })
    .withMessage('Search query must be between 2 and 30 characters'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Limit must be between 1 and 20')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { q: searchQuery, limit = 10 } = req.query;

  try {
    // Search users by username (case-insensitive)
    const users = await User.find({
      username: { $regex: searchQuery, $options: 'i' },
      isActive: true
    })
    .select('username avatar bio createdAt')
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

    res.json({
      users,
      total: users.length
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error searching users' });
  }
}));

// @route   GET /api/user/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', auth, asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's canvases
    const myCanvases = await Canvas.find({ 
      owner: userId, 
      isActive: true 
    })
    .select('title thumbnail createdAt lastModified views likes settings.isPublic')
    .sort({ lastModified: -1 })
    .limit(10);

    // Get collaborations
    const collaborations = await Canvas.find({
      'collaborators.user': userId,
      isActive: true
    })
    .populate('owner', 'username avatar')
    .select('title thumbnail createdAt lastModified owner')
    .sort({ lastModified: -1 })
    .limit(10);

    // Get recent activity (liked canvases)
    const recentLikes = await Canvas.find({
      likes: userId,
      isActive: true
    })
    .populate('owner', 'username avatar')
    .select('title thumbnail createdAt owner')
    .sort({ createdAt: -1 })
    .limit(5);

    // Calculate statistics
    const stats = {
      myCanvasCount: myCanvases.length,
      collaborationCount: collaborations.length,
      totalViews: myCanvases.reduce((sum, canvas) => sum + canvas.views, 0),
      totalLikes: myCanvases.reduce((sum, canvas) => sum + canvas.likes.length, 0),
      publicCanvases: myCanvases.filter(canvas => canvas.settings.isPublic).length
    };

    res.json({
      stats,
      myCanvases,
      collaborations,
      recentLikes
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error getting dashboard data' });
  }
}));

// @route   GET /api/user/activity
// @desc    Get user activity feed
// @access  Private
router.get('/activity', auth, [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    // Get recent canvases from users the current user might be interested in
    // This is a simplified activity feed - in a real app, you might track follows/friends
    const recentCanvases = await Canvas.find({
      'settings.isPublic': true,
      isActive: true,
      owner: { $ne: req.user._id } // Exclude own canvases
    })
    .populate('owner', 'username avatar')
    .select('title thumbnail createdAt owner views likes')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

    // Get total count
    const total = await Canvas.countDocuments({
      'settings.isPublic': true,
      isActive: true,
      owner: { $ne: req.user._id }
    });

    res.json({
      activity: recentCanvases.map(canvas => ({
        type: 'canvas_created',
        canvas: {
          _id: canvas._id,
          title: canvas.title,
          thumbnail: canvas.thumbnail,
          owner: canvas.owner,
          createdAt: canvas.createdAt,
          views: canvas.views,
          likeCount: canvas.likes.length
        },
        timestamp: canvas.createdAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ message: 'Server error getting activity feed' });
  }
}));

// @route   GET /api/user/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    // Get detailed statistics
    const [
      canvasStats,
      collaborationStats,
      likeStats
    ] = await Promise.all([
      // Canvas statistics
      Canvas.aggregate([
        { $match: { owner: userId, isActive: true } },
        {
          $group: {
            _id: null,
            totalCanvases: { $sum: 1 },
            totalViews: { $sum: '$views' },
            totalLikes: { $sum: { $size: '$likes' } },
            publicCanvases: {
              $sum: { $cond: ['$settings.isPublic', 1, 0] }
            }
          }
        }
      ]),
      
      // Collaboration statistics
      Canvas.countDocuments({
        'collaborators.user': userId,
        isActive: true
      }),
      
      // Likes given statistics
      Canvas.countDocuments({
        likes: userId,
        isActive: true
      })
    ]);

    const stats = {
      canvases: {
        total: canvasStats[0]?.totalCanvases || 0,
        public: canvasStats[0]?.publicCanvases || 0,
        private: (canvasStats[0]?.totalCanvases || 0) - (canvasStats[0]?.publicCanvases || 0)
      },
      engagement: {
        totalViews: canvasStats[0]?.totalViews || 0,
        totalLikes: canvasStats[0]?.totalLikes || 0,
        likesGiven: likeStats
      },
      collaboration: {
        collaboratingOn: collaborationStats
      }
    };

    res.json({ stats });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error getting user statistics' });
  }
}));

export default router;