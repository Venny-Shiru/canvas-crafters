import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Canvas from '../models/Canvas.js';

// Store active users and their canvas sessions
const activeUsers = new Map();
const canvasSessions = new Map();

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return next(new Error('Authentication error'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

const canvasSocket = (io) => {
  // Authentication middleware
  io.use(socketAuth);

  io.on('connection', (socket) => {
    console.log(`🔌 User ${socket.user.username} connected`);
    
    // Add user to active users
    activeUsers.set(socket.userId, {
      socketId: socket.id,
      user: socket.user,
      currentCanvas: null,
      connectedAt: new Date()
    });

    // Handle joining a canvas room
    socket.on('join-canvas', async (data) => {
      try {
        const { canvasId } = data;
        
        if (!canvasId) {
          socket.emit('error', { message: 'Canvas ID is required' });
          return;
        }

        // Verify user has access to this canvas
        const canvas = await Canvas.findById(canvasId);
        
        if (!canvas) {
          socket.emit('error', { message: 'Canvas not found' });
          return;
        }

        // Check permissions
        const userPermission = canvas.getUserPermission(socket.userId);
        const canAccess = canvas.settings.isPublic || userPermission;
        
        if (!canAccess) {
          socket.emit('error', { message: 'Access denied to this canvas' });
          return;
        }

        // Leave previous canvas room if any
        if (activeUsers.get(socket.userId)?.currentCanvas) {
          const previousCanvas = activeUsers.get(socket.userId).currentCanvas;
          socket.leave(`canvas-${previousCanvas}`);
          
          // Remove from previous canvas session
          if (canvasSessions.has(previousCanvas)) {
            const session = canvasSessions.get(previousCanvas);
            session.users = session.users.filter(u => u.userId !== socket.userId);
            
            // Notify others that user left
            socket.to(`canvas-${previousCanvas}`).emit('user-left', {
              user: {
                _id: socket.userId,
                username: socket.user.username,
                avatar: socket.user.avatar
              }
            });

            if (session.users.length === 0) {
              canvasSessions.delete(previousCanvas);
            } else {
              canvasSessions.set(previousCanvas, session);
            }
          }
        }

        // Join new canvas room
        socket.join(`canvas-${canvasId}`);
        
        // Update user's current canvas
        const userData = activeUsers.get(socket.userId);
        userData.currentCanvas = canvasId;
        activeUsers.set(socket.userId, userData);

        // Add to canvas session
        if (!canvasSessions.has(canvasId)) {
          canvasSessions.set(canvasId, {
            canvasId,
            users: [],
            createdAt: new Date()
          });
        }

        const session = canvasSessions.get(canvasId);
        const existingUserIndex = session.users.findIndex(u => u.userId === socket.userId);
        
        const userInfo = {
          userId: socket.userId,
          socketId: socket.id,
          username: socket.user.username,
          avatar: socket.user.avatar,
          permission: userPermission || 'view',
          joinedAt: new Date()
        };

        if (existingUserIndex >= 0) {
          session.users[existingUserIndex] = userInfo;
        } else {
          session.users.push(userInfo);
        }

        canvasSessions.set(canvasId, session);

        // Send current users list to the newly joined user
        socket.emit('canvas-joined', {
          canvasId,
          users: session.users.map(u => ({
            _id: u.userId,
            username: u.username,
            avatar: u.avatar,
            permission: u.permission
          }))
        });

        // Notify others that a new user joined
        socket.to(`canvas-${canvasId}`).emit('user-joined', {
          user: {
            _id: socket.userId,
            username: socket.user.username,
            avatar: socket.user.avatar,
            permission: userPermission || 'view'
          }
        });

        console.log(`👥 User ${socket.user.username} joined canvas ${canvasId}`);

      } catch (error) {
        console.error('Join canvas error:', error);
        socket.emit('error', { message: 'Error joining canvas' });
      }
    });

    // Handle drawing events
    socket.on('drawing', async (data) => {
      try {
        const { canvasId, drawingData } = data;
        const userSession = activeUsers.get(socket.userId);
        
        if (!userSession || userSession.currentCanvas !== canvasId) {
          socket.emit('error', { message: 'Not connected to this canvas' });
          return;
        }

        // Verify user can edit this canvas
        const canvas = await Canvas.findById(canvasId);
        if (!canvas || !canvas.canEdit(socket.userId)) {
          socket.emit('error', { message: 'Edit permission required' });
          return;
        }

        // Broadcast drawing data to other users in the same canvas
        socket.to(`canvas-${canvasId}`).emit('drawing', {
          userId: socket.userId,
          username: socket.user.username,
          drawingData,
          timestamp: new Date()
        });

        // Save drawing data to database (optional - for persistent storage)
        if (drawingData.type === 'save') {
          canvas.drawingData.push({
            type: drawingData.tool || 'path',
            data: drawingData,
            userId: socket.userId,
            timestamp: new Date()
          });
          
          await canvas.save();
        }

      } catch (error) {
        console.error('Drawing event error:', error);
        socket.emit('error', { message: 'Error processing drawing event' });
      }
    });

    // Handle cursor movement
    socket.on('cursor-move', (data) => {
      try {
        const { canvasId, x, y } = data;
        const userSession = activeUsers.get(socket.userId);
        
        if (!userSession || userSession.currentCanvas !== canvasId) {
          return;
        }

        // Broadcast cursor position to other users
        socket.to(`canvas-${canvasId}`).emit('cursor-move', {
          userId: socket.userId,
          username: socket.user.username,
          x,
          y,
          timestamp: new Date()
        });

      } catch (error) {
        console.error('Cursor move error:', error);
      }
    });

    // Handle canvas save
    socket.on('save-canvas', async (data) => {
      try {
        const { canvasId, canvasData, thumbnail } = data;
        const userSession = activeUsers.get(socket.userId);
        
        if (!userSession || userSession.currentCanvas !== canvasId) {
          socket.emit('error', { message: 'Not connected to this canvas' });
          return;
        }

        // Verify user can edit
        const canvas = await Canvas.findById(canvasId);
        if (!canvas || !canvas.canEdit(socket.userId)) {
          socket.emit('error', { message: 'Edit permission required' });
          return;
        }

        // Save canvas data
        canvas.canvasData = canvasData;
        if (thumbnail) canvas.thumbnail = thumbnail;
        
        await canvas.save();

        // Notify all users in the canvas that it was saved
        io.to(`canvas-${canvasId}`).emit('canvas-saved', {
          savedBy: {
            _id: socket.userId,
            username: socket.user.username
          },
          timestamp: canvas.lastModified
        });

        console.log(`💾 Canvas ${canvasId} saved by ${socket.user.username}`);

      } catch (error) {
        console.error('Save canvas error:', error);
        socket.emit('error', { message: 'Error saving canvas' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 User ${socket.user.username} disconnected`);
      
      const userData = activeUsers.get(socket.userId);
      
      if (userData && userData.currentCanvas) {
        const canvasId = userData.currentCanvas;
        
        // Remove from canvas session
        if (canvasSessions.has(canvasId)) {
          const session = canvasSessions.get(canvasId);
          session.users = session.users.filter(u => u.userId !== socket.userId);
          
          // Notify others that user left
          socket.to(`canvas-${canvasId}`).emit('user-left', {
            user: {
              _id: socket.userId,
              username: socket.user.username,
              avatar: socket.user.avatar
            }
          });

          if (session.users.length === 0) {
            canvasSessions.delete(canvasId);
          } else {
            canvasSessions.set(canvasId, session);
          }
        }
      }

      // Remove from active users
      activeUsers.delete(socket.userId);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Cleanup inactive sessions periodically
  setInterval(() => {
    const now = new Date();
    const maxIdleTime = 30 * 60 * 1000; // 30 minutes

    for (const [canvasId, session] of canvasSessions.entries()) {
      if (now - session.createdAt > maxIdleTime && session.users.length === 0) {
        canvasSessions.delete(canvasId);
        console.log(`🧹 Cleaned up inactive canvas session: ${canvasId}`);
      }
    }
  }, 10 * 60 * 1000); // Check every 10 minutes
};

export default canvasSocket;