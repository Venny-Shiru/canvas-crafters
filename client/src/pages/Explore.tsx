import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CanvasCard from '../components/CanvasCard';
import { 
  Search, 
  Grid3X3, 
  List, 
  TrendingUp, 
  Clock, 
  Heart, 
  Eye,
  Star,
  Palette,
  Users,
  Tag
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
  tags: string[];
  collaborators?: Array<{
    user: {
      _id: string;
      username: string;
      avatar?: string;
    };
    permission: string;
  }>;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const Explore: React.FC = () => {
  const { state } = useAuth();
  
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'createdAt' | 'views' | 'likes' | 'lastModified'>('createdAt');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  });

  const [featuredCanvases, setFeaturedCanvases] = useState<Canvas[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalCanvases: 0,
    totalArtists: 0,
    totalViews: 0
  });

  useEffect(() => {
    fetchCanvases();
    fetchFeaturedCanvases();
    fetchPopularTags();
    fetchStats();
  }, [searchTerm, selectedTags, sortBy]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    fetchCanvases(page);
  };

  const fetchCanvases = async (page = 1) => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sortBy,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedTags.length > 0 && { tags: selectedTags.join(',') })
      });

      const response = await fetch(`${API_BASE_URL}/canvas?${params}`, {
        headers: state.isAuthenticated ? {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        } : {}
      });

      if (response.ok) {
        const data = await response.json();
        setCanvases(data.canvases || []);
        setPagination(data.pagination || pagination);
      }
    } catch (error) {
      console.error('Error fetching canvases:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedCanvases = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/canvas?limit=6&sortBy=views`, {
        headers: state.isAuthenticated ? {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        } : {}
      });

      if (response.ok) {
        const data = await response.json();
        setFeaturedCanvases(data.canvases?.slice(0, 3) || []);
      }
    } catch (error) {
      console.error('Error fetching featured canvases:', error);
    }
  };

  const fetchPopularTags = async () => {
    // This would typically come from a dedicated endpoint
    // For now, we'll simulate it
    setPopularTags(['digital-art', 'collaboration', 'design', 'abstract', 'portrait', 'landscape', 'concept-art', 'illustration']);
  };

  const fetchStats = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/stats`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalCanvases: data.totalCanvases || 0,
          totalArtists: data.totalUsers || 0,
          totalViews: data.totalViews || 0
        });
      } else {
        // Fallback to demo data if API fails
        setStats({
          totalCanvases: 30,
          totalArtists: 12,
          totalViews: 850
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to demo data
      setStats({
        totalCanvases: 30,
        totalArtists: 12,
        totalViews: 850
      });
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

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    setSortBy('createdAt');
  };

  const sortOptions = [
    { value: 'createdAt', label: 'Newest First', icon: <Clock className="w-4 h-4" /> },
    { value: 'views', label: 'Most Viewed', icon: <Eye className="w-4 h-4" /> },
    { value: 'likes', label: 'Most Liked', icon: <Heart className="w-4 h-4" /> },
    { value: 'lastModified', label: 'Recently Updated', icon: <TrendingUp className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Explore Creative Canvases 🎨
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover amazing digital artwork from our creative community. Get inspired, learn new techniques, and connect with artists worldwide.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 text-center">
            <div className="bg-blue-100 dark:bg-blue-900/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Palette className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCanvases.toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Canvases</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 text-center">
            <div className="bg-green-100 dark:bg-green-900/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalArtists.toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Artists</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 text-center">
            <div className="bg-purple-100 dark:bg-purple-900/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalViews.toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Views</div>
          </div>
        </div>

        {/* Featured Canvases */}
        {featuredCanvases.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center space-x-2 mb-6">
              <Star className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Canvases</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredCanvases.map(canvas => (
                <div key={canvas._id} className="relative group">
                  <CanvasCard
                    canvas={canvas}
                    onLike={handleLikeCanvas}
                    currentUserId={state.user?._id}
                  />
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    ⭐ Featured
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search canvases, artists, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
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

              {(searchTerm || selectedTags.length > 0) && (
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Popular Tags */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <Tag className="w-5 h-5 text-gray-600" />
              <h3 className="font-medium text-gray-900">Popular Tags</h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {popularTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas Grid */}
        <div className="mb-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading amazing canvases...</p>
              </div>
            </div>
          ) : canvases.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {pagination.totalItems} Canvas{pagination.totalItems !== 1 ? 'es' : ''} Found
                </h2>
                <div className="text-sm text-gray-500">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
              </div>

              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }>
                {canvases.map(canvas => (
                  <CanvasCard
                    key={canvas._id}
                    canvas={canvas}
                    onLike={handleLikeCanvas}
                    currentUserId={state.user?._id}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-8">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-lg ${
                            page === pagination.currentPage
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No canvases found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || selectedTags.length > 0 
                  ? 'Try adjusting your search terms or filters'
                  : 'Be the first to share your creative work with the community!'
                }
              </p>
              {!searchTerm && selectedTags.length === 0 && (
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Explore All Canvases
                </button>
              )}
            </div>
          )}
        </div>

        {/* Call to Action */}
        {!state.isAuthenticated && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Join the Creative Community</h2>
            <p className="text-blue-100 mb-6">
              Sign up to like canvases, follow artists, and start creating your own digital masterpieces
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Get Started Free
              </a>
              <a
                href="/login"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Sign In
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
