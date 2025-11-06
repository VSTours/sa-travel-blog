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
    content_type: 'luxury-travel-guide',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
      {/* Luxury Header */}
      <div className="bg-gradient-to-r from-slate-900 via-gray-900 to-zinc-900 shadow-2xl border-b border-amber-200/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div>
              <h1 className="text-3xl font-light text-white tracking-wide">
                <span className="font-thin">LUXURY</span> 
                <span className="font-normal text-amber-300 ml-2">TRAVEL</span>
                <span className="font-thin ml-2">STUDIO</span>
              </h1>
              <p className="text-sm text-slate-300 mt-2 font-light tracking-wide">
                Premium AI Content Management • Curated Excellence
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="font-light">Database Connected</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="font-light">{availableProviders.length} AI Engine{availableProviders.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                <Settings className="w-5 h-5 text-slate-900" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Navigation Tabs */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1">
            {[
              { id: 'generate', label: 'Create Content', icon: Plus, desc: 'AI Generation' },
              { id: 'posts', label: 'Portfolio', icon: Eye, desc: 'Published Works' },
              { id: 'analytics', label: 'Insights', icon: BarChart3, desc: 'Performance' },
              { id: 'settings', label: 'Configuration', icon: Settings, desc: 'System Setup' }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group flex flex-col items-center gap-1 py-4 px-6 relative transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-b from-slate-50 to-white border-b-2 border-amber-400 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-colors ${activeTab === tab.id ? 'text-amber-500' : 'text-slate-500 group-hover:text-slate-700'}`} />
                  <span className="text-sm font-medium tracking-wide">{tab.label}</span>
                  <span className="text-xs text-slate-400 font-light">{tab.desc}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Premium Content Generation Form */}
            <div className="bg-gradient-to-br from-white via-slate-50 to-white rounded-2xl shadow-2xl border border-slate-200/50 p-8 backdrop-blur-sm">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-light text-slate-900 tracking-wide">
                  Create <span className="text-amber-600 font-normal">Luxury</span> Content
                </h2>
                <p className="text-slate-600 mt-2 text-sm font-light">Craft exceptional travel narratives</p>
              </div>
              
              <div className="space-y-6">
                {/* Destination */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-800 tracking-wide uppercase text-xs">
                    Destination *
                  </label>
                  <input
                    type="text"
                    value={contentRequest.destination}
                    onChange={(e) => handleInputChange('destination', e.target.value)}
                    placeholder="Santorini, Maldives, Swiss Alps..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm text-slate-900 placeholder-slate-400"
                  />
                </div>

                {/* Content Type */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-800 tracking-wide uppercase text-xs">
                    Content Category
                  </label>
                  <select
                    value={contentRequest.content_type}
                    onChange={(e) => handleInputChange('content_type', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm text-slate-900"
                  >
                    <option value="luxury-travel-guide">Luxury Travel Guide</option>
                    <option value="exclusive-itinerary">Exclusive Itinerary</option>
                    <option value="premium-attractions">Premium Attractions</option>
                    <option value="fine-dining-guide">Fine Dining Guide</option>
                    <option value="luxury-accommodations">Luxury Accommodations</option>
                    <option value="vip-experiences">VIP Experiences</option>
                    <option value="private-tours">Private Tours & Experiences</option>
                    <option value="wellness-retreats">Wellness & Spa Retreats</option>
                  </select>
                </div>

                {/* AI Provider */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-800 tracking-wide uppercase text-xs">
                    AI Engine
                  </label>
                  <select
                    value={contentRequest.ai_provider}
                    onChange={(e) => handleInputChange('ai_provider', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm text-slate-900"
                  >
                    {availableProviders.map(provider => (
                      <option key={provider} value={provider}>
                        {provider === 'gemini' ? 'Gemini Pro • Advanced' : 
                         provider === 'anthropic' ? 'Claude Sonnet • Creative' : 
                         provider === 'openai' ? 'GPT-4 Turbo • Premium' : 
                         provider.charAt(0).toUpperCase() + provider.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Premium Affiliate Networks */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-800 tracking-wide uppercase text-xs">
                    Premium Partners
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 cursor-pointer hover:from-blue-100 hover:to-blue-200 transition-all duration-300">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={contentRequest.affiliate_preferences.booking_com}
                          onChange={(e) => handleAffiliateChange('booking_com', e.target.checked)}
                          className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                        />
                        <span className="ml-3 text-sm font-medium text-slate-800">Booking.com</span>
                      </div>
                      <span className="text-xs text-slate-600 font-light">Luxury Hotels</span>
                    </label>
                    <label className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 cursor-pointer hover:from-green-100 hover:to-green-200 transition-all duration-300">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={contentRequest.affiliate_preferences.getyourguide}
                          onChange={(e) => handleAffiliateChange('getyourguide', e.target.checked)}
                          className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                        />
                        <span className="ml-3 text-sm font-medium text-slate-800">GetYourGuide</span>
                      </div>
                      <span className="text-xs text-slate-600 font-light">Premium Tours</span>
                    </label>
                    <label className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200 cursor-pointer hover:from-purple-100 hover:to-purple-200 transition-all duration-300">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={contentRequest.affiliate_preferences.viator}
                          onChange={(e) => handleAffiliateChange('viator', e.target.checked)}
                          className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                        />
                        <span className="ml-3 text-sm font-medium text-slate-800">Viator</span>
                      </div>
                      <span className="text-xs text-slate-600 font-light">Exclusive Experiences</span>
                    </label>
                  </div>
                </div>

                {/* Premium Generate Button */}
                <button
                  onClick={generateContent}
                  disabled={loading || !contentRequest.destination.trim()}
                  className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-700 hover:via-amber-600 hover:to-amber-700 disabled:from-slate-400 disabled:via-slate-400 disabled:to-slate-400 text-white font-medium py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span className="tracking-wide">Creating Premium Content...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span className="tracking-wide">Generate Luxury Content</span>
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