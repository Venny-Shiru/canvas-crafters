import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  User, 
  Lock, 
  Bell, 
  Globe, 
  Palette, 
  Save,
  Eye,
  EyeOff,
  Camera,
  Trash2,
  Settings as SettingsIcon
} from 'lucide-react';

interface UserSettings {
  username: string;
  email: string;
  bio: string;
  avatar: string;
  notifications: {
    emailNotifications: boolean;
    canvasComments: boolean;
    collaborationInvites: boolean;
    weeklyDigest: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showCanvasCount: boolean;
    showCollaborations: boolean;
  };
  preferences: {
    defaultCanvasSize: string;
    autoSaveInterval: number;
    theme: 'light' | 'dark' | 'auto';
  };
}

const Settings: React.FC = () => {
  const { state, logout, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [settings, setSettings] = useState<UserSettings>({
    username: state.user?.username || '',
    email: state.user?.email || '',
    bio: '',
    avatar: state.user?.avatar || '',
    notifications: {
      emailNotifications: true,
      canvasComments: true,
      collaborationInvites: true,
      weeklyDigest: false
    },
    privacy: {
      profileVisibility: 'public',
      showCanvasCount: true,
      showCollaborations: true
    },
    preferences: {
      defaultCanvasSize: '800x600',
      autoSaveInterval: 30,
      theme: 'light'
    }
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showPasswords: false
  });

  const [avatarUpload, setAvatarUpload] = useState({
    uploading: false,
    selectedFile: null as File | null
  });

  useEffect(() => {
    fetchUserSettings();
  }, []);

  // Update settings when user data changes in AuthContext
  useEffect(() => {
    if (state.user) {
      console.log('Settings page: Updating avatar from auth context:', state.user.avatar);
      setSettings(prevSettings => ({
        ...prevSettings,
        username: state.user?.username || '',
        email: state.user?.email || '',
        bio: state.user?.bio || '',
        avatar: state.user?.avatar || ''
      }));
    }
  }, [state.user]);

  // Sync theme context with settings state
  useEffect(() => {
    setSettings(prevSettings => ({
      ...prevSettings,
      preferences: { ...prevSettings.preferences, theme }
    }));
  }, [theme]);

  const fetchUserSettings = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/users/settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings({ ...settings, ...data.settings });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/users/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }

    try {
      setSaving(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (response.ok) {
        alert('Password changed successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          showPasswords: false
        });
        setShowPasswordForm(false);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    const confirmation = window.prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation !== 'DELETE') {
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/users/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert('Account deleted successfully');
        logout();
      } else {
        alert('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setAvatarUpload({ uploading: true, selectedFile: file });
      
      const formData = new FormData();
      formData.append('avatar', file);
      
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/auth/upload-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Avatar upload response:', data);
        
        // Use the avatar URL from the user object (now absolute)
        const avatarUrl = data.user.avatar;
        console.log('Avatar URL from response:', avatarUrl);
        
        // Update local settings state with cache busting
        setSettings(prevSettings => ({ 
          ...prevSettings, 
          avatar: avatarUrl + '?t=' + Date.now() // Add timestamp to force refresh
        }));
        
        // Refresh user data in AuthContext to update everywhere
        await refreshUser();
        
        alert('Avatar uploaded successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to upload avatar');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar');
    } finally {
      setAvatarUpload({ uploading: false, selectedFile: null });
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      handleAvatarUpload(file);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: <User className="w-5 h-5" /> },
    { id: 'notifications', name: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'privacy', name: 'Privacy', icon: <Globe className="w-5 h-5" /> },
    { id: 'preferences', name: 'Preferences', icon: <Palette className="w-5 h-5" /> },
    { id: 'security', name: 'Security', icon: <Lock className="w-5 h-5" /> }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <SettingsIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-2">
              <nav className="space-y-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-r-2 border-blue-700 dark:border-blue-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.icon}
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md">
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Profile Information</h2>
                  
                  <div className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center space-x-4 sm:space-x-6">
                      <div className="relative flex-shrink-0">
                        {settings.avatar ? (
                          <img
                            key={settings.avatar} // Force re-render when avatar changes
                            src={settings.avatar}
                            alt="Profile"
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                            onLoad={() => console.log('Avatar image loaded:', settings.avatar)}
                            onError={(e) => {
                              console.log('Avatar image failed to load:', settings.avatar);
                              console.log('Error event:', e);
                            }}
                          />
                        ) : (
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center border-4 border-gray-200 dark:border-gray-600">
                            <User className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-300" />
                          </div>
                        )}
                        <label 
                          htmlFor="avatar-upload"
                          className="absolute bottom-0 right-0 bg-blue-600 dark:bg-blue-500 text-white p-1.5 sm:p-2 rounded-full hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors cursor-pointer"
                        >
                          <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                        </label>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Profile Photo</h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
                          Upload a photo to personalize your profile
                        </p>
                        <label 
                          htmlFor="avatar-upload" 
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs sm:text-sm font-medium cursor-pointer"
                        >
                          {avatarUpload.uploading ? 'Uploading...' : 'Change Photo'}
                        </label>
                        {/* Debug info - hide on production */}
                        {process.env.NODE_ENV === 'development' && (
                          <>
                            <p className="text-xs text-gray-400 mt-1 break-all">
                              Current avatar: {settings.avatar || 'none'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1 break-all">
                              Auth context avatar: {state.user?.avatar || 'none'}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Username */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={settings.username}
                        onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={settings.email}
                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={settings.bio}
                        onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                        rows={4}
                        placeholder="Tell others about yourself and your artistic journey..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                        maxLength={500}
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {settings.bio.length}/500 characters
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-6">
                    {Object.entries(settings.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <label className="font-medium text-gray-900 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </label>
                          <p className="text-sm text-gray-500">
                            {key === 'emailNotifications' && 'Receive email notifications for important updates'}
                            {key === 'canvasComments' && 'Get notified when someone comments on your canvases'}
                            {key === 'collaborationInvites' && 'Receive notifications for collaboration invitations'}
                            {key === 'weeklyDigest' && 'Get a weekly summary of your activity and community highlights'}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setSettings({
                              ...settings,
                              notifications: {
                                ...settings.notifications,
                                [key]: e.target.checked
                              }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacy Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Profile Visibility
                      </label>
                      <div className="space-y-3">
                        <div
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                            settings.privacy.profileVisibility === 'public'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSettings({
                            ...settings,
                            privacy: { ...settings.privacy, profileVisibility: 'public' }
                          })}
                        >
                          <div className="flex items-center space-x-3">
                            <Globe className="w-6 h-6 text-gray-600" />
                            <div>
                              <div className="font-medium text-gray-900">Public Profile</div>
                              <div className="text-sm text-gray-500">
                                Anyone can view your profile and public canvases
                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                            settings.privacy.profileVisibility === 'private'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSettings({
                            ...settings,
                            privacy: { ...settings.privacy, profileVisibility: 'private' }
                          })}
                        >
                          <div className="flex items-center space-x-3">
                            <Lock className="w-6 h-6 text-gray-600" />
                            <div>
                              <div className="font-medium text-gray-900">Private Profile</div>
                              <div className="text-sm text-gray-500">
                                Only you can view your profile details
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium text-gray-900">Show Canvas Count</label>
                        <p className="text-sm text-gray-500">
                          Display the number of canvases you've created on your profile
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.privacy.showCanvasCount}
                          onChange={(e) => setSettings({
                            ...settings,
                            privacy: { ...settings.privacy, showCanvasCount: e.target.checked }
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium text-gray-900">Show Collaborations</label>
                        <p className="text-sm text-gray-500">
                          Display canvases you've collaborated on in your profile
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.privacy.showCollaborations}
                          onChange={(e) => setSettings({
                            ...settings,
                            privacy: { ...settings.privacy, showCollaborations: e.target.checked }
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">App Preferences</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Canvas Size
                      </label>
                      <select
                        value={settings.preferences.defaultCanvasSize}
                        onChange={(e) => setSettings({
                          ...settings,
                          preferences: { ...settings.preferences, defaultCanvasSize: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="600x400">Small (600 × 400)</option>
                        <option value="800x600">Medium (800 × 600)</option>
                        <option value="1200x800">Large (1200 × 800)</option>
                        <option value="1920x1080">Widescreen (1920 × 1080)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Auto-save Interval (seconds)
                      </label>
                      <select
                        value={settings.preferences.autoSaveInterval}
                        onChange={(e) => setSettings({
                          ...settings,
                          preferences: { ...settings.preferences, autoSaveInterval: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value={15}>Every 15 seconds</option>
                        <option value={30}>Every 30 seconds</option>
                        <option value={60}>Every minute</option>
                        <option value={300}>Every 5 minutes</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Theme
                      </label>
                      <select
                        value={theme}
                        onChange={(e) => {
                          const newTheme = e.target.value as 'light' | 'dark' | 'auto';
                          setTheme(newTheme);
                          // Also update the settings state for consistency
                          setSettings({
                            ...settings,
                            preferences: { ...settings.preferences, theme: newTheme }
                          });
                        }}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto (System)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900">Password</h3>
                          <p className="text-sm text-gray-500">
                            Last changed: Never (using default password)
                          </p>
                        </div>
                        <button
                          onClick={() => setShowPasswordForm(!showPasswordForm)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Change Password
                        </button>
                      </div>

                      {showPasswordForm && (
                        <div className="space-y-4 pt-4 border-t border-gray-200">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Current Password
                            </label>
                            <div className="relative">
                              <input
                                type={passwordForm.showPasswords ? 'text' : 'password'}
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({
                                  ...passwordForm,
                                  currentPassword: e.target.value
                                })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none pr-12"
                              />
                              <button
                                onClick={() => setPasswordForm({
                                  ...passwordForm,
                                  showPasswords: !passwordForm.showPasswords
                                })}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {passwordForm.showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              New Password
                            </label>
                            <input
                              type={passwordForm.showPasswords ? 'text' : 'password'}
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({
                                ...passwordForm,
                                newPassword: e.target.value
                              })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Confirm New Password
                            </label>
                            <input
                              type={passwordForm.showPasswords ? 'text' : 'password'}
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({
                                ...passwordForm,
                                confirmPassword: e.target.value
                              })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                          </div>

                          <div className="flex space-x-3">
                            <button
                              onClick={handlePasswordChange}
                              disabled={saving}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {saving ? 'Changing...' : 'Change Password'}
                            </button>
                            <button
                              onClick={() => setShowPasswordForm(false)}
                              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Delete Account */}
                    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex items-start space-x-3">
                        <Trash2 className="w-6 h-6 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-medium text-red-900">Delete Account</h3>
                          <p className="text-sm text-red-700 mt-1">
                            Permanently delete your account and all associated data. This action cannot be undone.
                          </p>
                          <button
                            onClick={handleDeleteAccount}
                            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              {activeTab !== 'security' && (
                <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveSettings}
                      disabled={saving}
                      className="flex items-center space-x-2 bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
