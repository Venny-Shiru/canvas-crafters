import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CanvasCard from '../components/CanvasCard';
import { 
  Plus, 
  Search, 
  Grid3X3, 
  List,
  Palette,
  Users,
  Eye,
  Heart,
  TrendingUp,
  Clock
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

interface DashboardStats {
  canvasCount: number;
  totalViews: number;
  totalLikes: number;
  collaborationCount: number;
}

const Dashboard: React.FC = () => {
  const { state } = useAuth();
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    canvasCount: 0,
    totalViews: 0,
    totalLikes: 0,
    collaborationCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private'>('all');

  useEffect(() => {
    console.log('Dashboard mounted, auth state:', {
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      user: state.user,
      token: localStorage.getItem('token')
    });
    
    // Only fetch data when auth check is complete and user is authenticated
    if (!state.isLoading && state.isAuthenticated) {
      fetchDashboardData();
    } else if (!state.isLoading && !state.isAuthenticated) {
      console.log('User not authenticated, stopping loading');
      setLoading(false);
    }
  }, [state.isAuthenticated, state.isLoading]);

  const fetchDashboardData = async () => {
    try {
      console.log('Starting dashboard data fetch...');
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      // Fetch user's canvases
      console.log('Fetching canvases...');
      const canvasResponse = await fetch(`${API_BASE_URL}/canvas?type=my`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('Canvas response status:', canvasResponse.status);
      if (canvasResponse.ok) {
        const canvasData = await canvasResponse.json();
        console.log('Canvas data:', canvasData);
        setCanvases(canvasData.canvases || []);
      }

      // Fetch user stats
      console.log('Fetching user stats...');
      const statsResponse = await fetch(`${API_BASE_URL}/user/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('Stats response status:', statsResponse.status);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('Stats data:', statsData);
        
        // Ensure we have valid stats with default values
        const validStats = {
          canvasCount: statsData.stats?.canvasCount || 0,
          totalViews: statsData.stats?.totalViews || 0,
          totalLikes: statsData.stats?.totalLikes || 0,
          collaborationCount: statsData.stats?.collaborationCount || 0
        };
        
        setStats(validStats);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      console.log('Dashboard data fetch complete, setting loading to false');
      setLoading(false);
    }
  };

  const handleDeleteCanvas = async (canvasId: string) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/canvas/${canvasId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setCanvases(canvases.filter(canvas => canvas._id !== canvasId));
        setStats({
          ...stats,
          canvasCount: stats.canvasCount - 1
        });
      }
    } catch (error) {
      console.error('Error deleting canvas:', error);
    }
  };

  const handleLikeCanvas = async (canvasId: string) => {
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

  const filteredCanvases = canvases.filter(canvas => {
    const matchesSearch = canvas.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         canvas.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' ||
                         (filterType === 'public' && canvas.settings.isPublic) ||
                         (filterType === 'private' && !canvas.settings.isPublic);

    return matchesSearch && matchesFilter;
  });

  const statCards = [
    {
      title: 'Total Canvases',
      value: stats.canvasCount || 0,
      icon: <Palette className="w-6 h-6" />,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Views',
      value: stats.totalViews || 0,
      icon: <Eye className="w-6 h-6" />,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Total Likes',
      value: stats.totalLikes || 0,
      icon: <Heart className="w-6 h-6" />,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      title: 'Collaborations',
      value: stats.collaborationCount || 0,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    }
  ];

  // Show loading spinner while auth is being checked
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading spinner while dashboard data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, this should not happen due to ProtectedRoute, but just in case
  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please log in to access your dashboard.</p>
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {state.user?.username}! 👋
              </h1>
              <p className="text-gray-600">
                Manage your canvases and track your creative journey
              </p>
            </div>
            <Link
              to="/canvas/new"
              className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Canvas</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl text-white`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {canvases.slice(0, 3).map(canvas => (
              <div key={canvas._id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{canvas.title}</p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Last modified {new Date(canvas.lastModified).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  to={`/canvas/${canvas._id}`}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  View
                </Link>
              </div>
            ))}
            {canvases.length === 0 && (
              <div className="text-center py-8">
                <Palette className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No recent activity yet</p>
                <Link
                  to="/canvas/new"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create your first canvas
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Canvas Management */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">My Canvases</h2>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search canvases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'public' | 'private')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">All Canvases</option>
                <option value="public">Public Only</option>
                <option value="private">Private Only</option>
              </select>

              {/* View Mode */}
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

          {/* Canvas Grid/List */}
          {filteredCanvases.length > 0 ? (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {filteredCanvases.map(canvas => (
                <CanvasCard
                  key={canvas._id}
                  canvas={canvas}
                  showActions={true}
                  onDelete={handleDeleteCanvas}
                  onLike={handleLikeCanvas}
                  currentUserId={state.user?._id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No canvases found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start creating your first digital masterpiece'
                }
              </p>
              {!searchTerm && filterType === 'all' && (
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
  );
};

export default Dashboard;
