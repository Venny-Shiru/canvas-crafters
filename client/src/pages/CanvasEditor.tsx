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
  EyeOff,
  Droplet,
  Wind,
  Layers,
  Move,
  Scissors,
  Zap,
  Palette,
  Star,
  Navigation,
  Target
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
  type: 'brush' | 'eraser' | 'line' | 'circle' | 'rectangle' | 'fill' | 'text' | 
        'watercolor' | 'airbrush' | 'texture' | 'oil' | 'marker' | 'chalk' |
        'lasso' | 'magic-wand' | 'select-rect' | 'eyedropper' | 'gradient' |
        'move' | 'transform' | 'polygon' | 'star' | 'arrow';
  size: number;
  color: string;
  opacity: number;
  texture?: string;
  pressure?: number;
  flow?: number;
  hardness?: number;
}

interface ConnectedUser {
  _id: string;
  username: string;
  avatar?: string;
  permission: string;
  cursor?: { x: number; y: number };
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'hard-light';
  canvas: HTMLCanvasElement;
  locked: boolean;
}

interface Selection {
  active: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  path?: Path2D;
}

// Utility function to convert hex color to RGB array
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0];
};

// Flood fill algorithm for bucket fill tool
const floodFill = (context: CanvasRenderingContext2D, startX: number, startY: number, fillColor: string) => {
  const canvas = context.canvas;
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  const targetColor = getPixelColor(data, startX, startY, canvas.width);
  const fillRgb = hexToRgb(fillColor);
  
  // Don't fill if target color is the same as fill color
  if (colorsMatch(targetColor, fillRgb)) return;
  
  const stack = [[startX, startY]];
  const visited = new Set<string>();
  
  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    const key = `${x},${y}`;
    
    if (visited.has(key) || x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
      continue;
    }
    
    const currentColor = getPixelColor(data, x, y, canvas.width);
    if (!colorsMatch(currentColor, targetColor)) {
      continue;
    }
    
    visited.add(key);
    setPixelColor(data, x, y, canvas.width, fillRgb);
    
    // Add neighboring pixels to stack
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  
  context.putImageData(imageData, 0, 0);
};

// Helper functions for flood fill
const getPixelColor = (data: Uint8ClampedArray, x: number, y: number, width: number): [number, number, number] => {
  const index = (y * width + x) * 4;
  return [data[index], data[index + 1], data[index + 2]];
};

const setPixelColor = (data: Uint8ClampedArray, x: number, y: number, width: number, color: [number, number, number]) => {
  const index = (y * width + x) * 4;
  data[index] = color[0];
  data[index + 1] = color[1];
  data[index + 2] = color[2];
  data[index + 3] = 255; // Full opacity
};

const colorsMatch = (color1: [number, number, number], color2: [number, number, number]): boolean => {
  return color1[0] === color2[0] && color1[1] === color2[1] && color1[2] === color2[2];
};

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
  
  // Layer system
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string>('layer-1');
  
  // Selection system
  const [selection, setSelection] = useState<Selection>({
    active: false,
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [gradientStart, setGradientStart] = useState<{ x: number; y: number } | null>(null);
  const [gradientPreview, setGradientPreview] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const [currentTool, setCurrentTool] = useState<DrawingTool>({
    type: 'brush',
    size: 5,
    color: '#000000',
    opacity: 1,
    pressure: 1,
    flow: 1,
    hardness: 0.8
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

  // Reset gradient state when changing tools
  useEffect(() => {
    if (currentTool.type !== 'gradient') {
      setGradientStart(null);
      setGradientPreview(null);
    }
  }, [currentTool.type]);

  const initializeSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
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
      setConnectedUsers(prev => {
        // Check if user is already in the list to prevent duplicates
        const userExists = prev.some(user => user._id === data.user._id);
        if (userExists) {
          return prev;
        }
        return [...prev, data.user];
      });
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
    
    // Handle eyedropper tool
    if (currentTool.type === 'eyedropper') {
      const imageData = context.getImageData(x, y, 1, 1);
      const [r, g, b] = imageData.data;
      const pickedColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      setCurrentTool({ ...currentTool, color: pickedColor, type: 'brush' });
      return;
    }

    // Handle fill tool (bucket fill)
    if (currentTool.type === 'fill') {
      floodFill(context, x, y, currentTool.color);
      return;
    }

    // Handle gradient tool
    if (currentTool.type === 'gradient') {
      setGradientStart({ x, y });
      return;
    }

    // Configure brush settings based on tool type
    setupBrushContext(context, currentTool);

    context.beginPath();
    context.moveTo(x, y);

    // Store point for advanced brush effects
    if (['watercolor', 'airbrush', 'oil', 'chalk'].includes(currentTool.type)) {
      // For advanced brushes, we'll add multiple layers of effect
      drawAdvancedBrushStroke(context, x, y, currentTool, 'start');
    }

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
          opacity: currentTool.opacity,
          flow: currentTool.flow,
          hardness: currentTool.hardness,
          pressure: currentTool.pressure
        }
      });
    }
  }, [currentTool, id]);

  // Enhanced brush setup function
  const setupBrushContext = (context: CanvasRenderingContext2D, tool: DrawingTool) => {
    context.globalCompositeOperation = tool.type === 'eraser' ? 'destination-out' : 'source-over';
    context.globalAlpha = tool.opacity;
    
    switch (tool.type) {
      case 'watercolor':
        context.strokeStyle = tool.color;
        context.lineWidth = tool.size;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.globalAlpha = (tool.opacity * (tool.flow || 0.6));
        break;
        
      case 'airbrush':
        context.strokeStyle = tool.color;
        context.lineWidth = tool.size * 0.1; // Thinner base for airbrush
        context.lineCap = 'round';
        context.shadowColor = tool.color;
        context.shadowBlur = tool.size * (1 - (tool.hardness || 0.5));
        context.globalAlpha = (tool.opacity * (tool.flow || 0.3));
        break;
        
      case 'oil':
        context.strokeStyle = tool.color;
        context.lineWidth = tool.size;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.globalAlpha = tool.opacity * (tool.pressure || 1);
        break;
        
      case 'chalk':
        context.strokeStyle = tool.color;
        context.lineWidth = tool.size;
        context.lineCap = 'round';
        context.globalAlpha = tool.opacity * 0.7; // Chalk is naturally translucent
        break;
        
      case 'marker':
        context.strokeStyle = tool.color;
        context.lineWidth = tool.size;
        context.lineCap = 'round';
        context.globalCompositeOperation = 'multiply'; // Marker blend effect
        context.globalAlpha = tool.opacity * 0.6;
        break;
        
      default:
        context.strokeStyle = tool.color;
        context.lineWidth = tool.size;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        break;
    }
  };

  // Advanced brush stroke effects
  const drawAdvancedBrushStroke = (context: CanvasRenderingContext2D, x: number, y: number, tool: DrawingTool, type: 'start' | 'draw') => {
    switch (tool.type) {
      case 'watercolor':
        // Create watercolor effect with multiple transparent layers
        for (let i = 0; i < 3; i++) {
          context.save();
          context.globalAlpha = (tool.opacity * (tool.flow || 0.6)) / (i + 1);
          const offsetX = (Math.random() - 0.5) * 2;
          const offsetY = (Math.random() - 0.5) * 2;
          if (type === 'start') {
            context.beginPath();
            context.arc(x + offsetX, y + offsetY, tool.size / (i + 1), 0, Math.PI * 2);
            context.fill();
          }
          context.restore();
        }
        break;
        
      case 'airbrush':
        // Create spray pattern
        const sprayRadius = tool.size;
        const sprayDensity = Math.floor(sprayRadius / 2);
        context.save();
        context.globalAlpha = (tool.opacity * (tool.flow || 0.3)) / 10;
        for (let i = 0; i < sprayDensity; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * sprayRadius;
          const sprayX = x + Math.cos(angle) * radius;
          const sprayY = y + Math.sin(angle) * radius;
          context.beginPath();
          context.arc(sprayX, sprayY, 1, 0, Math.PI * 2);
          context.fill();
        }
        context.restore();
        break;
    }
  };

  const draw = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Handle gradient preview
    if (currentTool.type === 'gradient' && gradientStart) {
      setGradientPreview({
        startX: gradientStart.x,
        startY: gradientStart.y,
        endX: x,
        endY: y
      });
      return;
    }

    if (!isDrawing) return;

    // Handle different drawing modes
    if (['watercolor', 'airbrush', 'oil', 'chalk'].includes(currentTool.type)) {
      drawAdvancedBrushStroke(context, x, y, currentTool, 'draw');
    } else {
      // Standard drawing
      context.lineTo(x, y);
      context.stroke();
    }

    // Emit drawing data to other users
    if (socketRef.current) {
      socketRef.current.emit('drawing', {
        canvasId: id,
        drawingData: {
          type: 'draw',
          x,
          y,
          tool: currentTool.type,
          color: currentTool.color,
          size: currentTool.size,
          opacity: currentTool.opacity
        }
      });
    }

    // Update cursor position for other users
    socketRef.current?.emit('cursor-move', {
      canvasId: id,
      x,
      y
    });
  }, [isDrawing, currentTool, id]);

  const stopDrawing = useCallback((event?: React.MouseEvent<HTMLCanvasElement>) => {
    if (!contextRef.current) return;

    // Handle gradient tool completion
    if (currentTool.type === 'gradient' && gradientStart && event) {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const endX = event.clientX - rect.left;
        const endY = event.clientY - rect.top;
        
        // Create and apply gradient
        const context = contextRef.current;
        const gradient = context.createLinearGradient(gradientStart.x, gradientStart.y, endX, endY);
        gradient.addColorStop(0, currentTool.color);
        gradient.addColorStop(1, 'transparent');
        
        context.fillStyle = gradient;
        context.globalAlpha = currentTool.opacity;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        setGradientStart(null);
        setGradientPreview(null);
        saveToUndoStack();
      }
      return;
    }

    if (!isDrawing) return;

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
  }, [isDrawing, currentTool, gradientStart, id]);

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
    // Basic Drawing Tools
    { type: 'brush' as const, icon: <Brush className="w-5 h-5" />, name: 'Brush', category: 'Basic' },
    { type: 'eraser' as const, icon: <Eraser className="w-5 h-5" />, name: 'Eraser', category: 'Basic' },
    
    // Advanced Brushes
    { type: 'watercolor' as const, icon: <Droplet className="w-5 h-5" />, name: 'Watercolor', category: 'Artistic' },
    { type: 'airbrush' as const, icon: <Wind className="w-5 h-5" />, name: 'Airbrush', category: 'Artistic' },
    { type: 'oil' as const, icon: <Palette className="w-5 h-5" />, name: 'Oil Paint', category: 'Artistic' },
    { type: 'marker' as const, icon: <Zap className="w-5 h-5" />, name: 'Marker', category: 'Artistic' },
    { type: 'chalk' as const, icon: <Target className="w-5 h-5" />, name: 'Chalk', category: 'Artistic' },
    
    // Selection Tools
    { type: 'lasso' as const, icon: <Navigation className="w-5 h-5" />, name: 'Lasso Select', category: 'Selection' },
    { type: 'magic-wand' as const, icon: <Zap className="w-5 h-5" />, name: 'Magic Wand', category: 'Selection' },
    { type: 'select-rect' as const, icon: <Square className="w-5 h-5" />, name: 'Rectangle Select', category: 'Selection' },
    { type: 'move' as const, icon: <Move className="w-5 h-5" />, name: 'Move', category: 'Selection' },
    
    // Shape Tools
    { type: 'line' as const, icon: <Minus className="w-5 h-5" />, name: 'Line', category: 'Shapes' },
    { type: 'circle' as const, icon: <Circle className="w-5 h-5" />, name: 'Circle', category: 'Shapes' },
    { type: 'rectangle' as const, icon: <Square className="w-5 h-5" />, name: 'Rectangle', category: 'Shapes' },
    { type: 'polygon' as const, icon: <Star className="w-5 h-5" />, name: 'Polygon', category: 'Shapes' },
    { type: 'star' as const, icon: <Star className="w-5 h-5" />, name: 'Star', category: 'Shapes' },
    
    // Color & Fill Tools
    { type: 'fill' as const, icon: <PaintBucket className="w-5 h-5" />, name: 'Fill', category: 'Color' },
    { type: 'gradient' as const, icon: <Palette className="w-5 h-5" />, name: 'Gradient', category: 'Color' },
    { type: 'eyedropper' as const, icon: <Droplet className="w-5 h-5" />, name: 'Eyedropper', category: 'Color' },
    
    // Text & Other
    { type: 'text' as const, icon: <Type className="w-5 h-5" />, name: 'Text', category: 'Other' }
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
          <div className="space-y-4 mb-6">
            <h3 className="text-white text-sm font-medium mb-3">Tools</h3>
            
            {/* Group tools by category */}
            {['Basic', 'Artistic', 'Selection', 'Shapes', 'Color', 'Other'].map(category => {
              const categoryTools = tools.filter(tool => tool.category === category);
              if (categoryTools.length === 0) return null;
              
              return (
                <div key={category} className="space-y-1">
                  <h4 className="text-xs text-gray-400 uppercase tracking-wide">{category}</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {categoryTools.map(tool => (
                      <button
                        key={tool.type}
                        onClick={() => setCurrentTool({ ...currentTool, type: tool.type })}
                        className={`p-2 rounded-lg flex flex-col items-center space-y-1 transition-colors text-xs ${
                          currentTool.type === tool.type
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                        title={tool.name}
                      >
                        {tool.icon}
                        <span className="text-xs leading-none">{tool.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
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
                max="100"
                value={currentTool.size}
                onChange={(e) => setCurrentTool({ ...currentTool, size: parseInt(e.target.value) })}
                className="w-full mt-1"
              />
            </div>

            {/* Color */}
            {!['eraser', 'eyedropper'].includes(currentTool.type) && (
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

            {/* Advanced Settings for Artistic Brushes */}
            {['watercolor', 'airbrush', 'oil', 'chalk'].includes(currentTool.type) && (
              <>
                <div>
                  <label className="text-gray-400 text-xs">Flow: {Math.round((currentTool.flow || 1) * 100)}%</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={currentTool.flow || 1}
                    onChange={(e) => setCurrentTool({ ...currentTool, flow: parseFloat(e.target.value) })}
                    className="w-full mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-gray-400 text-xs">Hardness: {Math.round((currentTool.hardness || 0.8) * 100)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={currentTool.hardness || 0.8}
                    onChange={(e) => setCurrentTool({ ...currentTool, hardness: parseFloat(e.target.value) })}
                    className="w-full mt-1"
                  />
                </div>
              </>
            )}

            {/* Pressure Sensitivity for Drawing Tablets */}
            {['brush', 'watercolor', 'oil', 'chalk'].includes(currentTool.type) && (
              <div>
                <label className="text-gray-400 text-xs">Pressure: {Math.round((currentTool.pressure || 1) * 100)}%</label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={currentTool.pressure || 1}
                  onChange={(e) => setCurrentTool({ ...currentTool, pressure: parseFloat(e.target.value) })}
                  className="w-full mt-1"
                />
              </div>
            )}

            {/* Clear Canvas */}
            <button
              onClick={clearCanvas}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Clear Canvas
            </button>
          </div>
        </div>

        {/* Layers Panel */}
        <div className="bg-gray-800 border-r border-gray-700 w-64 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-sm font-medium">Layers</h3>
            <button
              onClick={() => {
                const newLayer: Layer = {
                  id: `layer-${Date.now()}`,
                  name: `Layer ${layers.length + 1}`,
                  visible: true,
                  opacity: 1,
                  blendMode: 'normal',
                  canvas: document.createElement('canvas'),
                  locked: false
                };
                setLayers([...layers, newLayer]);
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
          
          {/* Layer List */}
          <div className="space-y-2 mb-4">
            {layers.length === 0 && (
              <div className="text-gray-400 text-sm text-center py-4">
                No layers yet. Create your first layer!
              </div>
            )}
            {layers.map((layer) => (
              <div
                key={layer.id}
                className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                  activeLayerId === layer.id
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => setActiveLayerId(layer.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{layer.name}</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLayers(layers.map(l => 
                          l.id === layer.id ? { ...l, visible: !l.visible } : l
                        ));
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <label className="text-xs text-gray-400">Opacity: {Math.round(layer.opacity * 100)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={layer.opacity}
                    onChange={(e) => {
                      const newOpacity = parseFloat(e.target.value);
                      setLayers(layers.map(l => 
                        l.id === layer.id ? { ...l, opacity: newOpacity } : l
                      ));
                    }}
                    className="w-full mt-1"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            ))}
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

            {/* Gradient preview line */}
            {gradientPreview && currentTool.type === 'gradient' && (
              <svg
                className="absolute top-0 left-0 pointer-events-none"
                style={{
                  width: canvas.dimensions.width,
                  height: canvas.dimensions.height
                }}
              >
                <line
                  x1={gradientPreview.startX}
                  y1={gradientPreview.startY}
                  x2={gradientPreview.endX}
                  y2={gradientPreview.endY}
                  stroke="#000"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.7"
                />
                <circle
                  cx={gradientPreview.startX}
                  cy={gradientPreview.startY}
                  r="4"
                  fill={currentTool.color}
                  stroke="#000"
                  strokeWidth="1"
                />
                <circle
                  cx={gradientPreview.endX}
                  cy={gradientPreview.endY}
                  r="4"
                  fill="transparent"
                  stroke="#000"
                  strokeWidth="2"
                />
              </svg>
            )}

            {/* Remote cursors */}
            {connectedUsers
              .filter(user => user._id !== state.user?._id)
              .map(user => 
                user.cursor && (
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
              Connected Users ({connectedUsers.filter(user => user._id !== state.user?._id).length + 1})
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
              {connectedUsers.filter(user => user._id !== state.user?._id).map(user => (
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
