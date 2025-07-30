import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Save, 
  Download, 
  Share2, 
  Users,
  Undo,
  Redo,
  PaintBucket,
  Eraser,
  Circle,
  Square,
  Minus,
  Type,
  Brush,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface CanvasData {
  _id: string;
  title: string;
  description?: string;
  owner: {
    _id: string;
    username: string;
    avatar?: string;
  };
  dimensions: {
    width: number;
    height: number;
  };
  settings: {
    isPublic: boolean;
    backgroundColor: string;
  };
  collaborators: Array<{
    user: {
      _id: string;
      username: string;
      avatar?: string;
    };
    permission: string;
  }>;
  canvasData?: string; // Base64 encoded canvas data
}

interface DrawingTool {
  type: 'brush' | 'eraser' | 'line' | 'circle' | 'rectangle' | 'fill' | 'text';
  size: number;
  color: string;
  opacity: number;
}

interface ConnectedUser {
  _id: string;
  username: string;
  avatar?: string;
  permission: string;
  cursor?: { x: number; y: number };
}

const CanvasEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Canvas state
  const [canvas, setCanvas] = useState<CanvasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<DrawingTool>({
    type: 'brush',
    size: 5,
    color: '#000000',
    opacity: 1
  });

  // UI state
  const [showToolbar, setShowToolbar] = useState(true);
  const [showUsers, setShowUsers] = useState(true);
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);

  // Initialize canvas and socket connection
  useEffect(() => {
    if (!id) return;

    const initializeCanvas = async () => {
      try {
        setLoading(true);
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        
        // Fetch canvas data
        const response = await fetch(`${API_BASE_URL}/canvas/${id}`, {
          headers: state.isAuthenticated ? {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          } : {}
        });

        if (!response.ok) {
          throw new Error('Canvas not found');
        }

        const data = await response.json();
        setCanvas(data.canvas);

        // Initialize socket connection if authenticated
        if (state.isAuthenticated) {
          initializeSocket();
        }

        // Setup canvas drawing context
        setupCanvas(data.canvas);

      } catch (error) {
        console.error('Error loading canvas:', error);
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };

    initializeCanvas();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [id, state.isAuthenticated, navigate]);

  const initializeSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    socketRef.current = io(process.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token }
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to canvas collaboration');
      socketRef.current?.emit('join-canvas', { canvasId: id });
    });

    socketRef.current.on('canvas-joined', (data) => {
      setConnectedUsers(data.users || []);
    });

    socketRef.current.on('user-joined', (data) => {
      setConnectedUsers(prev => [...prev, data.user]);
    });

    socketRef.current.on('user-left', (data) => {
      setConnectedUsers(prev => prev.filter(user => user._id !== data.user._id));
    });

    socketRef.current.on('drawing', (data) => {
      // Handle remote drawing events
      drawRemoteStroke(data.drawingData);
    });

    socketRef.current.on('cursor-move', (data) => {
      // Update remote cursor position
      setConnectedUsers(prev => 
        prev.map(user => 
          user._id === data.userId 
            ? { ...user, cursor: { x: data.x, y: data.y } }
            : user
        )
      );
    });

    socketRef.current.on('canvas-saved', () => {
      setSaving(false);
    });
  };

  const setupCanvas = (canvasData: CanvasData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas dimensions
    canvas.width = canvasData.dimensions.width;
    canvas.height = canvasData.dimensions.height;

    // Set background
    context.fillStyle = canvasData.settings.backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Configure drawing context
    context.lineCap = 'round';
    context.lineJoin = 'round';
    
    contextRef.current = context;

    // Load existing canvas data if available
    if (canvasData.canvasData) {
      const img = new Image();
      img.onload = () => {
        context.drawImage(img, 0, 0);
        saveToUndoStack();
      };
      img.src = canvasData.canvasData;
    } else {
      saveToUndoStack();
    }
  };

  const saveToUndoStack = () => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    const imageData = contextRef.current.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack(prev => [...prev.slice(-19), imageData]); // Keep last 20 states
    setRedoStack([]); // Clear redo stack when new action is performed
  };

  const drawRemoteStroke = (drawingData: any) => {
    if (!contextRef.current) return;

    const context = contextRef.current;
    context.globalCompositeOperation = drawingData.tool === 'eraser' ? 'destination-out' : 'source-over';
    context.strokeStyle = drawingData.color || '#000000';
    context.lineWidth = drawingData.size || 5;
    context.globalAlpha = drawingData.opacity || 1;

    if (drawingData.type === 'start') {
      context.beginPath();
      context.moveTo(drawingData.x, drawingData.y);
    } else if (drawingData.type === 'draw') {
      context.lineTo(drawingData.x, drawingData.y);
      context.stroke();
    } else if (drawingData.type === 'end') {
      context.closePath();
    }
  };

  const startDrawing = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!contextRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setIsDrawing(true);

    const context = contextRef.current;
    context.globalCompositeOperation = currentTool.type === 'eraser' ? 'destination-out' : 'source-over';
    context.strokeStyle = currentTool.color;
    context.lineWidth = currentTool.size;
    context.globalAlpha = currentTool.opacity;

    context.beginPath();
    context.moveTo(x, y);

    // Emit drawing start to other users
    if (socketRef.current) {
      socketRef.current.emit('drawing', {
        canvasId: id,
        drawingData: {
          type: 'start',
          x,
          y,
          tool: currentTool.type,
          color: currentTool.color,
          size: currentTool.size,
          opacity: currentTool.opacity
        }
      });
    }
  }, [currentTool, id]);

  const draw = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();

    // Emit drawing data to other users
    if (socketRef.current) {
      socketRef.current.emit('drawing', {
        canvasId: id,
        drawingData: {
          type: 'draw',
          x,
          y
        }
      });
    }

    // Update cursor position for other users
    socketRef.current?.emit('cursor-move', {
      canvasId: id,
      x,
      y
    });
  }, [isDrawing, id]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing || !contextRef.current) return;

    setIsDrawing(false);
    contextRef.current.closePath();
    saveToUndoStack();

    // Emit drawing end to other users
    if (socketRef.current) {
      socketRef.current.emit('drawing', {
        canvasId: id,
        drawingData: {
          type: 'end'
        }
      });
    }
  }, [isDrawing, id]);

  const undo = () => {
    if (undoStack.length <= 1 || !contextRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const currentState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, currentState]);
    
    const previousState = undoStack[undoStack.length - 2];
    contextRef.current.putImageData(previousState, 0, 0);
    
    setUndoStack(prev => prev.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0 || !contextRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const nextState = redoStack[redoStack.length - 1];
    contextRef.current.putImageData(nextState, 0, 0);
    
    setUndoStack(prev => [...prev, nextState]);
    setRedoStack(prev => prev.slice(0, -1));
  };

  const saveCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !state.isAuthenticated) return;

    setSaving(true);
    
    try {
      const canvasData = canvas.toDataURL();
      const thumbnail = canvas.toDataURL('image/jpeg', 0.3);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_BASE_URL}/canvas/${id}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          canvasData,
          thumbnail
        })
      });

      if (response.ok) {
        // Emit save event to socket
        socketRef.current?.emit('save-canvas', {
          canvasId: id,
          canvasData,
          thumbnail
        });
      }
    } catch (error) {
      console.error('Error saving canvas:', error);
      setSaving(false);
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${canvas?.title || 'canvas'}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const clearCanvas = () => {
    if (!contextRef.current || !canvas) return;

    contextRef.current.fillStyle = canvas.settings.backgroundColor;
    contextRef.current.fillRect(0, 0, canvas.dimensions.width, canvas.dimensions.height);
    saveToUndoStack();
  };

  const tools = [
    { type: 'brush' as const, icon: <Brush className="w-5 h-5" />, name: 'Brush' },
    { type: 'eraser' as const, icon: <Eraser className="w-5 h-5" />, name: 'Eraser' },
    { type: 'line' as const, icon: <Minus className="w-5 h-5" />, name: 'Line' },
    { type: 'circle' as const, icon: <Circle className="w-5 h-5" />, name: 'Circle' },
    { type: 'rectangle' as const, icon: <Square className="w-5 h-5" />, name: 'Rectangle' },
    { type: 'fill' as const, icon: <PaintBucket className="w-5 h-5" />, name: 'Fill' },
    { type: 'text' as const, icon: <Type className="w-5 h-5" />, name: 'Text' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-white">Loading canvas...</p>
        </div>
      </div>
    );
  }

  if (!canvas) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Canvas not found</h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col overflow-hidden">
      
      {/* Top Toolbar */}
      <div className={`bg-gray-800 border-b border-gray-700 transition-transform duration-300 ${
        showToolbar ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="flex items-center justify-between px-4 py-3">
          
          {/* Left side - Navigation and canvas info */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="text-white">
              <h1 className="font-semibold">{canvas.title}</h1>
              <p className="text-sm text-gray-400">by {canvas.owner.username}</p>
            </div>
          </div>

          {/* Center - Main actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={undo}
              disabled={undoStack.length <= 1}
              className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Undo className="w-5 h-5" />
            </button>
            
            <button
              onClick={redo}
              disabled={redoStack.length === 0}
              className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Redo className="w-5 h-5" />
            </button>

            <div className="w-px h-6 bg-gray-600 mx-2"></div>

            <button
              onClick={saveCanvas}
              disabled={saving || !state.isAuthenticated}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>

            <button
              onClick={downloadCanvas}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                navigator.share?.({
                  title: canvas.title,
                  url: window.location.href
                });
              }}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Right side - Settings and users */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowUsers(!showUsers)}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Users className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowToolbar(!showToolbar)}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors lg:hidden"
            >
              {showToolbar ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar - Tools */}
        <div className={`bg-gray-800 border-r border-gray-700 p-4 transition-transform duration-300 ${
          showToolbar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          
          {/* Drawing Tools */}
          <div className="space-y-2 mb-6">
            <h3 className="text-white text-sm font-medium mb-3">Tools</h3>
            {tools.map(tool => (
              <button
                key={tool.type}
                onClick={() => setCurrentTool({ ...currentTool, type: tool.type })}
                className={`w-full p-3 rounded-lg flex items-center space-x-3 transition-colors ${
                  currentTool.type === tool.type
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                title={tool.name}
              >
                {tool.icon}
                <span className="text-sm">{tool.name}</span>
              </button>
            ))}
          </div>

          {/* Tool Settings */}
          <div className="space-y-4">
            <h3 className="text-white text-sm font-medium">Settings</h3>
            
            {/* Brush Size */}
            <div>
              <label className="text-gray-400 text-xs">Size: {currentTool.size}px</label>
              <input
                type="range"
                min="1"
                max="50"
                value={currentTool.size}
                onChange={(e) => setCurrentTool({ ...currentTool, size: parseInt(e.target.value) })}
                className="w-full mt-1"
              />
            </div>

            {/* Color */}
            {currentTool.type !== 'eraser' && (
              <div>
                <label className="text-gray-400 text-xs">Color</label>
                <input
                  type="color"
                  value={currentTool.color}
                  onChange={(e) => setCurrentTool({ ...currentTool, color: e.target.value })}
                  className="w-full h-10 mt-1 rounded-lg border-2 border-gray-600"
                />
              </div>
            )}

            {/* Opacity */}
            <div>
              <label className="text-gray-400 text-xs">Opacity: {Math.round(currentTool.opacity * 100)}%</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={currentTool.opacity}
                onChange={(e) => setCurrentTool({ ...currentTool, opacity: parseFloat(e.target.value) })}
                className="w-full mt-1"
              />
            </div>

            {/* Clear Canvas */}
            <button
              onClick={clearCanvas}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Clear Canvas
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center bg-gray-100 relative overflow-auto">
          <div 
            className="relative shadow-2xl"
            style={{
              width: canvas.dimensions.width,
              height: canvas.dimensions.height
            }}
          >
            <canvas
              ref={canvasRef}
              width={canvas.dimensions.width}
              height={canvas.dimensions.height}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="cursor-crosshair bg-white rounded-lg"
              style={{
                width: canvas.dimensions.width,
                height: canvas.dimensions.height
              }}
            />

            {/* Remote cursors */}
            {connectedUsers.map(user => 
              user.cursor && user._id !== state.user?._id && (
                <div
                  key={user._id}
                  className="absolute pointer-events-none"
                  style={{
                    left: user.cursor.x,
                    top: user.cursor.y,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                    {user.username}
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Right Sidebar - Users */}
        {showUsers && (
          <div className="bg-gray-800 border-l border-gray-700 w-64 p-4">
            <h3 className="text-white text-sm font-medium mb-4">
              Connected Users ({connectedUsers.length + 1})
            </h3>
            
            <div className="space-y-3">
              {/* Current user */}
              <div className="flex items-center space-x-3">
                {state.user?.avatar ? (
                  <img
                    src={state.user.avatar}
                    alt={state.user.username}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {state.user?.username?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-white text-sm font-medium">
                    {state.user?.username} (You)
                  </p>
                  <p className="text-gray-400 text-xs">Owner</p>
                </div>
              </div>

              {/* Other users */}
              {connectedUsers.map(user => (
                <div key={user._id} className="flex items-center space-x-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.username[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-white text-sm font-medium">{user.username}</p>
                    <p className="text-gray-400 text-xs capitalize">{user.permission}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>Canvas: {canvas.dimensions.width} × {canvas.dimensions.height}</span>
          <span>Tool: {currentTool.type}</span>
          <span>Size: {currentTool.size}px</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {saving && (
            <div className="flex items-center space-x-2 text-blue-400">
              <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
              <span className="text-sm">Saving...</span>
            </div>
          )}
          
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-400">Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasEditor;
