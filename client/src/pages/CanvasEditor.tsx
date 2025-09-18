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
  Target,
  Edit3,
  Upload
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
        'move' | 'transform' | 'polygon' | 'star' | 'arrow' | 'pencil' |
        'sticky-note' | 'laser-pointer' | 'timer' | 'ruler' | 'grid' | 'import-image';
  size: number;
  color: string;
  opacity: number;
  texture?: string;
  pressure?: number;
  flow?: number;
  hardness?: number;
}

interface StickyNote {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color: string;
  user: string;
}

interface TextBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  isEditing: boolean;
  user: string;
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
  const [selection, setSelection] = useState({
    active: false,
    path: [] as { x: number; y: number }[],
    bounds: null as { x: number; y: number; width: number; height: number } | null,
    imageData: null as ImageData | null,
    type: null as 'rectangle' | 'lasso' | 'magic-wand' | null
  });
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionCanvas, setSelectionCanvas] = useState<HTMLCanvasElement | null>(null);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [gradientStart, setGradientStart] = useState<{ x: number; y: number } | null>(null);
  const [gradientPreview, setGradientPreview] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
  const [shapePreview, setShapePreview] = useState<{ startX: number; startY: number; endX: number; endY: number; type: string } | null>(null);
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
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [showGrid, setShowGrid] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [snapToGrid, setSnapToGrid] = useState(false);
  
  // Layer blending state
  const [blendMode, setBlendMode] = useState<GlobalCompositeOperation>('source-over');
  const [layerOpacity, setLayerOpacity] = useState(1.0);

  // Initialize canvas and socket connection
  useEffect(() => {
    if (!id) return;

    const initializeCanvas = async () => {
      try {
        setLoading(true);
  const API_BASE_URL = import.meta.env.VITE_API_URL;
        
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
    if (!['line', 'rectangle', 'circle', 'polygon', 'star', 'arrow'].includes(currentTool.type)) {
      setShapeStart(null);
      setShapePreview(null);
    }
  }, [currentTool.type]);

  // Ensure canvas context is available after canvas state changes
  useEffect(() => {
    if (canvas && canvasRef.current && !contextRef.current) {
      console.log('Attempting to recover canvas context...');
      const context = canvasRef.current.getContext('2d', { willReadFrequently: true });
      if (context) {
        contextRef.current = context;
        console.log('Canvas context recovered successfully');
        
        // Re-setup canvas if context was lost
        const canvasEl = canvasRef.current;
        canvasEl.width = canvas.dimensions.width;
        canvasEl.height = canvas.dimensions.height;
        
        context.fillStyle = canvas.settings.backgroundColor;
        context.fillRect(0, 0, canvasEl.width, canvasEl.height);
        context.lineCap = 'round';
        context.lineJoin = 'round';
      }
    }
  }, [canvas]);

  // Draw grid when showGrid changes
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Create or get grid overlay canvas
    let gridCanvas = document.getElementById('grid-overlay') as HTMLCanvasElement;
    if (!gridCanvas) {
      gridCanvas = document.createElement('canvas');
      gridCanvas.id = 'grid-overlay';
      gridCanvas.style.position = 'absolute';
      gridCanvas.style.top = '0';
      gridCanvas.style.left = '0';
      gridCanvas.style.pointerEvents = 'none';
      gridCanvas.style.zIndex = '1';
      canvasRef.current.parentElement?.appendChild(gridCanvas);
    }
    
    gridCanvas.width = canvasRef.current.width;
    gridCanvas.height = canvasRef.current.height;
    const gridCtx = gridCanvas.getContext('2d');
    
    if (gridCtx) {
      gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
      if (showGrid) {
        drawGrid(gridCtx);
      }
      gridCanvas.style.display = showGrid ? 'block' : 'none';
    }
  }, [showGrid, gridSize]);

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
    // Use a small delay to ensure canvas element is fully rendered
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error('Canvas element not found during setup');
        return;
      }

      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) {
        console.error('Could not get 2D context from canvas');
        return;
      }

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
      console.log('Canvas context initialized successfully');

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
    }, 100); // Small delay to ensure DOM is ready
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

    if (drawingData.type === 'shape') {
      // Handle remote shape drawing
      drawShape(context, drawingData.tool, drawingData.startX, drawingData.startY, drawingData.endX, drawingData.endY, {
        type: drawingData.tool,
        color: drawingData.color,
        size: drawingData.size,
        opacity: drawingData.opacity,
        pressure: 1,
        flow: 1,
        hardness: 0.8
      });
    } else if (drawingData.type === 'start') {
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
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('No canvas available for drawing');
      return;
    }

    // Try to get context if not available
    if (!contextRef.current) {
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (context) {
        contextRef.current = context;
        console.log('Context recovered during drawing attempt');
      } else {
        console.log('No context available for drawing');
        return;
      }
    }

    const rect = canvas.getBoundingClientRect();
    const rawX = event.clientX - rect.left;
    const rawY = event.clientY - rect.top;
    const x = snapToGridIfEnabled(rawX);
    const y = snapToGridIfEnabled(rawY);

    console.log('Starting drawing at:', { x, y, tool: currentTool.type });
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

    // Handle shape tools
    if (['line', 'rectangle', 'circle', 'polygon', 'star', 'arrow'].includes(currentTool.type)) {
      setShapeStart({ x, y });
      setIsDrawing(true);
      return;
    }

    // Handle text tool - create editable text boxes
    if (currentTool.type === 'text') {
      addTextBox(x, y);
      return;
    }

    // Handle sticky note tool
    if (currentTool.type === 'sticky-note') {
      addStickyNote(x, y);
      return;
    }

    // Handle special tools
    if (currentTool.type === 'laser-pointer') {
      // Laser pointer creates a temporary red dot
      context.save();
      context.fillStyle = '#ff0000';
      context.globalAlpha = 0.8;
      context.beginPath();
      context.arc(x, y, 5, 0, Math.PI * 2);
      context.fill();
      context.restore();
      
      // Auto-fade the laser pointer after 1 second
      setTimeout(() => {
        if (canvasRef.current && contextRef.current) {
          contextRef.current.clearRect(x - 10, y - 10, 20, 20);
        }
      }, 1000);
      return;
    }

    if (currentTool.type === 'ruler') {
      // Ruler tool shows measurements
      const rulerText = `${Math.round(x)}, ${Math.round(y)}`;
      context.save();
      context.fillStyle = '#000000';
      context.font = '12px Arial';
      context.fillText(rulerText, x + 10, y - 10);
      context.restore();
      return;
    }

    if (currentTool.type === 'timer') {
      // Timer tool places a timestamp
      const timestamp = new Date().toLocaleTimeString();
      context.save();
      context.fillStyle = currentTool.color;
      context.font = `${currentTool.size}px Arial`;
      context.fillText(timestamp, x, y);
      context.restore();
      saveToUndoStack();
      return;
    }

    if (currentTool.type === 'grid') {
      // Grid tool toggles grid display
      setShowGrid(!showGrid);
      return;
    }

    if (currentTool.type === 'import-image') {
      // Image import tool
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file && contextRef.current) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              // Ensure we have a valid context
              if (contextRef.current) {
                // Scale image to fit reasonably on canvas
                const maxWidth = 300;
                const maxHeight = 300;
                let { width, height } = img;
                
                if (width > maxWidth || height > maxHeight) {
                  const ratio = Math.min(maxWidth / width, maxHeight / height);
                  width *= ratio;
                  height *= ratio;
                }
                
                contextRef.current.drawImage(img, x - width/2, y - height/2, width, height);
                saveToUndoStack();
              }
            };
            img.src = event.target?.result as string;
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
      return;
    }

    // Handle selection tools
    if (['lasso', 'magic-wand', 'select-rect', 'move'].includes(currentTool.type)) {
      if (currentTool.type === 'magic-wand') {
        magicWandSelect(x, y);
        return;
      }
      
      if (currentTool.type === 'select-rect') {
        setIsSelecting(true);
        setSelection(prev => ({
          ...prev,
          type: 'rectangle',
          path: [{ x, y }]
        }));
        return;
      }
      
      if (currentTool.type === 'lasso') {
        setIsSelecting(true);
        setSelection(prev => ({
          ...prev,
          type: 'lasso',
          path: [{ x, y }]
        }));
        return;
      }
      
      if (currentTool.type === 'move' && selection.active && selection.bounds) {
        // Check if click is within selection bounds
        if (x >= selection.bounds.x && x <= selection.bounds.x + selection.bounds.width &&
            y >= selection.bounds.y && y <= selection.bounds.y + selection.bounds.height) {
          // Start moving selection
          setIsSelecting(true);
          return;
        }
      }
      
      console.log(`${currentTool.type} tool activated`);
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
    // Apply layer blending mode
    context.globalCompositeOperation = tool.type === 'eraser' ? 'destination-out' : blendMode;
    context.globalAlpha = tool.opacity * layerOpacity;
    
    switch (tool.type) {
      case 'pencil':
        context.strokeStyle = tool.color;
        context.lineWidth = Math.max(1, tool.size * 0.5); // Pencil is thinner
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.globalAlpha = tool.opacity;
        // Add slight texture effect for pencil
        context.shadowColor = 'transparent';
        context.shadowBlur = 0;
        break;
        
      case 'brush':
        context.strokeStyle = tool.color;
        context.lineWidth = tool.size;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.globalAlpha = tool.opacity;
        context.shadowColor = 'transparent';
        context.shadowBlur = 0;
        break;
        
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
        
      case 'texture':
        context.strokeStyle = tool.color;
        context.lineWidth = tool.size;
        context.lineCap = 'square';
        context.globalAlpha = tool.opacity;
        // Create texture pattern
        const patternCanvas = document.createElement('canvas');
        const patternCtx = patternCanvas.getContext('2d');
        if (patternCtx) {
          patternCanvas.width = 20;
          patternCanvas.height = 20;
          patternCtx.fillStyle = tool.color;
          for (let i = 0; i < 10; i++) {
            patternCtx.fillRect(Math.random() * 20, Math.random() * 20, 2, 2);
          }
          const pattern = context.createPattern(patternCanvas, 'repeat');
          if (pattern) context.strokeStyle = pattern;
        }
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
  // Enhanced draw function for advanced brush techniques
  const drawAdvancedBrushStroke = (context: CanvasRenderingContext2D, x: number, y: number, tool: DrawingTool, type: 'start' | 'draw') => {
    switch (tool.type) {
      case 'watercolor':
        // Enhanced watercolor effect with better blending
        for (let i = 0; i < 5; i++) {
          context.save();
          context.globalCompositeOperation = 'multiply';
          context.globalAlpha = (tool.opacity * (tool.flow || 0.4)) / (i + 1);
          const offsetX = (Math.random() - 0.5) * 4;
          const offsetY = (Math.random() - 0.5) * 4;
          const size = tool.size * (1.2 - i * 0.15);
          
          // Create gradient for watercolor bleeding effect
          const gradient = context.createRadialGradient(x + offsetX, y + offsetY, 0, x + offsetX, y + offsetY, size);
          gradient.addColorStop(0, tool.color);
          gradient.addColorStop(0.7, tool.color + '80'); // Semi-transparent
          gradient.addColorStop(1, tool.color + '00'); // Fully transparent
          
          context.fillStyle = gradient;
          if (type === 'start') {
            context.beginPath();
            context.arc(x + offsetX, y + offsetY, size, 0, Math.PI * 2);
            context.fill();
          }
          context.restore();
        }
        break;
        
      case 'airbrush':
        // Enhanced spray pattern with better distribution
        const sprayRadius = tool.size;
        const sprayDensity = Math.floor(sprayRadius * 1.5);
        context.save();
        context.globalAlpha = (tool.opacity * (tool.flow || 0.2)) / 8;
        context.fillStyle = tool.color;
        
        for (let i = 0; i < sprayDensity; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * sprayRadius * Math.random(); // Non-uniform distribution
          const sprayX = x + Math.cos(angle) * radius;
          const sprayY = y + Math.sin(angle) * radius;
          const size = Math.random() * 2 + 0.5;
          context.beginPath();
          context.arc(sprayX, sprayY, size, 0, Math.PI * 2);
          context.fill();
        }
        context.restore();
        break;
        
      case 'oil':
        // Oil painting effect with impasto texture
        context.save();
        context.globalCompositeOperation = 'multiply';
        context.shadowColor = tool.color;
        context.shadowBlur = tool.size / 4;
        context.shadowOffsetX = 1;
        context.shadowOffsetY = 1;
        
        // Main stroke
        context.strokeStyle = tool.color;
        context.lineWidth = tool.size;
        context.lineCap = 'round';
        context.globalAlpha = tool.opacity;
        if (type === 'start') {
          context.beginPath();
          context.arc(x, y, tool.size / 2, 0, Math.PI * 2);
          context.stroke();
        }
        context.restore();
        break;
        
      case 'chalk':
        // Chalk effect with rough texture
        context.save();
        context.globalCompositeOperation = 'screen';
        const chalkSize = tool.size;
        const roughness = 8;
        
        for (let i = 0; i < roughness; i++) {
          context.globalAlpha = (tool.opacity * 0.8) / roughness;
          const offsetX = (Math.random() - 0.5) * chalkSize * 0.3;
          const offsetY = (Math.random() - 0.5) * chalkSize * 0.3;
          context.fillStyle = tool.color;
          context.beginPath();
          context.arc(x + offsetX, y + offsetY, chalkSize / (2 + i * 0.2), 0, Math.PI * 2);
          context.fill();
        }
        context.restore();
        break;
        
      case 'texture':
        // Texture brush with random dot pattern
        context.save();
        const textureSize = tool.size;
        const density = Math.floor(textureSize / 3);
        
        for (let i = 0; i < density; i++) {
          context.globalAlpha = (tool.opacity * 0.9) / density;
          const offsetX = (Math.random() - 0.5) * textureSize;
          const offsetY = (Math.random() - 0.5) * textureSize;
          const dotSize = Math.random() * 3 + 1;
          context.fillStyle = tool.color;
          context.beginPath();
          context.arc(x + offsetX, y + offsetY, dotSize, 0, Math.PI * 2);
          context.fill();
        }
        context.restore();
        break;
    }
  };

  const draw = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Try to get context if not available
    let context = contextRef.current;
    if (!context) {
      context = canvas.getContext('2d', { willReadFrequently: true });
      if (context) {
        contextRef.current = context;
        console.log('Context recovered during draw');
      } else {
        console.log('No context available for drawing');
        return;
      }
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Handle selection tools during drag
    if (isSelecting && ['select-rect', 'lasso'].includes(currentTool.type)) {
      if (currentTool.type === 'select-rect') {
        // Update rectangle selection preview
        const startPoint = selection.path[0];
        if (startPoint) {
          setSelection(prev => ({
            ...prev,
            bounds: {
              x: Math.min(startPoint.x, x),
              y: Math.min(startPoint.y, y),
              width: Math.abs(x - startPoint.x),
              height: Math.abs(y - startPoint.y)
            }
          }));
        }
        return;
      }
      
      if (currentTool.type === 'lasso') {
        // Add point to lasso path
        setSelection(prev => ({
          ...prev,
          path: [...prev.path, { x, y }]
        }));
        return;
      }
    }

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

    // Handle shape preview
    if (['line', 'rectangle', 'circle', 'polygon', 'star', 'arrow'].includes(currentTool.type) && shapeStart) {
      setShapePreview({
        startX: shapeStart.x,
        startY: shapeStart.y,
        endX: x,
        endY: y,
        type: currentTool.type
      });
      return;
    }

    if (!isDrawing) return;

    console.log('Drawing at:', { x, y, isDrawing });

    // Re-apply brush context for consistent tool behavior
    setupBrushContext(context, currentTool);

    // Handle different drawing modes
    if (['watercolor', 'airbrush', 'oil', 'chalk'].includes(currentTool.type)) {
      drawAdvancedBrushStroke(context, x, y, currentTool, 'draw');
    } else if (currentTool.type === 'pencil') {
      // Pencil-specific drawing with harder edges
      context.lineTo(x, y);
      context.stroke();
    } else if (currentTool.type === 'marker') {
      // Marker has multiply blend mode set in setupBrushContext
      context.lineTo(x, y);
      context.stroke();
    } else {
      // Standard drawing for brush, eraser, etc.
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

    // Handle selection tool completion
    if (isSelecting) {
      if (currentTool.type === 'select-rect' && selection.bounds) {
        // Finalize rectangle selection
        createSelection('rectangle', selection.bounds);
      } else if (currentTool.type === 'lasso' && selection.path.length > 0) {
        // Calculate bounds for lasso selection
        const xs = selection.path.map(p => p.x);
        const ys = selection.path.map(p => p.y);
        const bounds = {
          x: Math.min(...xs),
          y: Math.min(...ys),
          width: Math.max(...xs) - Math.min(...xs),
          height: Math.max(...ys) - Math.min(...ys)
        };
        createSelection('lasso', bounds);
      }
      setIsSelecting(false);
      return;
    }

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

    // Handle shape tool completion
    if (['line', 'rectangle', 'circle', 'polygon', 'star', 'arrow'].includes(currentTool.type) && shapeStart && event) {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const endX = event.clientX - rect.left;
        const endY = event.clientY - rect.top;
        
        drawShape(contextRef.current, currentTool.type, shapeStart.x, shapeStart.y, endX, endY, currentTool);
        
        setShapeStart(null);
        setShapePreview(null);
        setIsDrawing(false);
        saveToUndoStack();
        
        // Emit shape to other users
        if (socketRef.current) {
          socketRef.current.emit('drawing', {
            canvasId: id,
            drawingData: {
              type: 'shape',
              tool: currentTool.type,
              startX: shapeStart.x,
              startY: shapeStart.y,
              endX,
              endY,
              color: currentTool.color,
              size: currentTool.size,
              opacity: currentTool.opacity
            }
          });
        }
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
  }, [isDrawing, currentTool, gradientStart, shapeStart, id]);

  // Function to draw shapes
  const drawShape = (context: CanvasRenderingContext2D, shapeType: string, startX: number, startY: number, endX: number, endY: number, tool: DrawingTool) => {
    context.save();
    context.strokeStyle = tool.color;
    context.lineWidth = tool.size;
    context.globalAlpha = tool.opacity;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    switch (shapeType) {
      case 'line':
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();
        break;

      case 'rectangle':
        const width = endX - startX;
        const height = endY - startY;
        context.beginPath();
        context.rect(startX, startY, width, height);
        context.stroke();
        break;

      case 'circle':
        const centerX = (startX + endX) / 2;
        const centerY = (startY + endY) / 2;
        const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)) / 2;
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        context.stroke();
        break;

      case 'polygon':
        const sides = 6; // Hexagon
        const centerXPoly = (startX + endX) / 2;
        const centerYPoly = (startY + endY) / 2;
        const radiusPoly = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)) / 2;
        context.beginPath();
        for (let i = 0; i < sides; i++) {
          const angle = (i * 2 * Math.PI) / sides;
          const x = centerXPoly + radiusPoly * Math.cos(angle);
          const y = centerYPoly + radiusPoly * Math.sin(angle);
          if (i === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }
        context.closePath();
        context.stroke();
        break;

      case 'star':
        const points = 5;
        const centerXStar = (startX + endX) / 2;
        const centerYStar = (startY + endY) / 2;
        const outerRadius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)) / 2;
        const innerRadius = outerRadius * 0.4;
        context.beginPath();
        for (let i = 0; i < points * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i * Math.PI) / points;
          const x = centerXStar + radius * Math.cos(angle - Math.PI / 2);
          const y = centerYStar + radius * Math.sin(angle - Math.PI / 2);
          if (i === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }
        context.closePath();
        context.stroke();
        break;

      case 'arrow':
        // Draw arrow from start to end
        const headLength = 20; // Length of arrow head
        const headAngle = Math.PI / 6; // Angle of arrow head
        
        // Main line
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();
        
        // Arrow head
        const angle = Math.atan2(endY - startY, endX - startX);
        context.beginPath();
        context.moveTo(endX, endY);
        context.lineTo(
          endX - headLength * Math.cos(angle - headAngle),
          endY - headLength * Math.sin(angle - headAngle)
        );
        context.moveTo(endX, endY);
        context.lineTo(
          endX - headLength * Math.cos(angle + headAngle),
          endY - headLength * Math.sin(angle + headAngle)
        );
        context.stroke();
        break;
    }

    context.restore();
  };

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

  // Selection Tools Functions
  const createSelection = (type: 'rectangle' | 'lasso' | 'magic-wand', bounds: { x: number; y: number; width: number; height: number }) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const imageData = context.getImageData(bounds.x, bounds.y, bounds.width, bounds.height);
    setSelection({
      active: true,
      path: type === 'lasso' ? selection.path : [],
      bounds,
      imageData,
      type
    });
  };

  const clearSelection = () => {
    setSelection({
      active: false,
      path: [],
      bounds: null,
      imageData: null,
      type: null
    });
  };

  const cutSelection = () => {
    if (!selection.active || !selection.bounds || !contextRef.current) return;
    
    // Clear the selected area
    contextRef.current.clearRect(
      selection.bounds.x, 
      selection.bounds.y, 
      selection.bounds.width, 
      selection.bounds.height
    );
    saveToUndoStack();
  };

  const copySelection = () => {
    if (!selection.active || !selection.imageData) return;
    // Store in a global clipboard variable or use the Clipboard API
    // For now, we'll just keep it in the selection state
    return selection.imageData;
  };

  const pasteSelection = (x: number, y: number) => {
    if (!selection.imageData || !contextRef.current) return;
    
    // Create a temporary canvas for the clipboard data
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCanvas.width = selection.imageData.width;
    tempCanvas.height = selection.imageData.height;
    tempCtx.putImageData(selection.imageData, 0, 0);
    
    // Paste at the new location
    contextRef.current.drawImage(tempCanvas, x, y);
    saveToUndoStack();
  };

  // Magic wand selection (color-based)
  const magicWandSelect = (startX: number, startY: number, tolerance: number = 30) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const targetPixel = getPixelColor(imageData, startX, startY);
    
    const visited = new Set<string>();
    const stack = [{ x: startX, y: startY }];
    const selectedPixels = new Set<string>();

    while (stack.length > 0) {
      const { x, y } = stack.pop()!;
      const key = `${x},${y}`;
      
      if (visited.has(key) || x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
        continue;
      }
      
      visited.add(key);
      const currentPixel = getPixelColor(imageData, x, y);
      
      if (colorDistance(targetPixel, currentPixel) <= tolerance) {
        selectedPixels.add(key);
        stack.push({ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 });
      }
    }

    // Create bounds from selected pixels
    let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
    selectedPixels.forEach(key => {
      const [x, y] = key.split(',').map(Number);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    });

    if (selectedPixels.size > 0) {
      createSelection('magic-wand', {
        x: minX,
        y: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1
      });
    }
  };

  const getPixelColor = (imageData: ImageData, x: number, y: number) => {
    const index = (y * imageData.width + x) * 4;
    return {
      r: imageData.data[index],
      g: imageData.data[index + 1],
      b: imageData.data[index + 2],
      a: imageData.data[index + 3]
    };
  };

  const colorDistance = (color1: any, color2: any) => {
    return Math.sqrt(
      Math.pow(color1.r - color2.r, 2) +
      Math.pow(color1.g - color2.g, 2) +
      Math.pow(color1.b - color2.b, 2)
    );
  };

  // Sticky notes functions
  const addStickyNote = (x: number, y: number) => {
    const newNote: StickyNote = {
      id: Date.now().toString(),
      x,
      y,
      width: 200,
      height: 150,
      content: 'New note',
      color: 'yellow',
      user: state.user?.username || 'Anonymous'
    };
    setStickyNotes(prev => [...prev, newNote]);
  };

  // Text box functions
  const addTextBox = (x: number, y: number) => {
    const newTextBox: TextBox = {
      id: Date.now().toString(),
      x,
      y,
      width: 200,
      height: 40,
      content: 'Click to edit text',
      fontSize: currentTool.size || 16,
      fontFamily: 'Arial',
      color: currentTool.color,
      isEditing: false,
      user: state.user?.username || 'Anonymous'
    };
    setTextBoxes(prev => [...prev, newTextBox]);
  };

  const updateTextBox = (id: string, updates: Partial<TextBox>) => {
    setTextBoxes(prev => prev.map(textBox => 
      textBox.id === id ? { ...textBox, ...updates } : textBox
    ));
  };

  const deleteTextBox = (id: string) => {
    setTextBoxes(prev => prev.filter(textBox => textBox.id !== id));
  };

  const updateStickyNote = (id: string, updates: Partial<StickyNote>) => {
    setStickyNotes(prev => prev.map(note => 
      note.id === id ? { ...note, ...updates } : note
    ));
  };

  const deleteStickyNote = (id: string) => {
    setStickyNotes(prev => prev.filter(note => note.id !== id));
  };

  // Grid functions
  const snapToGridIfEnabled = (value: number) => {
    return snapToGrid ? Math.round(value / gridSize) * gridSize : value;
  };

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    if (!showGrid) return;
    
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x <= canvasRef.current!.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasRef.current!.height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= canvasRef.current!.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasRef.current!.width, y);
      ctx.stroke();
    }
  };

  const saveCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !state.isAuthenticated) return;

    setSaving(true);
    
    try {
      const canvasData = canvas.toDataURL();
      const thumbnail = canvas.toDataURL('image/jpeg', 0.3);
  const API_BASE_URL = import.meta.env.VITE_API_URL;

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

  const triggerImageImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !contextRef.current || !canvasRef.current) return;

      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const img = new Image();
        img.onload = () => {
          const context = contextRef.current;
          const canvas = canvasRef.current;
          if (!context || !canvas) return;

          // Calculate scaling to fit the canvas while maintaining aspect ratio
          const canvasAspect = canvas.width / canvas.height;
          const imageAspect = img.width / img.height;
          
          let drawWidth, drawHeight, drawX, drawY;
          
          if (imageAspect > canvasAspect) {
            // Image is wider than canvas
            drawWidth = canvas.width;
            drawHeight = canvas.width / imageAspect;
            drawX = 0;
            drawY = (canvas.height - drawHeight) / 2;
          } else {
            // Image is taller than canvas
            drawWidth = canvas.height * imageAspect;
            drawHeight = canvas.height;
            drawX = (canvas.width - drawWidth) / 2;
            drawY = 0;
          }

          // Draw the image
          context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          saveToUndoStack();

          // Emit the change to other users
          if (socketRef.current) {
            socketRef.current.emit('canvas-updated', {
              canvasId: id,
              imageData: canvas.toDataURL()
            });
          }
        };
        img.src = loadEvent.target?.result as string;
      };
      reader.readAsDataURL(file);
    };
    input.click();
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
    { type: 'pencil' as const, icon: <Edit3 className="w-5 h-5" />, name: 'Pencil', category: 'Basic' },
    { type: 'eraser' as const, icon: <Eraser className="w-5 h-5" />, name: 'Eraser', category: 'Basic' },
    
    // Advanced Brushes
    { type: 'watercolor' as const, icon: <Droplet className="w-5 h-5" />, name: 'Watercolor', category: 'Artistic' },
    { type: 'airbrush' as const, icon: <Wind className="w-5 h-5" />, name: 'Airbrush', category: 'Artistic' },
    { type: 'texture' as const, icon: <Layers className="w-5 h-5" />, name: 'Texture Brush', category: 'Artistic' },
    { type: 'oil' as const, icon: <Palette className="w-5 h-5" />, name: 'Oil Paint', category: 'Artistic' },
    { type: 'marker' as const, icon: <Zap className="w-5 h-5" />, name: 'Marker', category: 'Artistic' },
    { type: 'chalk' as const, icon: <Target className="w-5 h-5" />, name: 'Chalk', category: 'Artistic' },
    
    // Selection Tools
    { type: 'lasso' as const, icon: <Navigation className="w-5 h-5" />, name: 'Lasso Select', category: 'Selection' },
    { type: 'magic-wand' as const, icon: <Zap className="w-5 h-5" />, name: 'Magic Wand', category: 'Selection' },
    { type: 'select-rect' as const, icon: <Square className="w-5 h-5" />, name: 'Rectangle Select', category: 'Selection' },
    { type: 'move' as const, icon: <Move className="w-5 h-5" />, name: 'Move Tool', category: 'Selection' },
    { type: 'transform' as const, icon: <Scissors className="w-5 h-5" />, name: 'Transform', category: 'Selection' },
    
    // Shape Tools
    { type: 'line' as const, icon: <Minus className="w-5 h-5" />, name: 'Line', category: 'Shapes' },
    { type: 'circle' as const, icon: <Circle className="w-5 h-5" />, name: 'Circle', category: 'Shapes' },
    { type: 'rectangle' as const, icon: <Square className="w-5 h-5" />, name: 'Rectangle', category: 'Shapes' },
    { type: 'polygon' as const, icon: <Star className="w-5 h-5" />, name: 'Polygon', category: 'Shapes' },
    { type: 'star' as const, icon: <Star className="w-5 h-5" />, name: 'Star', category: 'Shapes' },
    { type: 'arrow' as const, icon: <ArrowLeft className="w-5 h-5" />, name: 'Arrow', category: 'Shapes' },
    
    // Color & Fill Tools
    { type: 'fill' as const, icon: <PaintBucket className="w-5 h-5" />, name: 'Fill', category: 'Color' },
    { type: 'gradient' as const, icon: <Palette className="w-5 h-5" />, name: 'Gradient', category: 'Color' },
    { type: 'eyedropper' as const, icon: <Droplet className="w-5 h-5" />, name: 'Eyedropper', category: 'Color' },
    
    // Text & Other
    { type: 'text' as const, icon: <Type className="w-5 h-5" />, name: 'Text Box', category: 'Other' },
    { type: 'sticky-note' as const, icon: <Square className="w-5 h-5" />, name: 'Sticky Note', category: 'Other' },
    { type: 'laser-pointer' as const, icon: <Target className="w-5 h-5" />, name: 'Laser Pointer', category: 'Other' },
    { type: 'timer' as const, icon: <Circle className="w-5 h-5" />, name: 'Timestamp', category: 'Other' },
    { type: 'ruler' as const, icon: <Minus className="w-5 h-5" />, name: 'Ruler', category: 'Other' },
    { type: 'grid' as const, icon: <Square className="w-5 h-5" />, name: 'Grid Toggle', category: 'Other' },
    { type: 'import-image' as const, icon: <Upload className="w-5 h-5" />, name: 'Import Image', category: 'Other' }
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
            <div className="text-white text-sm font-medium">
              Canvas Editor - All Professional Tools Available
            </div>

            {/* Grid Toggle */}
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-lg transition-colors ${
                showGrid ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              title="Toggle Grid"
            >
              <Square className="w-5 h-5" />
            </button>

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
              title="Download Canvas"
            >
              <Download className="w-5 h-5" />
            </button>

            <button
              onClick={triggerImageImport}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
              title="Import Image"
            >
              <Upload className="w-5 h-5" />
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

            {/* Blend Mode */}
            <div>
              <label className="text-gray-400 text-xs">Blend Mode</label>
              <select
                value={blendMode}
                onChange={(e) => setBlendMode(e.target.value as GlobalCompositeOperation)}
                className="w-full mt-1 bg-gray-700 text-white px-2 py-1 rounded text-xs border border-gray-600"
              >
                <option value="source-over">Normal</option>
                <option value="multiply">Multiply</option>
                <option value="screen">Screen</option>
                <option value="overlay">Overlay</option>
                <option value="soft-light">Soft Light</option>
                <option value="hard-light">Hard Light</option>
                <option value="color-dodge">Color Dodge</option>
                <option value="color-burn">Color Burn</option>
                <option value="darken">Darken</option>
                <option value="lighten">Lighten</option>
                <option value="difference">Difference</option>
                <option value="exclusion">Exclusion</option>
              </select>
            </div>

            {/* Layer Opacity */}
            <div>
              <label className="text-gray-400 text-xs">Layer Opacity: {Math.round(layerOpacity * 100)}%</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={layerOpacity}
                onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
                className="w-full mt-1"
              />
            </div>

            {/* Selection Tools */}
            {selection.active && (
              <div className="border-t border-gray-600 pt-4">
                <h4 className="text-gray-400 text-xs mb-2">Selection</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={cutSelection}
                    className="px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600"
                  >
                    Cut
                  </button>
                  <button
                    onClick={() => copySelection()}
                    className="px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600"
                  >
                    Copy
                  </button>
                  <button
                    onClick={clearSelection}
                    className="px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => pasteSelection(50, 50)}
                    className="px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600"
                  >
                    Paste
                  </button>
                </div>
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

            {/* Shape preview */}
            {shapePreview && ['line', 'rectangle', 'circle', 'polygon', 'star', 'arrow'].includes(currentTool.type) && (
              <svg
                className="absolute top-0 left-0 pointer-events-none"
                style={{
                  width: canvas.dimensions.width,
                  height: canvas.dimensions.height
                }}
              >
                {shapePreview.type === 'line' && (
                  <line
                    x1={shapePreview.startX}
                    y1={shapePreview.startY}
                    x2={shapePreview.endX}
                    y2={shapePreview.endY}
                    stroke={currentTool.color}
                    strokeWidth={currentTool.size}
                    opacity={currentTool.opacity}
                    strokeDasharray="5,5"
                  />
                )}
                {shapePreview.type === 'rectangle' && (
                  <rect
                    x={Math.min(shapePreview.startX, shapePreview.endX)}
                    y={Math.min(shapePreview.startY, shapePreview.endY)}
                    width={Math.abs(shapePreview.endX - shapePreview.startX)}
                    height={Math.abs(shapePreview.endY - shapePreview.startY)}
                    stroke={currentTool.color}
                    strokeWidth={currentTool.size}
                    fill="none"
                    opacity={currentTool.opacity}
                    strokeDasharray="5,5"
                  />
                )}
                {shapePreview.type === 'circle' && (
                  <circle
                    cx={(shapePreview.startX + shapePreview.endX) / 2}
                    cy={(shapePreview.startY + shapePreview.endY) / 2}
                    r={Math.sqrt(Math.pow(shapePreview.endX - shapePreview.startX, 2) + Math.pow(shapePreview.endY - shapePreview.startY, 2)) / 2}
                    stroke={currentTool.color}
                    strokeWidth={currentTool.size}
                    fill="none"
                    opacity={currentTool.opacity}
                    strokeDasharray="5,5"
                  />
                )}
                {(shapePreview.type === 'polygon' || shapePreview.type === 'star') && (
                  <circle
                    cx={(shapePreview.startX + shapePreview.endX) / 2}
                    cy={(shapePreview.startY + shapePreview.endY) / 2}
                    r={Math.sqrt(Math.pow(shapePreview.endX - shapePreview.startX, 2) + Math.pow(shapePreview.endY - shapePreview.startY, 2)) / 2}
                    stroke={currentTool.color}
                    strokeWidth={currentTool.size}
                    fill="none"
                    opacity={currentTool.opacity * 0.5}
                    strokeDasharray="5,5"
                  />
                )}
                {shapePreview.type === 'arrow' && (
                  <g>
                    <line
                      x1={shapePreview.startX}
                      y1={shapePreview.startY}
                      x2={shapePreview.endX}
                      y2={shapePreview.endY}
                      stroke={currentTool.color}
                      strokeWidth={currentTool.size}
                      opacity={currentTool.opacity}
                      strokeDasharray="5,5"
                    />
                    <polygon
                      points={`${shapePreview.endX},${shapePreview.endY} ${shapePreview.endX - 15},${shapePreview.endY - 5} ${shapePreview.endX - 15},${shapePreview.endY + 5}`}
                      stroke={currentTool.color}
                      strokeWidth={currentTool.size}
                      fill={currentTool.color}
                      opacity={currentTool.opacity * 0.7}
                    />
                  </g>
                )}
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

            {/* Selection Overlay */}
            {selection.active && selection.bounds && (
              <div
                className="absolute border-2 border-dashed border-blue-500 bg-blue-100 bg-opacity-20 pointer-events-none"
                style={{
                  left: selection.bounds.x,
                  top: selection.bounds.y,
                  width: selection.bounds.width,
                  height: selection.bounds.height
                }}
              >
                <div className="absolute -top-6 left-0 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                  {selection.type} selection
                </div>
              </div>
            )}

            {/* Lasso Selection Path */}
            {isSelecting && currentTool.type === 'lasso' && selection.path.length > 0 && (
              <svg
                className="absolute top-0 left-0 pointer-events-none"
                style={{
                  width: canvas.dimensions.width,
                  height: canvas.dimensions.height
                }}
              >
                <path
                  d={`M ${selection.path.map(p => `${p.x},${p.y}`).join(' L ')}`}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  fill="none"
                />
              </svg>
            )}

            {/* Rectangle Selection Preview */}
            {isSelecting && currentTool.type === 'select-rect' && selection.bounds && (
              <div
                className="absolute border-2 border-dashed border-blue-500 bg-blue-100 bg-opacity-10 pointer-events-none"
                style={{
                  left: selection.bounds.x,
                  top: selection.bounds.y,
                  width: selection.bounds.width,
                  height: selection.bounds.height
                }}
              />
            )}

            {/* Sticky Notes */}
            {stickyNotes.map(note => (
              <div
                key={note.id}
                className="absolute bg-yellow-200 border border-yellow-300 rounded shadow-lg cursor-move"
                style={{
                  left: note.x,
                  top: note.y,
                  width: note.width,
                  height: note.height,
                  backgroundColor: note.color === 'yellow' ? '#fef3c7' : 
                                  note.color === 'blue' ? '#dbeafe' :
                                  note.color === 'green' ? '#dcfce7' :
                                  note.color === 'pink' ? '#fce7f3' : '#fef3c7'
                }}
                onMouseDown={(e) => {
                  // Simple drag functionality (can be enhanced)
                  e.preventDefault();
                  const startX = e.clientX - note.x;
                  const startY = e.clientY - note.y;
                  
                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    updateStickyNote(note.id, {
                      x: moveEvent.clientX - startX,
                      y: moveEvent.clientY - startY
                    });
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              >
                <div className="p-2 h-full">
                  <textarea
                    value={note.content}
                    onChange={(e) => updateStickyNote(note.id, { content: e.target.value })}
                    className="w-full h-full bg-transparent border-none outline-none resize-none text-sm"
                    placeholder="Type your note..."
                  />
                  <button
                    onClick={() => deleteStickyNote(note.id)}
                    className="absolute top-1 right-1 text-gray-500 hover:text-red-500 text-xs"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-1 right-1 text-xs text-gray-500">
                    {note.user}
                  </div>
                </div>
              </div>
            ))}

            {/* Text Boxes */}
            {textBoxes.map(textBox => (
              <div
                key={textBox.id}
                className="absolute bg-white border-2 border-blue-300 rounded shadow-lg cursor-move"
                style={{
                  left: textBox.x,
                  top: textBox.y,
                  width: textBox.width,
                  height: textBox.height,
                  fontSize: textBox.fontSize,
                  fontFamily: textBox.fontFamily,
                  color: textBox.color
                }}
                onMouseDown={(e) => {
                  // Simple drag functionality
                  e.preventDefault();
                  const startX = e.clientX - textBox.x;
                  const startY = e.clientY - textBox.y;
                  
                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    updateTextBox(textBox.id, {
                      x: moveEvent.clientX - startX,
                      y: moveEvent.clientY - startY
                    });
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
                onDoubleClick={() => updateTextBox(textBox.id, { isEditing: true })}
              >
                <div className="p-2 h-full relative">
                  {textBox.isEditing ? (
                    <input
                      type="text"
                      value={textBox.content}
                      onChange={(e) => updateTextBox(textBox.id, { content: e.target.value })}
                      onBlur={() => updateTextBox(textBox.id, { isEditing: false })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateTextBox(textBox.id, { isEditing: false });
                        }
                      }}
                      className="w-full h-full bg-transparent border-none outline-none"
                      autoFocus
                    />
                  ) : (
                    <div 
                      className="w-full h-full cursor-text"
                      onDoubleClick={() => updateTextBox(textBox.id, { isEditing: true })}
                    >
                      {textBox.content}
                    </div>
                  )}
                  
                  <button
                    onClick={() => deleteTextBox(textBox.id)}
                    className="absolute top-1 right-1 text-gray-500 hover:text-red-500 text-xs"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-1 right-1 text-xs text-gray-500">
                    {textBox.user}
                  </div>
                </div>
              </div>
            ))}
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
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      // Hide the img element and show fallback if image fails to load
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                      const fallback = img.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                {!state.user?.avatar && (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {state.user?.username?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
                {/* Fallback div (hidden by default, shown if image fails) */}
                {state.user?.avatar && (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center" style={{display: 'none'}}>
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
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        // Hide the img element and show fallback if image fails to load
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        const fallback = img.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  {!user.avatar && (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.username[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  {/* Fallback div (hidden by default, shown if image fails) */}
                  {user.avatar && (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center" style={{display: 'none'}}>
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
