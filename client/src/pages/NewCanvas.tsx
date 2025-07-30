import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowLeft, 
  Palette, 
  Globe, 
  Lock
} from 'lucide-react';
import { canvasApi } from '../utils/api';

interface CanvasSettings {
  title: string;
  description: string;
  dimensions: {
    width: number;
    height: number;
  };
  settings: {
    isPublic: boolean;
    allowComments: boolean;
    backgroundColor: string;
  };
  tags: string[];
}

const NewCanvas: React.FC = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [canvas, setCanvas] = useState<CanvasSettings>({
    title: '',
    description: '',
    dimensions: {
      width: 800,
      height: 600
    },
    settings: {
      isPublic: false,
      allowComments: true,
      backgroundColor: '#ffffff'
    },
    tags: []
  });

  const [tagInput, setTagInput] = useState('');

  const presetSizes = [
    { name: 'Small Canvas', width: 600, height: 400, icon: '📱' },
    { name: 'Medium Canvas', width: 800, height: 600, icon: '💻' },
    { name: 'Large Canvas', width: 1200, height: 800, icon: '🖥️' },
    { name: 'Widescreen', width: 1920, height: 1080, icon: '📺' },
    { name: 'Square', width: 800, height: 800, icon: '⬜' },
    { name: 'Portrait', width: 600, height: 800, icon: '📄' }
  ];

  const backgroundPresets = [
    { name: 'White', color: '#ffffff' },
    { name: 'Light Gray', color: '#f8fafc' },
    { name: 'Dark Gray', color: '#1e293b' },
    { name: 'Black', color: '#000000' },
    { name: 'Cream', color: '#fef7ed' },
    { name: 'Light Blue', color: '#dbeafe' }
  ];

  const handleCreateCanvas = async () => {
    if (!canvas.title.trim()) {
      alert('Please enter a canvas title');
      return;
    }

    setLoading(true);

    try {
      const data = await canvasApi.createCanvas(canvas);
      navigate(`/canvas/${data.canvas._id}`);
    } catch (error) {
      console.error('Error creating canvas:', error);
      alert(error instanceof Error ? error.message : 'Failed to create canvas. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !canvas.tags.includes(tagInput.trim())) {
      setCanvas({
        ...canvas,
        tags: [...canvas.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCanvas({
      ...canvas,
      tags: canvas.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const nextStep = () => {
    if (step === 1 && !canvas.title.trim()) {
      alert('Please enter a canvas title');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Palette className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Create New Canvas</h1>
          </div>
          <p className="text-gray-600">
            Set up your digital canvas and start creating your masterpiece
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold
                  ${step >= stepNumber 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`
                    w-12 h-1 rounded-full
                    ${step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'}
                  `} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
                <p className="text-gray-600">Give your canvas a name and description</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canvas Title *
                </label>
                <input
                  type="text"
                  value={canvas.title}
                  onChange={(e) => setCanvas({ ...canvas, title: e.target.value })}
                  placeholder="Enter a creative title for your canvas"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
                  maxLength={100}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {canvas.title.length}/100 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={canvas.description}
                  onChange={(e) => setCanvas({ ...canvas, description: e.target.value })}
                  placeholder="Describe what you plan to create..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  maxLength={500}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {canvas.description.length}/500 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (Optional)
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {canvas.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add tags (e.g., art, design, collaboration)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    maxLength={30}
                  />
                  <button
                    onClick={addTag}
                    disabled={!tagInput.trim() || canvas.tags.length >= 10}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {canvas.tags.length}/10 tags • Help others discover your canvas
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Canvas Settings */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Canvas Settings</h2>
                <p className="text-gray-600">Configure the size and appearance of your canvas</p>
              </div>

              {/* Canvas Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Canvas Size
                </label>
                
                {/* Preset Sizes */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {presetSizes.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => setCanvas({
                        ...canvas,
                        dimensions: { width: preset.width, height: preset.height }
                      })}
                      className={`
                        p-4 border-2 rounded-lg text-left transition-colors
                        ${canvas.dimensions.width === preset.width && canvas.dimensions.height === preset.height
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="text-2xl mb-2">{preset.icon}</div>
                      <div className="font-medium text-gray-900">{preset.name}</div>
                      <div className="text-sm text-gray-500">
                        {preset.width} × {preset.height}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom Size */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Custom Size</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Width (px)
                      </label>
                      <input
                        type="number"
                        min="100"
                        max="4000"
                        value={canvas.dimensions.width}
                        onChange={(e) => setCanvas({
                          ...canvas,
                          dimensions: { ...canvas.dimensions, width: parseInt(e.target.value) || 800 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Height (px)
                      </label>
                      <input
                        type="number"
                        min="100"
                        max="4000"
                        value={canvas.dimensions.height}
                        onChange={(e) => setCanvas({
                          ...canvas,
                          dimensions: { ...canvas.dimensions, height: parseInt(e.target.value) || 600 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Background Color
                </label>
                
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                  {backgroundPresets.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => setCanvas({
                        ...canvas,
                        settings: { ...canvas.settings, backgroundColor: preset.color }
                      })}
                      className={`
                        p-3 border-2 rounded-lg text-center transition-colors
                        ${canvas.settings.backgroundColor === preset.color
                          ? 'border-blue-500'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                      style={{ backgroundColor: preset.color }}
                    >
                      <div className={`text-sm font-medium ${
                        preset.color === '#000000' || preset.color === '#1e293b' 
                          ? 'text-white' 
                          : 'text-gray-900'
                      }`}>
                        {preset.name}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-gray-700">Custom Color:</label>
                  <input
                    type="color"
                    value={canvas.settings.backgroundColor}
                    onChange={(e) => setCanvas({
                      ...canvas,
                      settings: { ...canvas.settings, backgroundColor: e.target.value }
                    })}
                    className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <span className="text-sm text-gray-500">
                    {canvas.settings.backgroundColor}
                  </span>
                </div>
              </div>

              {/* Canvas Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Preview
                </label>
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div
                    className="mx-auto border border-gray-300 shadow-sm"
                    style={{
                      width: Math.min(canvas.dimensions.width / 2, 400),
                      height: Math.min(canvas.dimensions.height / 2, 300),
                      backgroundColor: canvas.settings.backgroundColor
                    }}
                  />
                  <p className="text-center text-sm text-gray-500 mt-2">
                    {canvas.dimensions.width} × {canvas.dimensions.height} pixels
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Privacy & Sharing */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Privacy & Sharing</h2>
                <p className="text-gray-600">Choose who can see and interact with your canvas</p>
              </div>

              <div className="space-y-6">
                {/* Privacy Setting */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Canvas Visibility
                  </label>
                  
                  <div className="space-y-3">
                    <div
                      className={`
                        border-2 rounded-lg p-4 cursor-pointer transition-colors
                        ${!canvas.settings.isPublic
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                      onClick={() => setCanvas({
                        ...canvas,
                        settings: { ...canvas.settings, isPublic: false }
                      })}
                    >
                      <div className="flex items-center space-x-3">
                        <Lock className="w-6 h-6 text-gray-600" />
                        <div>
                          <div className="font-medium text-gray-900">Private Canvas</div>
                          <div className="text-sm text-gray-500">
                            Only you and invited collaborators can view this canvas
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`
                        border-2 rounded-lg p-4 cursor-pointer transition-colors
                        ${canvas.settings.isPublic
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                      onClick={() => setCanvas({
                        ...canvas,
                        settings: { ...canvas.settings, isPublic: true }
                      })}
                    >
                      <div className="flex items-center space-x-3">
                        <Globe className="w-6 h-6 text-gray-600" />
                        <div>
                          <div className="font-medium text-gray-900">Public Canvas</div>
                          <div className="text-sm text-gray-500">
                            Anyone can view this canvas, and it will appear in the explore gallery
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comments Setting */}
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Allow Comments
                      </label>
                      <p className="text-sm text-gray-500">
                        Let viewers leave feedback and suggestions
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={canvas.settings.allowComments}
                        onChange={(e) => setCanvas({
                          ...canvas,
                          settings: { ...canvas.settings, allowComments: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-medium text-gray-900 mb-4">Canvas Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Title:</span>
                      <span className="font-medium">{canvas.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-medium">
                        {canvas.dimensions.width} × {canvas.dimensions.height} px
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Visibility:</span>
                      <span className="font-medium">
                        {canvas.settings.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Comments:</span>
                      <span className="font-medium">
                        {canvas.settings.allowComments ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    {canvas.tags.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tags:</span>
                        <span className="font-medium">
                          {canvas.tags.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-200">
            <div>
              {step > 1 && (
                <button
                  onClick={prevStep}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Previous</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              {step < 3 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span>Next</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleCreateCanvas}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Palette className="w-5 h-5" />
                      <span>Create Canvas</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewCanvas;
