import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CanvasCard from '../components/CanvasCard';
import { 
  User, 
  Calendar, 
  Eye, 
  Heart, 
  Palette, 
  Users, 
  Settings,
  Grid3X3,
  List
} from 'lucide-react';

interface UserProfile {
  _id: string;
  username: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  lastLogin?: string;
}

interface UserStats {
  canvasCount: number;
  totalViews: number;
  totalLikes: number;
  collaborationCount: number;
}

interface Canvas {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  owner?: {
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

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { state } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    canvasCount: 0,
    totalViews: 0,
    totalLikes: 0,
    collaborationCount: 0
  });
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('canvases');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const isOwnProfile = state.user?.username === username;

  useEffect(() => {
    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/user/profile/${username}`, {
        headers: state.isAuthenticated ? {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        } : {}
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setStats(data.stats || stats);
        setCanvases(data.canvases || []);
      } else {
        console.error('Profile not found');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeCanvas = async (canvasId: string) => {
    if (!state.isAuthenticated) return;

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/canvas/${canvasId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCanvases(canvases.map(canvas => 
          canvas._id === canvasId 
            ? { 
                ...canvas, 
                likeCount: data.likeCount,
                likes: data.liked 
                  ? [...(canvas.likes || []), state.user?._id || '']
                  : (canvas.likes || []).filter(id => id !== state.user?._id)
              }
            : canvas
        ));
      }
    } catch (error) {
      console.error('Error liking canvas:', error);
    }
  };

  const tabs = [
    { id: 'canvases', name: 'Canvases', count: stats.canvasCount },
    { id: 'collaborations', name: 'Collaborations', count: stats.collaborationCount }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">
            The user you're looking for doesn't exist or their profile is private.
          </p>
          <Link
            to="/explore"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Explore Canvases
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            
            {/* Profile Info */}
            <div className="flex items-center space-x-4 sm:space-x-6 mb-6 md:mb-0">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.username}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600 flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center border-4 border-gray-200 dark:border-gray-600 flex-shrink-0">
                  <span className="text-white text-xl sm:text-2xl font-bold">
                    {profile.username[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 break-words">
                  {profile.username}
                </h1>
                
                {profile.bio && (
                  <p className="text-gray-600 dark:text-gray-300 mb-3 max-w-md text-sm sm:text-base">
                    {profile.bio}
                  </p>
                )}
                
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  {profile.lastLogin && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Last seen {new Date(profile.lastLogin).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              {isOwnProfile ? (
                <Link
                  to="/settings"
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span>Edit Profile</span>
                </Link>
              ) : (
                <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  <Users className="w-5 h-5" />
                  <span>Follow</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Palette className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.canvasCount}</div>
            <div className="text-sm text-gray-600">Canvases</div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Views</div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalLikes.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Likes</div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.collaborationCount}</div>
            <div className="text-sm text-gray-600">Collaborations</div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-md">
          
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
              <nav className="flex space-x-8">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{tab.name}</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {canvases.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {canvases.map(canvas => (
                  <CanvasCard
                    key={canvas._id}
                    canvas={canvas}
                    onLike={handleLikeCanvas}
                    currentUserId={state.user?._id}
                    showActions={isOwnProfile}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Palette className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'canvases' ? 'No canvases yet' : 'No collaborations yet'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {isOwnProfile 
                    ? activeTab === 'canvases' 
                      ? 'Start creating your first digital masterpiece'
                      : 'Collaborate with other artists to get started'
                    : `${profile.username} hasn't ${activeTab === 'canvases' ? 'created any canvases' : 'collaborated on any projects'} yet`
                  }
                </p>
                {isOwnProfile && activeTab === 'canvases' && (
                  <Link
                    to="/canvas/new"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Canvas
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
