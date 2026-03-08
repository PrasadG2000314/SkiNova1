'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BannerPost {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  link?: string;
  isActive: boolean;
  textColor?: string;
  backgroundColor?: string;
  fontSize?: 'small' | 'medium' | 'large';
  textStyle?: 'normal' | 'italic' | 'bold';
  alignment?: 'left' | 'center' | 'right';
  overlayOpacity?: number;
  createdAt: string;
}

export default function AdminBannerPage() {
  const router = useRouter();
  const [banners, setBanners] = useState<BannerPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    link: '',
    textColor: '#FFFFFF',
    backgroundColor: '#000000',
    fontSize: 'medium' as 'small' | 'medium' | 'large',
    textStyle: 'normal' as 'normal' | 'italic' | 'bold',
    alignment: 'left' as 'left' | 'center' | 'right',
    overlayOpacity: 0.4,
  });

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to access this page');
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch all banners
  const fetchBanners = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/banners/all-admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setBanners(data.data);
      } else {
        setError('Failed to fetch banners: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching banners';
      setError(errorMessage);
      console.error('Full error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to access this page');
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
      fetchBanners();
    }
  }, []);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await fetch(`${apiUrl}/api/banners/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formDataUpload,
      });

      const data = await response.json();

      if (data.success) {
        setFormData({ ...formData, imageUrl: data.url });
      } else {
        setError(data.message || 'Failed to upload file');
      }
    } catch (err) {
      setError('Error uploading file');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    setLoading(true);

    try {
      const url = editingId
        ? `${apiUrl}/api/banners/${editingId}`
        : `${apiUrl}/api/banners/create`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setFormData({
          title: '',
          description: '',
          imageUrl: '',
          link: '',
          textColor: '#FFFFFF',
          backgroundColor: '#000000',
          fontSize: 'medium',
          textStyle: 'normal',
          alignment: 'left',
          overlayOpacity: 0.4,
        });
        setEditingId(null);
        setShowForm(false);
        fetchBanners();
      } else {
        setError(data.message || 'Failed to save banner');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error saving banner';
      setError(errorMessage);
      console.error('Full error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/banners/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        fetchBanners();
      } else {
        setError(data.message || 'Failed to delete banner');
      }
    } catch (err) {
      setError('Error deleting banner');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle active status
  const handleToggle = async (id: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/banners/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        fetchBanners();
      } else {
        setError(data.message || 'Failed to toggle banner status');
      }
    } catch (err) {
      setError('Error toggling banner status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (banner: BannerPost) => {
    setFormData({
      title: banner.title,
      description: banner.description,
      imageUrl: banner.imageUrl,
      link: banner.link || '',
      textColor: banner.textColor || '#FFFFFF',
      backgroundColor: banner.backgroundColor || '#000000',
      fontSize: banner.fontSize || 'medium',
      textStyle: banner.textStyle || 'normal',
      alignment: banner.alignment || 'left',
      overlayOpacity: banner.overlayOpacity ?? 0.4,
    });
    setEditingId(banner._id);
    setShowForm(true);
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      link: '',
      textColor: '#FFFFFF',
      backgroundColor: '#000000',
      fontSize: 'medium',
      textStyle: 'normal',
      alignment: 'left',
      overlayOpacity: 0.4,
    });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin/dashboard">
              <button className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2">
                ← Back to Dashboard
              </button>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">🎨 Banner Management</h1>
            <p className="text-gray-600 mt-2">Create, edit, customize and manage homepage banners with advanced styling</p>
          </div>
        </div>

        {/* Authentication Required Message */}
        {!isAuthenticated && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-6 rounded-lg mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold mb-2">Authentication Required</h3>
                <p>You need to be logged in to access this page. Please log in to continue.</p>
              </div>
              <Link href="/login">
                <button className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all">
                  Go to Login
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Show content only if authenticated */}
        {!isAuthenticated ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <p className="text-5xl mb-4">🔒</p>
            <p className="text-gray-600 mb-4 text-lg font-medium">Access Denied</p>
            <p className="text-gray-500 mb-6">Please log in to manage banners</p>
            <Link href="/login">
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                Login Here
              </button>
            </Link>
          </div>
        ) : (
          <>
        {/* Error Message */}
        {error && error !== 'Please log in to access this page' && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-700 font-bold">×</button>
          </div>
        )}

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {editingId ? '✎ Edit Banner' : '➕ Create New Banner'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Banner title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Link (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.link}
                      onChange={(e) =>
                        setFormData({ ...formData, link: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="/path or https://..."
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Banner description"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📸 Media</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Upload Image/Video
                    </label>
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                        id="file-upload"
                        title="Upload an image or video file"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="text-4xl mb-2">📁</div>
                        <p className="text-gray-600 font-medium">
                          {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF, MP4, WebM (max 50MB)</p>
                      </label>
                    </div>
                  </div>

                  {formData.imageUrl && (
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-3 font-medium">Media Preview:</p>
                      {formData.imageUrl.includes('.mp4') || formData.imageUrl.includes('video') ? (
                        <video src={`http://localhost:4000${formData.imageUrl}`} className="w-full h-48 object-cover rounded-lg" controls />
                      ) : (
                        <img
                          src={`http://localhost:4000${formData.imageUrl}`}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                          onError={(e) => {
                            console.log('Image failed to load:', formData.imageUrl)
                            e.currentTarget.src = '/images/placeholder.png'
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Styling Options */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">🎨 Text Styling</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Text Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.textColor}
                        onChange={(e) =>
                          setFormData({ ...formData, textColor: e.target.value })
                        }
                        className="h-12 w-20 rounded-lg cursor-pointer border border-gray-300"
                        title="Select text color"
                      />
                      <input
                        type="text"
                        value={formData.textColor}
                        onChange={(e) =>
                          setFormData({ ...formData, textColor: e.target.value })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="#FFFFFF"
                        title="Enter text color hex code"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Font Size
                    </label>
                    <select
                      value={formData.fontSize}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fontSize: e.target.value as 'small' | 'medium' | 'large',
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      title="Select font size"
                    >
                      <option value="small">Small (24px)</option>
                      <option value="medium">Medium (32px)</option>
                      <option value="large">Large (40px)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Text Style
                    </label>
                    <select
                      value={formData.textStyle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          textStyle: e.target.value as 'normal' | 'italic' | 'bold',
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      title="Select text style"
                    >
                      <option value="normal">Normal</option>
                      <option value="italic">Italic</option>
                      <option value="bold">Bold</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Text Alignment
                    </label>
                    <select
                      value={formData.alignment}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          alignment: e.target.value as 'left' | 'center' | 'right',
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      title="Select text alignment"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Overlay Opacity
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={formData.overlayOpacity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            overlayOpacity: parseFloat(e.target.value),
                          })
                        }
                        className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                        title="Adjust overlay opacity (0-100%)"
                        aria-label="Overlay opacity slider"
                      />
                      <span className="text-sm font-semibold text-gray-700 w-12">
                        {Math.round(formData.overlayOpacity * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">👁️ Preview</h3>
                <div
                  className="relative w-full h-48 rounded-lg overflow-hidden"
                  style={{
                    backgroundImage: `url(${formData.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: `rgba(0, 0, 0, ${formData.overlayOpacity})`,
                    }}
                  />
                  <div
                    className="absolute inset-0 flex items-center p-6"
                    style={{
                      textAlign: formData.alignment as any,
                      justifyContent:
                        formData.alignment === 'center'
                          ? 'center'
                          : formData.alignment === 'right'
                            ? 'flex-end'
                            : 'flex-start',
                    }}
                  >
                    <div>
                      <h2
                        className="font-semibold"
                        style={{
                          color: formData.textColor,
                          fontSize: formData.fontSize === 'small' ? '1.5rem' : formData.fontSize === 'large' ? '2.5rem' : '2rem',
                          fontStyle: formData.textStyle === 'italic' ? 'italic' : 'normal',
                          fontWeight: formData.textStyle === 'bold' ? 'bold' : 'normal',
                        }}
                      >
                        {formData.title || 'Banner Title'}
                      </h2>
                      <p
                        style={{
                          color: formData.textColor,
                          fontSize: formData.fontSize === 'small' ? '0.75rem' : formData.fontSize === 'large' ? '1.25rem' : '1rem',
                        }}
                      >
                        {formData.description || 'Banner Description'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingId ? '💾 Update Banner' : '➕ Create Banner'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-500 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Create Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 mb-8 inline-flex items-center gap-2"
          >
            ➕ Create New Banner
          </button>
        )}

        {/* Banners Grid */}
        {loading && !showForm ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading banners...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner) => (
              <div
                key={banner._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Banner Preview */}
                <div className="relative h-40 overflow-hidden bg-gray-200">
                  {banner.imageUrl.includes('.mp4') || banner.imageUrl.includes('video') ? (
                    <video src={banner.imageUrl} className="w-full h-full object-cover" />
                  ) : (
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                      onError={() => console.log('Image failed to load')}
                    />
                  )}
                  <div
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
                      banner.isActive
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-400 text-white'
                    }`}
                  >
                    {banner.isActive ? '✓ Active' : '✗ Inactive'}
                  </div>
                </div>

                {/* Banner Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {banner.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
                    {banner.description}
                  </p>
                  
                  {/* Style Tags */}
                  <div className="mb-3 flex flex-wrap gap-1">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {banner.fontSize || 'medium'} text
                    </span>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {banner.alignment || 'left'} align
                    </span>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                      {banner.textStyle || 'normal'}
                    </span>
                  </div>

                  {banner.link && (
                    <p className="text-xs text-blue-600 mb-3 truncate">
                      🔗 {banner.link}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm"
                    >
                      ✎ Edit
                    </button>
                    <button
                      onClick={() => handleToggle(banner._id)}
                      className={`flex-1 ${
                        banner.isActive
                          ? 'bg-yellow-500 hover:bg-yellow-600'
                          : 'bg-orange-500 hover:bg-orange-600'
                      } text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm`}
                    >
                      {banner.isActive ? '⏸ Pause' : '▶ Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && banners.length === 0 && !showForm && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <p className="text-5xl mb-4">🎨</p>
            <p className="text-gray-600 mb-4 text-lg font-medium">No banners yet</p>
            <p className="text-gray-500 mb-6">Create your first banner to get started!</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              ➕ Create First Banner
            </button>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}
