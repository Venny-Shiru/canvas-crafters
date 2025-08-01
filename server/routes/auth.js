import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendEmail, getPasswordResetEmailTemplate } from '../utils/email.js';

const router = express.Router();

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = './server/uploads/avatars/';
    console.log('Multer destination called, uploadPath:', uploadPath);
    console.log('Current working directory:', process.cwd());
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      console.log('Creating upload directory:', uploadPath);
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: userId_timestamp.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = req.user._id + '_' + uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback-secret-key',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findByEmailOrUsername(email);
    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email.toLowerCase() 
          ? 'Email is already registered' 
          : 'Username is already taken'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.toSafeObject()
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
}));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('identifier')
    .notEmpty()
    .withMessage('Email or username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { identifier, password } = req.body;
  console.log('🔐 Login attempt:', { identifier, passwordLength: password?.length });

  try {
    // Find user by email or username
    const user = await User.findByEmailOrUsername(identifier);
    console.log('👤 User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('❌ User not found for identifier:', identifier);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('✅ User found:', { username: user.username, email: user.email, isActive: user.isActive });

    if (!user.isActive) {
      console.log('❌ Account deactivated for user:', user.username);
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    console.log('🔑 Password match:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Password mismatch for user:', user.username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: user.toSafeObject()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
}));

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('canvases', 'title thumbnail createdAt')
      .populate('collaborations', 'title thumbnail owner');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: user.toSafeObject()
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error getting user data' });
  }
}));

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { username, bio, email } = req.body;

  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username or email is being changed and if it's already taken
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      user.username = username;
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already registered' });
      }
      user.email = email;
    }

    if (bio !== undefined) {
      user.bio = bio;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.toSafeObject()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
}));

// @route   POST /api/auth/upload-avatar
// @desc    Upload user avatar
// @access  Private
router.post('/upload-avatar', auth, (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ message: err.message || 'File upload error' });
    }
    next();
  });
}, asyncHandler(async (req, res) => {
  try {
    console.log('Avatar upload endpoint hit');
    console.log('Request file:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's avatar path
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    console.log('Updating user avatar to:', avatarUrl);
    
    user.avatar = avatarUrl;
    await user.save();

    // Convert to absolute URL for response
    const baseUrl = process.env.SERVER_URL || 'http://localhost:5000';
    const absoluteAvatarUrl = `${baseUrl}${avatarUrl}`;

    console.log('Avatar upload successful, responding with:', {
      message: 'Avatar uploaded successfully',
      avatar: absoluteAvatarUrl,
      filename: req.file.filename
    });

    res.json({
      message: 'Avatar uploaded successfully',
      avatar: absoluteAvatarUrl,
      user: user.toSafeObject()
    });

  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: 'Server error uploading avatar' });
  }
}));

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', auth, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id).select('+password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error changing password' });
  }
}));

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', auth, asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    // Generate new token
    const token = generateToken(user._id);

    res.json({
      message: 'Token refreshed successfully',
      token
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Server error refreshing token' });
  }
}));

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal that the user doesn't exist for security
      return res.json({
        message: 'If a user with that email exists, a password reset link has been sent'
      });
    }

    if (!user.isActive) {
      return res.status(400).json({
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    // Get email template
    const { html, text } = getPasswordResetEmailTemplate(user.username, resetUrl);

    try {
      await sendEmail({
        email: user.email,
        subject: 'Canvas Crafters - Password Reset Request',
        message: text,
        html: html
      });

      res.json({
        message: 'Password reset email sent successfully'
      });

    } catch (emailError) {
      console.error('Email send error:', emailError);
      
      // Clear reset token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        message: 'Email could not be sent. Please try again later.'
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error processing password reset' });
  }
}));

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password with token
// @access  Public
router.post('/reset-password/:token', [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { token } = req.params;
  const { password } = req.body;

  try {
    // Find user by reset token and check if token is still valid
    const user = await User.findOne({
      resetPasswordToken: crypto
        .createHash('sha256')
        .update(token)
        .digest('hex'),
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+resetPasswordToken +resetPasswordExpire');

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired password reset token'
      });
    }

    if (!user.isActive) {
      return res.status(400).json({
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate new JWT token
    const jwtToken = generateToken(user._id);

    res.json({
      message: 'Password reset successful',
      token: jwtToken,
      user: user.toSafeObject()
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error resetting password' });
  }
}));

export default router;