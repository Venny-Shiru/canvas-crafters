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
  views: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  version: {
    type: Number,
    default: 1
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

// Virtual for collaborator count
canvasSchema.virtual('collaboratorCount').get(function() {
  return this.collaborators ? this.collaborators.length : 0;
});

// Indexes for better query performance
canvasSchema.index({ owner: 1, createdAt: -1 });
canvasSchema.index({ 'settings.isPublic': 1, createdAt: -1 });
canvasSchema.index({ tags: 1 });
canvasSchema.index({ title: 'text', description: 'text' });

// Pre-save middleware to update lastModified
canvasSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastModified = new Date();
    this.version += 1;
  }
  next();
});

// Instance method to check if user is owner
canvasSchema.methods.isOwner = function(userId) {
  return this.owner.toString() === userId.toString();
};

// Instance method to check if user is collaborator
canvasSchema.methods.isCollaborator = function(userId) {
  return this.collaborators.some(
    collab => collab.user.toString() === userId.toString()
  );
};

// Instance method to get user permission
canvasSchema.methods.getUserPermission = function(userId) {
  if (this.isOwner(userId)) return 'owner';
  
  const collaborator = this.collaborators.find(
    collab => collab.user.toString() === userId.toString()
  );
  
  return collaborator ? collaborator.permission : null;
};

// Instance method to check if user can edit
canvasSchema.methods.canEdit = function(userId) {
  const permission = this.getUserPermission(userId);
  return permission === 'owner' || permission === 'edit';
};

// Static method to find public canvases
canvasSchema.statics.findPublic = function(limit = 20, skip = 0) {
  return this.find({ 'settings.isPublic': true, isActive: true })
    .populate('owner', 'username avatar')
    .populate('collaborators.user', 'username avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to find user's canvases
canvasSchema.statics.findByUser = function(userId, includeCollaborations = false) {
  const query = includeCollaborations 
    ? {
        $or: [
          { owner: userId },
          { 'collaborators.user': userId }
        ],
        isActive: true
      }
    : { owner: userId, isActive: true };

  return this.find(query)
    .populate('owner', 'username avatar')
    .populate('collaborators.user', 'username avatar')
    .sort({ lastModified: -1 });
};

const Canvas = mongoose.model('Canvas', canvasSchema);
export default Canvas;