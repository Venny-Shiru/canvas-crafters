import mongoose from 'mongoose';

const canvasSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Canvas title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Canvas owner is required']
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  canvasData: {
    type: String, // Base64 encoded canvas data
    default: ''
  },
  drawingData: [{
    type: {
      type: String,
      enum: ['path', 'circle', 'rectangle', 'text', 'image'],
      required: true
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  dimensions: {
    width: {
      type: Number,
      default: 800,
      min: [100, 'Canvas width must be at least 100px'],
      max: [4000, 'Canvas width cannot exceed 4000px']
    },
    height: {
      type: Number,
      default: 600,
      min: [100, 'Canvas height must be at least 100px'],
      max: [4000, 'Canvas height cannot exceed 4000px']
    }
  },
  settings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowComments: {
      type: Boolean,
      default: true
    },
    allowCollaborations: {
      type: Boolean,
      default: false
    },
    maxCollaborators: {
      type: Number,
      default: 10,
      min: 1,
      max: 50
    },
    backgroundColor: {
      type: String,
      default: '#ffffff',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format']
    }
  },
  thumbnail: {
    type: String, // Base64 encoded thumbnail
    default: ''
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  stats: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for like count
canvasSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Index for better query performance
canvasSchema.index({ owner: 1, createdAt: -1 });
canvasSchema.index({ 'settings.isPublic': 1, createdAt: -1 });
canvasSchema.index({ tags: 1 });

// Pre-save middleware to update lastModified
canvasSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

const Canvas = mongoose.model('Canvas', canvasSchema);

export default Canvas;
