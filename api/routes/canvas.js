import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Canvas from '../models/Canvas.js';
import User from '../models/User.js';
import { auth, optionalAuth, checkCanvasPermission } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @route   GET /api/canvas
// @desc    Get canvases (public or user's canvases)
// @access  Public/Private
router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term too long'),
  query('tags').optional().trim(),
  query('sortBy').optional().isIn(['createdAt', 'lastModified', 'views', 'likes']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const {
    page = 1,
    limit = 20,
    search,
    tags,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    type = 'public' // 'public', 'my', 'collaborations'
  } = req.query;

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let query = { isActive: true };
    let sort = {};

    // Build sort object
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Handle different canvas types
    if (type === 'my' && req.user) {
      query.owner = req.user._id;
    } else if (type === 'collaborations' && req.user) {
      query['collaborators.user'] = req.user._id;
    } else {
      // Public canvases only
      query['settings.isPublic'] = true;
    }

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Add tag filtering
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Get canvases with pagination
    const canvases = await Canvas.find(query)
      .populate('owner', 'username avatar')
      .populate('collaborators.user', 'username avatar')
      .select('-drawingData -canvasData') // Exclude large data fields for list view
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const total = await Canvas.countDocuments(query);

    res.json({
      canvases,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNext: skip + canvases.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get canvases error:', error);
    res.status(500).json({ message: 'Server error getting canvases' });
  }
}));

// @route   GET /api/canvas/:id
// @desc    Get canvas by ID
// @access  Public/Private
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  try {
    const canvas = await Canvas.findById(req.params.id)
      .populate('owner', 'username avatar')
      .populate('collaborators.user', 'username avatar');

    if (!canvas) {
      return res.status(404).json({ message: 'Canvas not found' });
    }

    // Check if user has permission to view this canvas
    if (!canvas.settings.isPublic) {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const hasAccess = canvas.owner._id.toString() === req.user._id.toString() ||
                       canvas.collaborators.some(collab => 
                         collab.user._id.toString() === req.user._id.toString()
                       );
      
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Increment view count if it's not the owner viewing
    if (!req.user || canvas.owner._id.toString() !== req.user._id.toString()) {
      canvas.stats.views += 1;
      await canvas.save();
    }

    res.json({ canvas });

  } catch (error) {
    console.error('Get canvas error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid canvas ID' });
    }
    res.status(500).json({ message: 'Server error getting canvas' });
  }
}));

// @route   POST /api/canvas
// @desc    Create a new canvas
// @access  Private
router.post('/', auth, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { title, description, tags = [], settings = {} } = req.body;

  try {
    // Create new canvas
    const canvas = new Canvas({
      title,
      description,
      tags,
      owner: req.user._id,
      settings: {
        isPublic: settings.isPublic || false,
        allowComments: settings.allowComments !== false,
        allowCollaborations: settings.allowCollaborations || false,
        maxCollaborators: settings.maxCollaborators || 10
      }
    });

    await canvas.save();

    // Populate owner information
    await canvas.populate('owner', 'username avatar');

    res.status(201).json({
      message: 'Canvas created successfully',
      canvas
    });

  } catch (error) {
    console.error('Create canvas error:', error);
    res.status(500).json({ message: 'Server error creating canvas' });
  }
}));

export default router;
