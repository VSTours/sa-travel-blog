import React, { useState, useEffect } from 'react';
import { Zap, Database, Eye, Plus, Settings, BarChart3, Mail, RefreshCw, Send, Download } from 'lucide-react';

interface BlogPost {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  destination: string;
  ai_provider: string;
  published: boolean;
  created_at?: string;
}

interface ContentRequest {
  destination: string;
  content_type: string;
  ai_provider: string;
  affiliate_preferences: {
    booking_com: boolean;
    getyourguide: boolean;
    viator: boolean;
  };
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('generate');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  
  // Form state for content generation
  const [contentRequest, setContentRequest] = useState<ContentRequest>({
    destination: '',
    content_type: 'travel-guide',
    ai_provider: 'gemini',
    affiliate_preferences: {
      booking_com: true,
      getyourguide: true,
      viator: true
    }
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zlilxsonhjwzxdtoxdxi.supabase.co/functions/v1';

  useEffect(() => {
    fetchAvailableProviders();
    fetchBlogPosts();
  }, []);

  const fetchAvailableProviders = async () => {
    try {
      const response = await fetch(`${API_URL}/ai-providers`);
      const data = await response.json();
      if (data.providers) {
        setAvailableProviders(data.providers);
        if (data.providers.length > 0) {
          setContentRequest(prev => ({ ...prev, ai_provider: data.providers[0] }));
        }
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const fetchBlogPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/blog-posts`);
      const data = await response.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const generateContent = async () => {
    if (!contentRequest.destination.trim()) {
      alert('Please enter a destination');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/generate-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contentRequest)
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Content generated successfully!');
        fetchBlogPosts(); // Refresh the posts list
        setContentRequest(prev => ({ ...prev, destination: '' })); // Clear form
      } else {
        alert(`Error: ${data.error || 'Failed to generate content'}`);
      }
    } catch (error) {
      alert('Error generating content. Please try again.');
      console.error('Generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ContentRequest, value: any) => {
    setContentRequest(prev => ({ ...prev, [field]: value }));
  };

  const handleAffiliateChange = (affiliate: keyof ContentRequest['affiliate_preferences'], checked: boolean) => {
    setContentRequest(prev => ({
      ...prev,
      affiliate_preferences: {
        ...prev.affiliate_preferences,
        [affiliate]: checked
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Travel Blog Admin</h1>
              <p className="text-sm text-gray-600">AI-Powered Content Generation Platform</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Supabase Connected</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Zap className="w-4 h-4" />
                <span>{availableProviders.length} AI Provider{availableProviders.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'generate', label: 'Generate Content', icon: Plus },
              { id: 'posts', label: 'Blog Posts', icon: Eye },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Content Generation Form */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Generate Travel Content</h2>
              
              <div className="space-y-4">
                {/* Destination */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination *
                  </label>
                  <input
                    type="text"
                    value={contentRequest.destination}
                    onChange={(e) => handleInputChange('destination', e.target.value)}
                    placeholder="e.g., Cape Town, Tokyo, Paris"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Content Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Type
                  </label>
                  <select
                    value={contentRequest.content_type}
                    onChange={(e) => handleInputChange('content_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="travel-guide">Travel Guide</option>
                    <option value="itinerary">Itinerary</option>
                    <option value="attractions">Top Attractions</option>
                    <option value="food-guide">Food Guide</option>
                    <option value="budget-tips">Budget Tips</option>
                    <option value="luxury-travel">Luxury Travel</option>
                  </select>
                </div>

                {/* AI Provider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Provider
                  </label>
                  <select
                    value={contentRequest.ai_provider}
                    onChange={(e) => handleInputChange('ai_provider', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {availableProviders.map(provider => (
                      <option key={provider} value={provider}>
                        {provider.charAt(0).toUpperCase() + provider.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Affiliate Preferences */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Affiliate Networks
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={contentRequest.affiliate_preferences.booking_com}
                        onChange={(e) => handleAffiliateChange('booking_com', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Booking.com</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={contentRequest.affiliate_preferences.getyourguide}
                        onChange={(e) => handleAffiliateChange('getyourguide', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">GetYourGuide</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={contentRequest.affiliate_preferences.viator}
                        onChange={(e) => handleAffiliateChange('viator', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Viator</span>
                    </label>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateContent}
                  disabled={loading || !contentRequest.destination.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Generate Content
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{posts.length}</div>
                    <div className="text-sm text-gray-600">Total Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{posts.filter(p => p.published).length}</div>
                    <div className="text-sm text-gray-600">Published</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{availableProviders.length}</div>
                    <div className="text-sm text-gray-600">AI Providers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">3</div>
                    <div className="text-sm text-gray-600">Affiliates</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">System Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database Connection</span>
                    <span className="flex items-center gap-2 text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Connected
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">AI API Status</span>
                    <span className="flex items-center gap-2 text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Edge Functions</span>
                    <span className="flex items-center gap-2 text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Deployed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Blog Posts</h2>
                <button
                  onClick={fetchBlogPosts}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">AI Provider</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {posts.length > 0 ? posts.map((post, index) => (
                    <tr key={post.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{post.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{post.excerpt}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{post.destination}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">{post.ai_provider}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          post.published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        No blog posts yet. Generate your first piece of content!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Content Performance</h3>
              <p className="text-gray-500">Analytics will be available once you have published posts and traffic data.</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Affiliate Revenue</h3>
              <p className="text-gray-500">Revenue tracking will activate once affiliate links are clicked.</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Settings</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Available AI Providers</h3>
                <div className="space-y-2">
                  {availableProviders.map(provider => (
                    <div key={provider} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="capitalize">{provider}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">API Endpoints</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-mono">{API_URL}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}