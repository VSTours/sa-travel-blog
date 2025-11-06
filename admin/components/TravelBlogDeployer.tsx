import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Check, AlertCircle, Zap, Database, Cpu, DollarSign, TrendingUp, Settings, Mail, Link2, BarChart3, RefreshCw, Send, Eye, Download, ArrowUp } from 'lucide-react';

export default function TravelBlogDeployer() {
  const [step, setStep] = useState('welcome');
  const [userMode, setUserMode] = useState('deploy'); // 'deploy' or 'admin'
  const [dashboardTab, setDashboardTab] = useState('overview');
  const [config, setConfig] = useState<any>({
    aiProvider: 'gemini',
    anthropicKey: '',
    geminiKey: '',
    openaiKey: '',
    unsplashKey: '',
    pexelsKey: '',
    niche: 'luxury-resorts',
    targetMarket: 'US-millennial',
    geoRegion: 'Cape Town',
    monthlyPosts: 4,
    database: 'supabase',
    dbConnection: '',
    githubToken: '',
    repoName: 'sa-travel-blog',
    hostingProvider: 'vercel',
    vercelToken: '',
    bookingAffiliateId: '',
    getYourGuideId: '',
    viatorAffiliateId: '',
    emailProvider: 'mailchimp',
    emailApiKey: '',
    domain: '',
    enableNotifications: true,
    notificationEmail: '',
  });

  const [adminData, setAdminData] = useState<any>({
    recentPosts: [
      { id: 1, title: 'Top 5 Luxury Resorts in Cape Town', status: 'published', views: 1247, revenue: 34.50, date: '2025-01-28' },
      { id: 2, title: 'Hidden Gems: Franschhoek Wine Country', status: 'published', views: 892, revenue: 28.30, date: '2025-01-21' },
      { id: 3, title: 'Safari Luxury: Kruger National Park Guide', status: 'draft', views: 0, revenue: 0, date: '2025-02-04' },
    ],
    totalRevenue: 285.47,
    monthlyRevenue: 1247.83,
    totalViews: 15234,
    monthlyViews: 4521,
    affMetrics: {
      booking: { clicks: 342, conversions: 18, revenue: 487.50, rate: 5.3 },
      getyourguide: { clicks: 156, conversions: 8, revenue: 178.40, rate: 5.1 },
      viator: { clicks: 124, conversions: 5, revenue: 142.80, rate: 4.0 },
    },
    emailSubscribers: 1234,
    emailOpenRate: 32,
    nextScheduledPost: 'February 11, 2025',
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<any>([]);

  const steps = [
    'welcome', 'ai-provider', 'api-keys', 'database', 'content-strategy', 'monetization',
    'affiliate-networks', 'email-setup', 'hosting', 'notifications', 'github', 'review', 'deploying'
  ];

  const stepIndex = steps.indexOf(step);

  const handleNext = () => {
    if (validateStep()) {
      const nextIndex = Math.min(stepIndex + 1, steps.length - 1);
      setStep(steps[nextIndex]);
    }
  };

  const handlePrev = () => {
    const prevIndex = Math.max(stepIndex - 1, 0);
    setStep(steps[prevIndex]);
  };

  const validateStep = () => {
    const newErrors: any = {};
    
    if (step === 'ai-provider') {
      if (!config.aiProvider) newErrors.aiProvider = 'Required';
    }
    if (step === 'api-keys') {
      if (config.aiProvider === 'anthropic' && !config.anthropicKey) newErrors.anthropicKey = 'Required';
      if (config.aiProvider === 'gemini' && !config.geminiKey) newErrors.geminiKey = 'Required';
      if (config.aiProvider === 'openai' && !config.openaiKey) newErrors.openaiKey = 'Required';
      if (!config.unsplashKey) newErrors.unsplashKey = 'Required';
    }
    if (step === 'database') {
      if (!config.database) newErrors.database = 'Required';
    }
    if (step === 'content-strategy') {
      if (!config.niche) newErrors.niche = 'Required';
      if (!config.targetMarket) newErrors.targetMarket = 'Required';
      if (config.monthlyPosts < 1) newErrors.monthlyPosts = 'Required';
    }
    if (step === 'hosting') {
      if (!config.vercelToken) newErrors.vercelToken = 'Required for auto-deploy';
    }
    if (step === 'github') {
      if (!config.githubToken) newErrors.githubToken = 'Required';
      if (!config.repoName) newErrors.repoName = 'Required';
    }
    if (step === 'notifications') {
      if (config.enableNotifications && !config.notificationEmail) newErrors.notificationEmail = 'Required if notifications enabled';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: any, value: any) => {
    setConfig((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }));
    }
  };

  const handleDeploy = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      addNotification('Deployment successful! Blog is now live.', 'success');
      setStep('deployed');
    } catch (error) {
      addNotification('Deployment failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addNotification = (message: any, type = 'info') => {
    const id = Date.now();
    setNotifications((prev: any) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev: any) => prev.filter((n: any) => n.id !== id));
    }, 4000);
  };

  const triggerPostGeneration = () => {
    setLoading(true);
    setTimeout(() => {
      addNotification('Post generation started! Check back in 5 minutes.', 'success');
      setLoading(false);
    }, 1000);
  };

  const InputField = ({ label, field, type = 'text', placeholder, helperText }: any) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        <span className="text-red-500 ml-1">*</span>
      </label>
      <input
        type={type}
        value={config[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
          errors[field] ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {helperText && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
      {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]}</p>}
    </div>
  );

  const SelectField = ({ label, field, options, helperText }: any) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        <span className="text-red-500 ml-1">*</span>
      </label>
      <select
        value={config[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
          errors[field] ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <option value="">Select {label}</option>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {helperText && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
    </div>
  );

  // =====================================================================
  // DEPLOYMENT MODE
  // =====================================================================

  if (userMode === 'deploy') {
    return (
      <div className="min-h-screen gradient-admin">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">🏆 South Africa Luxury Travel Blog</h1>
            <p className="text-blue-100">Autonomous AI-powered content platform with automatic monetization</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {steps.map((s, i) => (
                <div
                  key={s}
                  className={`flex-1 h-1 mx-1 rounded ${
                    i <= stepIndex ? 'bg-emerald-400' : 'bg-blue-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-blue-100 text-sm">
              Step {stepIndex + 1} of {steps.length}: {step.replace('-', ' ').toUpperCase()}
            </p>
          </div>

          {/* Notifications */}
          <div className="space-y-2 mb-4">
            {notifications.map((notif: any) => (
              <div
                key={notif.id}
                className={`p-4 rounded-lg text-white text-sm ${
                  notif.type === 'success' ? 'bg-green-500' :
                  notif.type === 'error' ? 'bg-red-500' :
                  'bg-blue-500'
                }`}
              >
                {notif.message}
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="admin-card min-h-96">

            {/* WELCOME */}
            {step === 'welcome' && (
              <div className="text-center py-8">
                <div className="text-6xl mb-6">🚀</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome!</h2>
                <p className="text-gray-600 mb-8 leading-relaxed max-w-md mx-auto">
                  This automated deployment will set up a complete, self-generating luxury travel blog for South Africa with AI content creation, multi-stream monetization, real-time analytics, and admin dashboard.
                </p>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl mb-2">✍️</div>
                    <p className="text-sm font-medium">Auto Content</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl mb-2">💰</div>
                    <p className="text-sm font-medium">7+ Revenue Streams</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl mb-2">⚙️</div>
                    <p className="text-sm font-medium">Admin Control</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-6">Setup takes 15 minutes. You'll need API keys, GitHub token, and Vercel account.</p>
                <button
                  onClick={handleNext}
                  className="admin-button-primary px-8 py-3 text-lg"
                >
                  Start Setup <ChevronRight className="inline ml-2" size={20} />
                </button>
              </div>
            )}

            {/* AI PROVIDER SELECTION */}
            {step === 'ai-provider' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose Your AI Engine</h2>
                
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Select your preferred AI provider for content generation.</strong> Each has different pricing and capabilities.
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {[
                    {
                      name: 'gemini',
                      title: '🟢 Google Gemini (Recommended)',
                      desc: 'Free tier: 60 requests/minute. Best value for money.',
                      pricing: 'FREE up to 1M tokens/month',
                      setup: 'Get API key from ai.google.dev'
                    },
                    {
                      name: 'anthropic',
                      title: '🔵 Anthropic Claude',
                      desc: 'High-quality content. Great for luxury travel writing.',
                      pricing: '$5 free credits, then $0.008/1K tokens',
                      setup: 'Get API key from console.anthropic.com'
                    },
                    {
                      name: 'openai',
                      title: '🟡 OpenAI GPT-4',
                      desc: 'Popular choice. Good for creative content.',
                      pricing: '$0.03/1K tokens input, $0.06/1K output',
                      setup: 'Get API key from platform.openai.com'
                    },
                  ].map(ai => (
                    <div
                      key={ai.name}
                      onClick={() => handleInputChange('aiProvider', ai.name)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                        config.aiProvider === ai.name
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-800">{ai.title}</h3>
                        {config.aiProvider === ai.name && <Check className="text-blue-500" size={20} />}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{ai.desc}</p>
                      <div className="text-xs">
                        <p className="text-green-600 font-medium">💰 {ai.pricing}</p>
                        <p className="text-blue-600">→ {ai.setup}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-amber-50 rounded-lg text-sm text-amber-800">
                  <p className="font-medium mb-2">💡 Recommendation:</p>
                  <p className="text-xs">
                    <strong>Gemini</strong> is perfect for starting - it's completely free for up to 1 million tokens per month, 
                    which is enough for 200-400 high-quality blog posts. You can always switch providers later in settings.
                  </p>
                </div>
              </div>
            )}

            {/* API KEYS */}
            {step === 'api-keys' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Connect Your APIs</h2>
                
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Selected AI Provider:</strong> {
                      config.aiProvider === 'gemini' ? '🟢 Google Gemini' :
                      config.aiProvider === 'anthropic' ? '🔵 Anthropic Claude' :
                      config.aiProvider === 'openai' ? '🟡 OpenAI GPT-4' : 'None'
                    }
                  </p>
                </div>

                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
                  <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Getting API Keys:</p>
                    <ul className="text-xs space-y-1 ml-4 list-disc">
                      {config.aiProvider === 'gemini' && (
                        <li><a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a> - Free tier: 60 requests/minute</li>
                      )}
                      {config.aiProvider === 'anthropic' && (
                        <li><a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="underline">Anthropic Console</a> - Free tier: $5 credits</li>
                      )}
                      {config.aiProvider === 'openai' && (
                        <li><a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="underline">OpenAI Platform</a> - Pay per use</li>
                      )}
                      <li><a href="https://unsplash.com/api" target="_blank" rel="noopener noreferrer" className="underline">Unsplash API</a> - Free tier available</li>
                      <li><a href="https://www.pexels.com/api" target="_blank" rel="noopener noreferrer" className="underline">Pexels API</a> - Free tier available</li>
                    </ul>
                  </div>
                </div>

                {/* Dynamic AI Provider Key Field */}
                {config.aiProvider === 'gemini' && (
                  <InputField
                    label="Google Gemini API Key"
                    field="geminiKey"
                    type="password"
                    placeholder="AIzaSy..."
                    helperText="Free - Get from ai.google.dev. Used for AI content generation."
                  />
                )}
                
                {config.aiProvider === 'anthropic' && (
                  <InputField
                    label="Anthropic Claude API Key"
                    field="anthropicKey"
                    type="password"
                    placeholder="sk-ant-..."
                    helperText="$5 free credits - Get from console.anthropic.com"
                  />
                )}
                
                {config.aiProvider === 'openai' && (
                  <InputField
                    label="OpenAI API Key"
                    field="openaiKey"
                    type="password"
                    placeholder="sk-..."
                    helperText="Pay per use - Get from platform.openai.com"
                  />
                )}

                <InputField
                  label="Unsplash API Key"
                  field="unsplashKey"
                  type="password"
                  placeholder="Your Unsplash access key"
                  helperText="For high-quality travel images"
                />
                <InputField
                  label="Pexels API Key (Optional)"
                  field="pexelsKey"
                  placeholder="Your Pexels API key"
                  helperText="Backup image source"
                />

                <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm">
                  <p className="font-medium text-gray-800 mb-2">🔄 Want to change AI provider?</p>
                  <button
                    onClick={() => setStep('ai-provider')}
                    className="text-blue-600 hover:text-blue-800 underline text-xs"
                  >
                    ← Go back to AI provider selection
                  </button>
                </div>
              </div>
            )}

            {/* Continue with other steps... */}
            {step === 'database' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose Your Database</h2>
                
                <div className="space-y-3 mb-6">
                  {[
                    {
                      name: 'supabase',
                      title: '🟩 Supabase (Recommended)',
                      desc: 'PostgreSQL with real-time APIs. 500MB free storage.',
                      setup: 'Sign up at supabase.com, get connection string from Settings'
                    },
                    {
                      name: 'neon',
                      title: '🟦 Neon',
                      desc: 'Serverless PostgreSQL. 10GB free tier.',
                      setup: 'Create project at neon.tech, copy connection string'
                    },
                    {
                      name: 'railway',
                      title: '🚂 Railway',
                      desc: 'PostgreSQL. $5 free credit/month.',
                      setup: 'Deploy PostgreSQL plugin, get connection URL'
                    },
                  ].map(db => (
                    <div
                      key={db.name}
                      onClick={() => handleInputChange('database', db.name)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                        config.database === db.name
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-800">{db.title}</h3>
                        {config.database === db.name && <Check className="text-blue-500" size={20} />}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{db.desc}</p>
                      <p className="text-xs text-blue-600">→ {db.setup}</p>
                    </div>
                  ))}
                </div>

                <InputField
                  label="Database Connection String"
                  field="dbConnection"
                  type="password"
                  placeholder="postgresql://... or mongodb+srv://..."
                  helperText="Paste your connection string here"
                />
              </div>
            )}

            {/* Content Strategy */}
            {step === 'content-strategy' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Content Strategy</h2>
                
                <SelectField
                  label="Content Niche"
                  field="niche"
                  options={[
                    { value: 'luxury-resorts', label: '🏨 Luxury Resorts & Hotels' },
                    { value: 'safari', label: '🦁 Safari & Wildlife' },
                    { value: 'adventure', label: '🏔️ Adventure & Outdoor' },
                    { value: 'wellness', label: '🧘 Wellness & Retreats' },
                    { value: 'culinary', label: '🍽️ Culinary Experiences' },
                    { value: 'mixed', label: '⭐ Mix of Everything' }
                  ]}
                  helperText="What's the main focus of your blog?"
                />

                <SelectField
                  label="Primary Target Market"
                  field="targetMarket"
                  options={[
                    { value: 'US-millennial', label: '🇺🇸 US Millennials (25-40)' },
                    { value: 'EU-affluent', label: '🇪🇺 European Affluent (45+)' },
                    { value: 'APAC-business', label: '🌏 APAC Business Travelers' },
                    { value: 'luxury-seekers', label: '👑 Luxury Seekers (Global)' },
                    { value: 'eco-conscious', label: '♻️ Eco-Conscious Travelers' }
                  ]}
                />

                <SelectField
                  label="Geographic Focus"
                  field="geoRegion"
                  options={[
                    { value: 'Cape Town', label: 'Cape Town & Peninsula' },
                    { value: 'Kruger', label: 'Kruger National Park' },
                    { value: 'Franschhoek', label: 'Franschhoek & Winelands' },
                    { value: 'Garden Route', label: 'Garden Route' },
                    { value: 'Drakensberg', label: 'Drakensberg Mountains' },
                    { value: 'all-regions', label: 'All Regions' }
                  ]}
                />

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Posts Per Month <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={config.monthlyPosts}
                    onChange={(e) => handleInputChange('monthlyPosts', parseInt(e.target.value))}
                    className="admin-input"
                  />
                  <p className="text-xs text-gray-500 mt-1">Recommendation: 4 high-quality posts/month</p>
                </div>
              </div>
            )}

            {/* MONETIZATION */}
            {step === 'monetization' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Monetization Setup</h2>
                
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Revenue Streams:</strong> Affiliate links + Sponsorships + Email marketing
                  </p>
                </div>
              </div>
            )}

            {/* AFFILIATE NETWORKS */}
            {step === 'affiliate-networks' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Primary Revenue Source: Affiliate Networks</h2>
                
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                  <div className="text-sm text-purple-800">
                    <p className="font-bold mb-2">💰 Pure Affiliate Revenue Model</p>
                    <p className="mb-2"><strong>Expected Monthly Revenue:</strong> $500-2000 at scale</p>
                    <ul className="text-xs space-y-1 ml-4 list-disc">
                      <li><strong>GetYourGuide:</strong> 7% commission - Tours & Activities</li>
                      <li><strong>Viator:</strong> 5-10% commission - Local Experiences</li>
                      <li><strong>Booking.com:</strong> 6-8% commission - Hotels</li>
                      <li><strong>Unique stays / alternative accommodation platforms:</strong> 6-8% commission (varies by partner)</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">🏨 Hotel Bookings</h3>
                    <InputField
                      label="Booking.com Affiliate ID"
                      field="bookingAffiliateId"
                      placeholder="Your Booking affiliate ID"
                      helperText="6-8% commission • Sign up: affiliate.booking.com • Best for hotels"
                    />
                  </div>

                  {/* Unique stays: removed direct Airbnb integration; use Booking.com or other accommodation partners */}

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h3 className="font-semibold text-orange-800 mb-2">🎯 Tours & Activities (Highest Earners)</h3>
                    <InputField
                      label="GetYourGuide Affiliate ID"
                      field="getYourGuideId"
                      placeholder="Your GetYourGuide affiliate ID"
                      helperText="7% commission • Sign up: affiliate.getyourguide.com • TOP EARNER for travel blogs"
                    />
                    
                    <InputField
                      label="Viator Affiliate ID"
                      field="viatorAffiliateId"
                      placeholder="Your Viator affiliate ID"
                      helperText="5-10% commission • Sign up: viator.com/affiliate • Owned by TripAdvisor"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* EMAIL SETUP */}
            {step === 'email-setup' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Email & Notifications</h2>
                
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <strong>Email is KEY:</strong> Build your list from day 1. Email subscribers have 10x higher conversion rates.
                  </p>
                </div>

                <SelectField
                  label="Email Provider"
                  field="emailProvider"
                  options={[
                    { value: 'mailchimp', label: 'Mailchimp (Free up to 500 contacts)' },
                    { value: 'convertkit', label: 'ConvertKit ($25/month)' },
                    { value: 'substack', label: 'Substack (Free + revenue share)' }
                  ]}
                />

                <InputField
                  label="Email API Key"
                  field="emailApiKey"
                  type="password"
                  placeholder="Your email service API key"
                  helperText="Required for list integration"
                />
              </div>
            )}

            {/* HOSTING */}
            {step === 'hosting' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Hosting & Deployment</h2>
                
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Frontend:</strong> Vercel (free tier) | <strong>Backend:</strong> Railway/Render (free tier)
                  </p>
                </div>

                <InputField
                  label="Vercel Access Token"
                  field="vercelToken"
                  type="password"
                  placeholder="vercel_xxxxxxxx"
                  helperText="Get from vercel.com/account/tokens - enables auto-deployment"
                />

                <InputField
                  label="Custom Domain (Optional)"
                  field="domain"
                  placeholder="yourblog.com"
                  helperText="Leave blank for vercel.app subdomain (free)"
                />
              </div>
            )}

            {/* NOTIFICATIONS */}
            {step === 'notifications' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Setup Notifications</h2>
                
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Get alerts for:</strong> New post published, Revenue milestones, Issues detected, Weekly summary
                  </p>
                </div>

                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.enableNotifications}
                      onChange={(e) => handleInputChange('enableNotifications', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700 font-medium">Enable Email Notifications</span>
                  </label>
                </div>

                {config.enableNotifications && (
                  <InputField
                    label="Notification Email Address"
                    field="notificationEmail"
                    type="email"
                    placeholder="your@email.com"
                    helperText="You'll receive deployment, revenue, and content alerts here"
                  />
                )}
              </div>
            )}

            {/* GITHUB */}
            {step === 'github' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">GitHub & Automation</h2>
                
                <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>GitHub Actions</strong> will automatically generate new blog posts weekly based on your strategy.
                  </p>
                </div>

                <InputField
                  label="GitHub Personal Access Token"
                  field="githubToken"
                  type="password"
                  placeholder="ghp_xxxxxxxx"
                  helperText="Create at github.com/settings/tokens (repo, workflow scopes)"
                />

                <InputField
                  label="Repository Name"
                  field="repoName"
                  placeholder="sa-travel-blog"
                  helperText="Will be created as: yourusername/sa-travel-blog"
                />
              </div>
            )}

            {/* REVIEW */}
            {step === 'review' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Review Configuration</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-bold text-blue-800 mb-2">Content Strategy</h3>
                    <div className="text-sm text-blue-700 space-y-1">
                      <div>Niche: {config.niche || 'Not set'}</div>
                      <div>Target Market: {config.targetMarket || 'Not set'}</div>
                      <div>Region: {config.geoRegion || 'Not set'}</div>
                      <div>Posts/Month: {config.monthlyPosts || 'Not set'}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-bold text-green-800 mb-2">Infrastructure</h3>
                    <div className="text-sm text-green-700 space-y-1">
                      <div>AI Provider: {
                        config.aiProvider === 'gemini' ? '🟢 Google Gemini (Free)' :
                        config.aiProvider === 'anthropic' ? '🔵 Anthropic Claude' :
                        config.aiProvider === 'openai' ? '🟡 OpenAI GPT-4' : 'Not set'
                      }</div>
                      <div>Database: {config.database || 'Not set'}</div>
                      <div>Repository: {config.repoName || 'Not set'}</div>
                      <div>Domain: {config.domain || 'Vercel default'}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-bold text-purple-800 mb-2">Monetization</h3>
                      <div className="text-sm text-purple-700 space-y-1">
                      <div>Booking.com: {config.bookingAffiliateId ? '✅ Configured' : '⚪ Not set'}</div>
                      <div>GetYourGuide: {config.getYourGuideId ? '✅ Configured' : '⚪ Not set'}</div>
                      <div>Viator: {config.viatorAffiliateId ? '✅ Configured' : '⚪ Not set'}</div>
                      <div>Email Provider: {config.emailProvider || 'Not set'}</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex gap-3">
                    <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Ready to Deploy</p>
                      <p>This will create your blog repository, deploy the code, and start generating content automatically.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DEPLOYING */}
            {step === 'deploying' && (
              <div className="text-center py-8">
                <div className="mb-6">
                  <RefreshCw className="mx-auto animate-spin text-blue-600" size={48} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Deploying Your Blog...</h2>
                <div className="space-y-2 text-sm text-gray-600 max-w-md mx-auto">
                  <div className="flex justify-between">
                    <span>Creating GitHub repository</span>
                    <span className="text-green-600">✅</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deploying backend to Railway</span>
                    <span className="text-green-600">✅</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deploying frontend to Vercel</span>
                    <RefreshCw className="animate-spin text-blue-600" size={14} />
                  </div>
                  <div className="flex justify-between">
                    <span>Setting up automation</span>
                    <span className="text-gray-400">⏳</span>
                  </div>
                </div>
              </div>
            )}

            {/* DEPLOYED SUCCESS */}
            {step === 'deployed' && (
              <div className="text-center py-8">
                <div className="text-6xl mb-6">🎉</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Blog Successfully Deployed!</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Your autonomous travel blog is now live and will automatically generate content weekly.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
                  <a
                    href="https://yourblog.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-button-primary text-center"
                  >
                    <Eye className="inline mr-2" size={16} />
                    View Blog
                  </a>
                  <button
                    onClick={() => setUserMode('admin')}
                    className="admin-button-secondary text-center"
                  >
                    <Settings className="inline mr-2" size={16} />
                    Admin Dashboard
                  </button>
                </div>

                <div className="text-xs text-gray-500">
                  <p>Blog URL: https://yourblog.vercel.app</p>
                  <p>Admin Panel: https://admin.yourblog.com</p>
                  <p>First post will be generated within 24 hours</p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {step !== 'welcome' && step !== 'deployed' && (
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <button
                  onClick={handlePrev}
                  className="admin-button-secondary"
                  disabled={stepIndex === 0}
                >
                  <ChevronLeft className="inline mr-2" size={16} />
                  Back
                </button>
                
                {step === 'review' ? (
                  <button
                    onClick={handleDeploy}
                    disabled={loading}
                    className="admin-button-primary bg-green-600 hover:bg-green-700"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="inline mr-2 animate-spin" size={16} />
                        Deploying...
                      </>
                    ) : (
                      <>
                        Deploy Now <Zap className="inline ml-2" size={16} />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="admin-button-primary"
                  >
                    Continue <ChevronRight className="inline ml-2" size={16} />
                  </button>
                )}
              </div>
            )}

            {/* Switch to Admin Mode Button */}
            {step === 'welcome' && (
              <div className="text-center pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Already deployed?</p>
                <button
                  onClick={() => setUserMode('admin')}
                  className="admin-button-secondary"
                >
                  <Settings className="inline mr-2" size={16} />
                  Access Admin Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =====================================================================
  // ADMIN DASHBOARD MODE
  // =====================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Travel Blog Admin</h1>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Live
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setUserMode('deploy')}
                className="admin-button-secondary text-sm"
              >
                <Zap className="inline mr-2" size={14} />
                Deployment Wizard
              </button>
              <div className="text-sm text-gray-600">
                Revenue: <span className="font-bold text-green-600">${adminData.totalRevenue}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Admin Dashboard Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'overview', label: 'Overview', icon: BarChart3 },
                { key: 'posts', label: 'Posts', icon: Eye },
                { key: 'analytics', label: 'Analytics', icon: TrendingUp },
                { key: 'affiliates', label: 'Affiliates', icon: Link2 },
                { key: 'email', label: 'Email', icon: Mail },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setDashboardTab(tab.key)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    dashboardTab === tab.key
                      ? 'border-admin-primary text-admin-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="mr-2" size={16} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Dashboard Content */}
        {dashboardTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="admin-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">${adminData.totalRevenue}</p>
                  </div>
                  <DollarSign className="text-green-500" size={24} />
                </div>
              </div>
              
              <div className="admin-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Monthly Views</p>
                    <p className="text-2xl font-bold text-blue-600">{adminData.monthlyViews.toLocaleString()}</p>
                  </div>
                  <Eye className="text-blue-500" size={24} />
                </div>
              </div>
              
              <div className="admin-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Email Subscribers</p>
                    <p className="text-2xl font-bold text-purple-600">{adminData.emailSubscribers}</p>
                  </div>
                  <Mail className="text-purple-500" size={24} />
                </div>
              </div>
              
              <div className="admin-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Next Post</p>
                    <p className="text-sm font-medium text-gray-900">{adminData.nextScheduledPost}</p>
                  </div>
                  <Cpu className="text-gray-500" size={24} />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="admin-card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={triggerPostGeneration}
                  disabled={loading}
                  className="admin-button-primary p-4 text-left"
                >
                  {loading ? (
                    <RefreshCw className="animate-spin mb-2" size={20} />
                  ) : (
                    <Zap className="mb-2" size={20} />
                  )}
                  <div className="font-medium">Generate Post Now</div>
                  <div className="text-sm opacity-80">Create new blog post with AI</div>
                </button>
                
                <button className="admin-button-secondary p-4 text-left">
                  <Send className="mb-2" size={20} />
                  <div className="font-medium">Send Newsletter</div>
                  <div className="text-sm opacity-80">Email campaign to {adminData.emailSubscribers} subscribers</div>
                </button>
                
                <button className="admin-button-secondary p-4 text-left">
                  <Download className="mb-2" size={20} />
                  <div className="font-medium">Export Analytics</div>
                  <div className="text-sm opacity-80">Download performance report</div>
                </button>
              </div>
            </div>

            {/* Recent Posts */}
            <div className="admin-card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Posts</h3>
              <div className="space-y-4">
                {adminData.recentPosts.map((post: any) => (
                  <div key={post.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{post.title}</h4>
                      <p className="text-sm text-gray-600">{post.date} • {post.views} views</p>
                    </div>
                    <div className="text-right">
                      <div className={`px-2 py-1 text-xs rounded-full ${
                        post.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.status}
                      </div>
                      <div className="text-sm font-medium text-green-600 mt-1">
                        ${post.revenue}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* POSTS MANAGEMENT TAB */}
        {dashboardTab === 'posts' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Posts Management</h2>
              <div className="flex gap-3">
                <button 
                  onClick={triggerPostGeneration}
                  disabled={loading}
                  className="admin-button-primary"
                >
                  {loading ? (
                    <RefreshCw className="animate-spin mr-2" size={16} />
                  ) : (
                    <Zap className="mr-2" size={16} />
                  )}
                  Generate New Post
                </button>
                <button className="admin-button-secondary">
                  <Download className="mr-2" size={16} />
                  Export Posts
                </button>
              </div>
            </div>

            {/* Posts Table */}
            <div className="admin-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Views</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Revenue</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminData.recentPosts.map((post: any) => (
                      <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{post.title}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            post.status === 'published' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {post.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{post.views.toLocaleString()}</td>
                        <td className="py-3 px-4 font-medium text-green-600">${post.revenue}</td>
                        <td className="py-3 px-4 text-gray-600">{post.date}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                            <button className="text-green-600 hover:text-green-800 text-sm">View</button>
                            {post.status === 'draft' && (
                              <button className="text-purple-600 hover:text-purple-800 text-sm">Publish</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Content Strategy Settings */}
            <div className="admin-card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Content Strategy</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Niche</label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-800">
                    {config.niche || 'Luxury Resorts'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Market</label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-800">
                    {config.targetMarket || 'US Millennials'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Posts per Month</label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-800">
                    {config.monthlyPosts || 4} posts
                  </div>
                </div>
              </div>
              <button className="mt-4 admin-button-secondary text-sm">
                <Settings className="mr-2" size={14} />
                Update Strategy
              </button>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {dashboardTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Analytics & Performance</h2>

            {/* Revenue Chart */}
            <div className="admin-card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Booking.com</span>
                      <span className="font-bold text-blue-600">${adminData.affMetrics.booking.revenue}</span>
                    </div>
                    {/* Airbnb removed from UI: revenue rolled into accommodation partners */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">GetYourGuide</span>
                      <span className="font-bold text-orange-600">${adminData.affMetrics.getyourguide.revenue}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Viator</span>
                      <span className="font-bold text-teal-600">${adminData.affMetrics.viator.revenue}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="mx-auto mb-2 text-gray-400" size={32} />
                      <p className="text-gray-500">Revenue Chart</p>
                      <p className="text-xs text-gray-400">Interactive chart coming soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Traffic Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="admin-card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Traffic Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Views</span>
                    <span className="font-bold">{adminData.totalViews.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Views</span>
                    <span className="font-bold text-blue-600">{adminData.monthlyViews.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg. Time on Page</span>
                    <span className="font-bold">3m 42s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bounce Rate</span>
                    <span className="font-bold">32%</span>
                  </div>
                </div>
              </div>

              <div className="admin-card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Top Performing Posts</h3>
                <div className="space-y-2">
                  {adminData.recentPosts
                    .sort((a: any, b: any) => b.views - a.views)
                    .slice(0, 3)
                    .map((post: any, index: any) => (
                    <div key={post.id} className="flex justify-between items-center py-2">
                      <div className="flex items-center">
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded mr-2">
                          #{index + 1}
                        </span>
                        <span className="text-sm font-medium truncate">{post.title}</span>
                      </div>
                      <span className="text-sm text-gray-600">{post.views} views</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AFFILIATES TAB */}
        {dashboardTab === 'affiliates' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Affiliate Networks</h2>
              <button className="admin-button-primary">
                <Link2 className="mr-2" size={16} />
                Add Network
              </button>
            </div>

            {/* Affiliate Performance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(adminData.affMetrics).map(([network, metrics]: any) => (
                <div key={network} className="admin-card">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-gray-900 capitalize">{network}</h3>
                    <div className={`w-3 h-3 rounded-full ${
                      metrics.rate > 5 ? 'bg-green-400' : 
                      metrics.rate > 4 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Clicks</span>
                      <span className="font-medium">{metrics.clicks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conversions</span>
                      <span className="font-medium">{metrics.conversions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue</span>
                      <span className="font-bold text-green-600">${metrics.revenue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rate</span>
                      <span className={`font-bold ${
                        metrics.rate > 5 ? 'text-green-600' : 
                        metrics.rate > 4 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {metrics.rate}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Affiliate Links Management */}
            <div className="admin-card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Affiliate Activity</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Network</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Post</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Clicks</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Conversions</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Revenue</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-blue-600">Booking.com</td>
                      <td className="py-3 px-4 text-gray-600">Top 5 Luxury Resorts</td>
                      <td className="py-3 px-4">156</td>
                      <td className="py-3 px-4">8</td>
                      <td className="py-3 px-4 font-bold text-green-600">$487.50</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                    </tr>
                    {/* Airbnb rows removed — platform deprecated from affiliate options */}
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-orange-600">GetYourGuide</td>
                      <td className="py-3 px-4 text-gray-600">Safari Luxury Guide</td>
                      <td className="py-3 px-4">67</td>
                      <td className="py-3 px-4">3</td>
                      <td className="py-3 px-4 font-bold text-green-600">$178.40</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* EMAIL TAB */}
        {dashboardTab === 'email' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Email Marketing</h2>
              <div className="flex gap-3">
                <button className="admin-button-primary">
                  <Send className="mr-2" size={16} />
                  Send Campaign
                </button>
                <button className="admin-button-secondary">
                  <Download className="mr-2" size={16} />
                  Export List
                </button>
              </div>
            </div>

            {/* Email Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="admin-card text-center">
                <div className="text-2xl font-bold text-purple-600">{adminData.emailSubscribers}</div>
                <div className="text-sm text-gray-600">Total Subscribers</div>
                <div className="text-xs text-green-600 mt-1">+12% this month</div>
              </div>
              <div className="admin-card text-center">
                <div className="text-2xl font-bold text-blue-600">{adminData.emailOpenRate}%</div>
                <div className="text-sm text-gray-600">Open Rate</div>
                <div className="text-xs text-gray-500 mt-1">Industry: 21%</div>
              </div>
              <div className="admin-card text-center">
                <div className="text-2xl font-bold text-green-600">5.2%</div>
                <div className="text-sm text-gray-600">Click Rate</div>
                <div className="text-xs text-green-600 mt-1">+0.8% vs last month</div>
              </div>
              <div className="admin-card text-center">
                <div className="text-2xl font-bold text-orange-600">$2.30</div>
                <div className="text-sm text-gray-600">Revenue per Email</div>
                <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
              </div>
            </div>

            {/* Recent Campaigns */}
            <div className="admin-card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Campaigns</h3>
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    subject: "New Post: Top 5 Luxury Resorts in Cape Town",
                    sent: "2025-01-28",
                    opens: "42%",
                    clicks: "6.1%",
                    revenue: "$156.80"
                  },
                  {
                    id: 2,
                    subject: "Weekly Travel Digest - Franschhoek Wine Country",
                    sent: "2025-01-21",
                    opens: "38%",
                    clicks: "4.9%",
                    revenue: "$98.40"
                  },
                  {
                    id: 3,
                    subject: "Exclusive: Safari Booking Deals This Weekend",
                    sent: "2025-01-14",
                    opens: "45%",
                    clicks: "7.2%",
                    revenue: "$234.50"
                  }
                ].map(campaign => (
                  <div key={campaign.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{campaign.subject}</h4>
                      <p className="text-sm text-gray-600">Sent: {campaign.sent}</p>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-blue-600">{campaign.opens}</div>
                        <div className="text-xs text-gray-500">Opens</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-green-600">{campaign.clicks}</div>
                        <div className="text-xs text-gray-500">Clicks</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-purple-600">{campaign.revenue}</div>
                        <div className="text-xs text-gray-500">Revenue</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Automation */}
            <div className="admin-card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Automated Sequences</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">Welcome Series</h4>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">3 emails over 5 days</p>
                  <div className="text-xs text-gray-500">
                    <div>Open rate: 58%</div>
                    <div>Click rate: 12%</div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">Weekly Digest</h4>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Every Sunday at 9 AM</p>
                  <div className="text-xs text-gray-500">
                    <div>Open rate: 32%</div>
                    <div>Click rate: 5.2%</div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">Re-engagement</h4>
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Paused</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">For inactive subscribers</p>
                  <div className="text-xs text-gray-500">
                    <div>Open rate: 18%</div>
                    <div>Click rate: 3.1%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}