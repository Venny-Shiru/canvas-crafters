import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Eye, 
  Heart, 
  User, 
  Calendar,
  Share2,
  Edit,
  Trash2,
  Lock,
  Globe
} from 'lucide-react';

interface Canvas {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  owner: {
    _id: string;
    username: string;
    avatar?: string;
  };
  views: number;
  likes: string[];
  likeCount?: number;
  createdAt: string;
  lastModified: string;
  settings: {
    isPublic: boolean;
  };
  collaborators?: Array<{
    user: {
      _id: string;
      username: string;
      avatar?: string;
    };
    permission: string;
  }>;
}

interface CanvasCardProps {
  canvas: Canvas;
  showActions?: boolean;
  onDelete?: (canvasId: string) => void;
  onLike?: (canvasId: string) => void;
  currentUserId?: string;
}

const CanvasCard: React.FC<CanvasCardProps> = ({
  canvas,
  showActions = false,
  onDelete,
  onLike,
  currentUserId
}) => {
  const isOwner = currentUserId === canvas.owner._id;
  const isLiked = canvas.likes?.includes(currentUserId || '');
  const likeCount = canvas.likeCount || canvas.likes?.length || 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLike) {
      onLike(canvas._id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete && window.confirm('Are you sure you want to delete this canvas?')) {
      onDelete(canvas._id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
      <Link to={`/canvas/${canvas._id}`} className="block">
        {/* Thumbnail */}
        <div className="aspect-video bg-gray-100 overflow-hidden relative">
          {canvas.thumbnail ? (
            <img
              src={canvas.thumbnail}
              alt={canvas.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="w-8 h-8 bg-gray-300 rounded"></div>
                </div>
                <span className="text-sm">No preview</span>
              </div>
            </div>
          )}
          
          {/* Privacy indicator */}
          <div className="absolute top-2 left-2">
            {canvas.settings.isPublic ? (
              <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                <Globe className="w-3 h-3 mr-1" />
                Public
              </div>
            ) : (
              <div className="bg-gray-600 text-white px-2 py-1 rounded-full text-xs flex items-center">
                <Lock className="w-3 h-3 mr-1" />
                Private
              </div>
            )}
          </div>

          {/* Overlay with actions */}
          {showActions && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-2">
                <Link
                  to={`/canvas/${canvas._id}/edit`}
                  className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigator.share?.({ 
                      title: canvas.title, 
                      url: `${window.location.origin}/canvas/${canvas._id}` 
                    });
                  }}
                  className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                {isOwner && onDelete && (
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {canvas.title}
          </h3>

          {/* Description */}
          {canvas.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {canvas.description}
            </p>
          )}

          {/* Owner info */}
          <div className="flex items-center space-x-2 mb-3">
            {canvas.owner.avatar ? (
              <img
                src={canvas.owner.avatar}
                alt={canvas.owner.username}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 p-1 bg-gray-200 rounded-full" />
            )}
            <span className="text-sm text-gray-600">{canvas.owner.username}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{canvas.views}</span>
              </div>
              <button
                onClick={handleLike}
                disabled={!currentUserId}
                className={`flex items-center space-x-1 transition-colors ${
                  isLiked 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'hover:text-red-500'
                } ${!currentUserId ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likeCount}</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(canvas.createdAt)}</span>
            </div>
          </div>

          {/* Collaborators */}
          {canvas.collaborators && canvas.collaborators.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Collaborators:</span>
                <div className="flex -space-x-1">
                  {canvas.collaborators.slice(0, 3).map((collab) => (
                    <div key={collab.user._id} className="relative">
                      {collab.user.avatar ? (
                        <img
                          src={collab.user.avatar}
                          alt={collab.user.username}
                          className="w-5 h-5 rounded-full border-2 border-white object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 p-0.5 bg-gray-200 rounded-full border-2 border-white" />
                      )}
                    </div>
                  ))}
                  {canvas.collaborators.length > 3 && (
                    <div className="w-5 h-5 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center">
                      <span className="text-xs text-gray-600">+{canvas.collaborators.length - 3}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default CanvasCard;