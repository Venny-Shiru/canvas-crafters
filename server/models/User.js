import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  canvases: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Canvas'
  }],
  collaborations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Canvas'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpire: {
    type: Date,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user's full name (if needed later)
userSchema.virtual('canvasCount').get(function() {
  return this.canvases ? this.canvases.length : 0;
});

// Index for better query performance
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate a safe user object (without sensitive data)
userSchema.methods.toSafeObject = function() {
  const userObject = this.toObject();
  delete userObject.password;
  
  // Convert relative avatar URLs to absolute URLs and fix localhost URLs
  if (userObject.avatar) {
    // Fix existing localhost URLs to Railway URLs
    if (userObject.avatar.startsWith('http://localhost:5000')) {
      const path = userObject.avatar.replace('http://localhost:5000', '');
      userObject.avatar = `https://canvas-crafters-production.up.railway.app${path}`;
      console.log('Fixed localhost avatar URL to:', userObject.avatar);
    }
    // Convert relative URLs to absolute URLs
    else if (userObject.avatar.startsWith('/uploads/')) {
      let baseUrl = process.env.SERVER_URL;
      
      if (!baseUrl && process.env.RAILWAY_PUBLIC_DOMAIN) {
        baseUrl = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
      }
      
      if (!baseUrl && process.env.NODE_ENV === 'production') {
        baseUrl = 'https://canvas-crafters-production.up.railway.app';
      }
      
      if (!baseUrl) {
        baseUrl = 'http://localhost:5000';
      }
      
      userObject.avatar = `${baseUrl}${userObject.avatar}`;
      console.log('Generated avatar URL:', userObject.avatar);
    }
  }
  
  return userObject;
};

// Instance method to generate password reset token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Instance method to validate reset token
userSchema.methods.validateResetToken = function(token) {
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  return (
    this.resetPasswordToken === hashedToken &&
    this.resetPasswordExpire > Date.now()
  );
};

// Static method to find user by email or username
userSchema.statics.findByEmailOrUsername = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ]
  }).select('+password');
};

const User = mongoose.model('User', userSchema);
export default User;