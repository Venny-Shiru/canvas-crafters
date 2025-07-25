const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Canvas = require('../models/Canvas');
const User = require('../models/User');
const { auth, optionalAuth, checkCanvasPermission } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

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

// @route   POST /api/canvas
// @desc    Create a new canvas
// @access  Private
router.post('/', auth, [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Canvas title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('dimensions.width')
    .optional()
    .isInt({ min: 100, max: 4000 })
    .withMessage('Canvas width must be between 100 and 4000 pixels'),
  body('dimensions.height')
    .optional()
    .isInt({ min: 100, max: 4000 })
    .withMessage('Canvas height must be between 100 and 4000 pixels'),
  body('settings.isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('settings.backgroundColor')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Invalid background color format'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot exceed 30 characters')
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
    title,
    description,
    dimensions,
    settings,
    tags
  } = req.body;

  try {
    // Create new canvas
    const canvas = new Canvas({
      title,
      description,
      owner: req.user._id,
      dimensions: dimensions || { width: 800, height: 600 },
      settings: {
        isPublic: settings?.isPublic || false,
        allowComments: settings?.allowComments !== false,
        backgroundColor: settings?.backgroundColor || '#ffffff'
      },
      tags: tags || []
    });

    await canvas.save();

    // Add canvas to user's canvases array
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { canvases: canvas._id } }
    );

    // Populate the response
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

// @route   GET /api/canvas/:id
// @desc    Get a specific canvas
// @access  Public/Private (depends on canvas privacy)
router.get('/:id', optionalAuth, checkCanvasPermission('view'), asyncHandler(async (req, res) => {
  try {
    const canvas = req.canvas;

    // Increment view count (only if not the owner)
    if (!req.user || !canvas.isOwner(req.user._id)) {
      canvas.views += 1;
      await canvas.save();
    }

    // Populate the canvas with owner and collaborators
    await canvas.populate('owner', 'username avatar');
    await canvas.populate('collaborators.user', 'username avatar');

    res.json({ canvas });

  } catch (error) {
    console.error('Get canvas error:', error);
    res.status(500).json({ message: 'Server error getting canvas' });
  }
}));

// @route   PUT /api/canvas/:id
// @desc    Update canvas metadata
// @access  Private (owner or editor)
router.put('/:id', auth, checkCanvasPermission('edit'), [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Canvas title cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('settings.isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('settings.backgroundColor')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Invalid background color format'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { title, description, settings, tags } = req.body;

  try {
    const canvas = req.canvas;

    // Update fields if provided
    if (title !== undefined) canvas.title = title;
    if (description !== undefined) canvas.description = description;
    if (tags !== undefined) canvas.tags = tags;

    if (settings) {
      if (settings.isPublic !== undefined) canvas.settings.isPublic = settings.isPublic;
      if (settings.allowComments !== undefined) canvas.settings.allowComments = settings.allowComments;
      if (settings.backgroundColor !== undefined) canvas.settings.backgroundColor = settings.backgroundColor;
    }

    await canvas.save();

    // Populate the response
    await canvas.populate('owner', 'username avatar');
    await canvas.populate('collaborators.user', 'username avatar');

    res.json({
      message: 'Canvas updated successfully',
      canvas
    });

  } catch (error) {
    console.error('Update canvas error:', error);
    res.status(500).json({ message: 'Server error updating canvas' });
  }
}));

// @route   POST /api/canvas/:id/save
// @desc    Save canvas data
// @access  Private (owner or editor)
router.post('/:id/save', auth, checkCanvasPermission('edit'), [
  body('canvasData')
    .notEmpty()
    .withMessage('Canvas data is required'),
  body('thumbnail')
    .optional()
    .isString()
    .withMessage('Thumbnail must be a string')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const canvas = req.canvas;
    const { canvasData, thumbnail } = req.body;

    // Update canvas data
    canvas.canvasData = canvasData;
    if (thumbnail) canvas.thumbnail = thumbnail;
    
    await canvas.save();

    res.json({
      message: 'Canvas saved successfully',
      timestamp: canvas.lastModified
    });

  } catch (error) {
    console.error('Save canvas error:', error);
    res.status(500).json({ message: 'Server error saving canvas' });
  }
}));

// @route   DELETE /api/canvas/:id
// @desc    Delete a canvas
// @access  Private (owner only)
router.delete('/:id', auth, checkCanvasPermission('edit'), asyncHandler(async (req, res) => {
  try {
    const canvas = req.canvas;

    // Only owner can delete
    if (!canvas.isOwner(req.user._id)) {
      return res.status(403).json({ message: 'Only the owner can delete this canvas' });
    }

    // Soft delete
    canvas.isActive = false;
    await canvas.save();

    res.json({ message: 'Canvas deleted successfully' });

  } catch (error) {
    console.error('Delete canvas error:', error);
    res.status(500).json({ message: 'Server error deleting canvas' });
  }
}));

// @route   POST /api/canvas/:id/like
// @desc    Like/unlike a canvas
// @access  Private
router.post('/:id/like', auth, checkCanvasPermission('view'), asyncHandler(async (req, res) => {
  try {
    const canvas = req.canvas;
    const userId = req.user._id;

    const hasLiked = canvas.likes.includes(userId);

    if (hasLiked) {
      // Unlike
      canvas.likes = canvas.likes.filter(id => !id.equals(userId));
    } else {
      // Like
      canvas.likes.push(userId);
    }

    await canvas.save();

    res.json({
      message: hasLiked ? 'Canvas unliked' : 'Canvas liked',
      liked: !hasLiked,
      likeCount: canvas.likes.length
    });

  } catch (error) {
    console.error('Like canvas error:', error);
    res.status(500).json({ message: 'Server error liking canvas' });
  }
}));

module.exports = router;