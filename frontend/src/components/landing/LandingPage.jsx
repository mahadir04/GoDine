import React from 'react';
import useStore, { IMAGES } from '../../store/store';
import {
  Compass,
  Lock,
  Sparkles,
  MapPin,
  Utensils,
  Calendar,
  Award,
  ArrowRight,
  ShieldCheck,
  Zap,
  Star,
  Users,
  CheckCircle2,
  ChevronRight,
  LogIn,
  Send,
  Bot,
  MessageSquare,
  ThumbsUp
} from 'lucide-react';

const LandingPage = ({ onOpenAuth }) => {
  const { oauthLoginAsync, loginAsync, setActiveTab } = useStore();

  const [aiPrompt, setAiPrompt] = React.useState('');
  const [aiReply, setAiReply] = React.useState('Hello! Ask me for luxury hotel stays, highway resthouses, or trending food near you!');
  const [isAiThinking, setIsAiThinking] = React.useState(false);

  const handleAskLandingAi = async (e) => {
    e?.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsAiThinking(true);
    const query = aiPrompt;
    setAiPrompt('');

    setTimeout(() => {
      setAiReply(`Based on GoDine AI analysis for "${query}": We recommend Copper Kettle Bistro (4.9★, 15% OFF promo today) or Aura Boutique Hotel & Spa for oceanfront stay!`);
      setIsAiThinking(false);
    }, 600);
  };

  const handleQuickDemoLogin = async (email, password) => {
    try {
      await loginAsync(email, password);
      setActiveTab('profile');
    } catch (err) {
      if (onOpenAuth) onOpenAuth();
    }
  };

  const handleQuickOAuth = async (provider) => {
    try {
      const mockOAuthPayload = {
        provider: 'google',
        email: 'google.user@godine.app',
        full_name: 'Alex Rivera (Google)',
        avatar_url: IMAGES.alexAvatar,
        provider_id: 'goog_98234112'
      };
      await oauthLoginAsync(mockOAuthPayload);
      setActiveTab('profile');
    } catch (err) {
      if (onOpenAuth) onOpenAuth();
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-zinc-900 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#FF5A5F] selection:text-white">
      
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-200/80 px-6 lg:px-12 py-4 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF5A5F] to-rose-400 flex items-center justify-center text-white shadow-md shadow-[#FF5A5F]/20">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-zinc-900">GoDine</span>
            <span className="ml-2 text-[10px] font-bold bg-[#FFF0F1] text-[#FF5A5F] px-2 py-0.5 rounded-full uppercase tracking-wider">
              v2.0
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-zinc-600">
          <a href="#features" className="hover:text-[#FF5A5F] transition-colors">Features</a>
          <a href="#venues" className="hover:text-[#FF5A5F] transition-colors">Featured Venues</a>
          <a href="#ai-concierge" className="hover:text-[#FF5A5F] transition-colors">AI Concierge</a>
          <a href="#testimonials" className="hover:text-[#FF5A5F] transition-colors">Reviews</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenAuth && onOpenAuth(false)}
            className="text-xs font-bold text-zinc-700 hover:text-zinc-950 px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Log In
          </button>
          <button
            onClick={() => onOpenAuth && onOpenAuth(true)}
            className="bg-[#FF5A5F] hover:bg-[#E0484D] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-[#FF5A5F]/20 hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer flex items-center gap-1.5"
          >
            <span>Get Started</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-20 px-6 lg:px-12 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF0F1] border border-[#FF5A5F]/30 text-[#FF5A5F] text-xs font-extrabold shadow-xs">
              <Sparkles className="w-4 h-4" />
              <span>JWT Authentication & Google OAuth 2.0 Enabled</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-zinc-950 tracking-tight leading-[1.1]">
              Discover, Stay & Dine at Exceptional Places Nearby
            </h1>

            <p className="text-base text-zinc-600 font-medium leading-relaxed max-w-2xl">
              Connect directly with verified hotels, boutique cafes, resthouses, and fine dining spots. Enjoy live discount promos, smart table bookings, and AI recommendations.
            </p>

            {/* Main Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onOpenAuth && onOpenAuth(false)}
                className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-zinc-950/20 hover:shadow-xl transition-all hover:scale-[1.01] cursor-pointer flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In / Register with JWT</span>
              </button>

              <button
                onClick={() => handleQuickOAuth('google')}
                className="bg-white hover:bg-zinc-100 text-zinc-800 font-bold text-sm px-5 py-3.5 rounded-2xl border border-zinc-200 shadow-sm transition-all hover:scale-[1.01] cursor-pointer flex items-center gap-2.5"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Google OAuth</span>
              </button>
            </div>

            {/* Quick One-Click Demo Bar */}
            <div className="pt-4 border-t border-zinc-200/60 flex items-center gap-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Instant Demo:</span>
              <button
                onClick={() => handleQuickDemoLogin('diner@geodine.com', 'diner123')}
                className="text-xs font-bold text-zinc-700 hover:text-[#FF5A5F] bg-zinc-100 hover:bg-[#FFF0F1] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Diner Profile ➔
              </button>
              <button
                onClick={() => handleQuickDemoLogin('owner@geodine.com', 'owner123')}
                className="text-xs font-bold text-zinc-700 hover:text-[#FF5A5F] bg-zinc-100 hover:bg-[#FFF0F1] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Owner Dashboard ➔
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-6 pt-4 max-w-lg">
              <div>
                <div className="text-2xl font-black text-zinc-950">500+</div>
                <div className="text-xs font-bold text-zinc-400">Verified Venues</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#FF5A5F]">99.8%</div>
                <div className="text-xs font-bold text-zinc-400">JWT Token Security</div>
              </div>
              <div>
                <div className="text-2xl font-black text-zinc-950">12.5k</div>
                <div className="text-xs font-bold text-zinc-400">Table Bookings</div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Graphic / Interactive Card Stack */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md">
              
              {/* Background Glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[#FF5A5F]/20 to-amber-300/30 rounded-3xl blur-2xl opacity-70" />

              {/* Main Visual Card */}
              <div className="relative bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="relative h-56 rounded-2xl overflow-hidden">
                  <img
                    src={IMAGES.restaurantHero}
                    alt="Hero venue preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 bg-[#FF5A5F] text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <Zap className="w-3.5 h-3.5" />
                    <span>20% OFF TODAY</span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-lg font-black">Grand Horizon Hotel & Dining</h3>
                    <p className="text-xs text-zinc-200 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#FF5A5F]" />
                      <span>Downtown Avenue · 0.8 km away</span>
                    </p>
                  </div>
                </div>

                {/* Profile Floating Card preview */}
                <div className="bg-zinc-50 border border-zinc-200/70 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={IMAGES.alexAvatar}
                      alt="User avatar"
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
                    />
                    <div>
                      <h4 className="text-xs font-black text-zinc-900">Alex Rivera</h4>
                      <p className="text-[11px] text-zinc-400 font-bold">@alex_rivera · Gold Explorer</p>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>JWT Verified</span>
                  </span>
                </div>

                {/* Rating & Review badge */}
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-600">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span className="text-zinc-900 font-bold ml-1">4.9 / 5.0</span>
                  </div>
                  <span className="text-zinc-400 font-medium">1,420 Reviews</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="py-20 bg-white border-y border-zinc-200/80 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-black text-zinc-950 tracking-tight">
              Engineered for Modern Hospitality & Food Explorers
            </h2>
            <p className="text-sm text-zinc-500 font-medium leading-relaxed">
              From authentication to real-time maps and sentiment analysis, GoDine combines powerful technologies in one seamless experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1: JWT & OAuth */}
            <div className="bg-[#FAFAFA] border border-zinc-200/80 rounded-3xl p-6 space-y-3 hover:border-[#FF5A5F]/40 transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#FF5A5F] flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-zinc-900">JWT & OAuth Authentication</h3>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                Seamless login via encrypted Bearer JWT tokens and Google OAuth 2.0 for high security.
              </p>
            </div>

            {/* Feature 2: Geospatial */}
            <div className="bg-[#FAFAFA] border border-zinc-200/80 rounded-3xl p-6 space-y-3 hover:border-[#FF5A5F]/40 transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-zinc-900">Geospatial Discovery</h3>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                Locate nearby restaurants, hotels, motels, and resthouses using real GPS coordinates and OpenStreetMap.
              </p>
            </div>

            {/* Feature 3: AI Concierge */}
            <div className="bg-[#FAFAFA] border border-zinc-200/80 rounded-3xl p-6 space-y-3 hover:border-[#FF5A5F]/40 transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-zinc-900">AI Concierge Assistant</h3>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                Ask our Gemini AI concierge for personalized hotel stays, resthouse picks, or dish suggestions 24/7.
              </p>
            </div>

            {/* Feature 4: Table Bookings & Profile */}
            <div className="bg-[#FAFAFA] border border-zinc-200/80 rounded-3xl p-6 space-y-3 hover:border-[#FF5A5F]/40 transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-zinc-900">Profile & Reservations</h3>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                Manage your taste preferences, loyalty achievements, and active table or room reservations with ease.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 4. Featured Venues Section */}
      <section id="venues" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto space-y-12">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold text-[#FF5A5F] uppercase tracking-wider">Top Destinations</span>
            <h2 className="text-3xl font-black text-zinc-950 tracking-tight mt-1">Explore Featured Venues</h2>
          </div>

          <button
            onClick={() => onOpenAuth && onOpenAuth(false)}
            className="text-xs font-bold text-[#FF5A5F] hover:text-[#E0484D] flex items-center gap-1 cursor-pointer"
          >
            <span>Log In to View All Venues</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Venue Card 1 */}
          <div className="bg-white border border-zinc-200/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all group">
            <div className="relative h-48 overflow-hidden">
              <img
                src={IMAGES.hotelPool}
                alt="Hotel pool"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-zinc-950 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                Hotel & Resort
              </span>
            </div>
            <div className="p-6 space-y-2">
              <h3 className="text-lg font-black text-zinc-900">Aura Boutique Hotel & Spa</h3>
              <p className="text-xs text-zinc-500 font-medium">Luxury stays with oceanfront view and private dining.</p>
              <div className="pt-2 flex items-center justify-between border-t border-zinc-100 text-xs font-bold">
                <span className="text-amber-500">★ 4.9 (340 reviews)</span>
                <span className="text-zinc-900">$$$$ · Luxury</span>
              </div>
            </div>
          </div>

          {/* Venue Card 2 */}
          <div className="bg-white border border-zinc-200/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all group">
            <div className="relative h-48 overflow-hidden">
              <img
                src={IMAGES.ramen}
                alt="Ramen dish"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-[#FF5A5F] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                15% OFF SPECIAL
              </span>
            </div>
            <div className="p-6 space-y-2">
              <h3 className="text-lg font-black text-zinc-900">Copper Kettle Bistro & Bar</h3>
              <p className="text-xs text-zinc-500 font-medium">Artisanal ramen, craft cocktails, and vibrant live music.</p>
              <div className="pt-2 flex items-center justify-between border-t border-zinc-100 text-xs font-bold">
                <span className="text-amber-500">★ 4.8 (512 reviews)</span>
                <span className="text-zinc-900">$$ · Moderate</span>
              </div>
            </div>
          </div>

          {/* Venue Card 3 */}
          <div className="bg-white border border-zinc-200/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all group">
            <div className="relative h-48 overflow-hidden">
              <img
                src={IMAGES.coffee}
                alt="Coffee shop"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                Artisanal Cafe
              </span>
            </div>
            <div className="p-6 space-y-2">
              <h3 className="text-lg font-black text-zinc-900">Bean & Brew Roastery</h3>
              <p className="text-xs text-zinc-500 font-medium">Specialty coffee, fresh sourdough croissants, and quiet study nooks.</p>
              <div className="pt-2 flex items-center justify-between border-t border-zinc-100 text-xs font-bold">
                <span className="text-amber-500">★ 4.7 (280 reviews)</span>
                <span className="text-zinc-900">$ · Casual</span>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* 5. AI Concierge Section */}
      <section id="ai-concierge" className="py-20 bg-[#09090B] text-white px-6 lg:px-12 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-extrabold">
              <Sparkles className="w-4 h-4" />
              <span>24/7 Intelligent AI Concierge</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Ask AI Anything: Stays, Dining & Resthouses
            </h2>

            <p className="text-sm text-zinc-400 font-medium leading-relaxed">
              Powered by advanced sentiment analysis and real-time geospatial data, our AI concierge helps you discover hidden culinary gems, check room availability, and reserve tables instantly.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs font-bold text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Personalized hotel & motel recommendations based on your taste profile</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Aspect-based sentiment analysis on thousands of verified reviews</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant table & room bookings linked directly with merchant partners</span>
              </div>
            </div>
          </div>

          {/* Interactive AI Preview Box */}
          <div className="lg:col-span-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5">
              <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">GoDine AI Assistant</h4>
                  <p className="text-[11px] text-zinc-400 font-bold">Live AI Concierge Demo</p>
                </div>
              </div>

              {/* Chat Bubble Output */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 min-h-24 text-xs font-medium text-zinc-300 leading-relaxed flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  {isAiThinking ? (
                    <span className="text-zinc-500 animate-pulse font-bold">Analyzing nearby venues & dish reviews…</span>
                  ) : (
                    <span>{aiReply}</span>
                  )}
                </div>
              </div>

              {/* Interactive Input Form */}
              <form onSubmit={handleAskLandingAi} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Find best ramen place with deals near me..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-all font-bold"
                />
                <button
                  type="submit"
                  disabled={isAiThinking}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <span>Ask AI</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>

      {/* 6. Testimonials / Reviews Section */}
      <section id="testimonials" className="py-20 bg-white px-6 lg:px-12 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-[#FF5A5F] uppercase tracking-wider">Community Sentiment</span>
            <h2 className="text-3xl font-black text-zinc-950 tracking-tight">Loved by Diners & Travelers</h2>
            <p className="text-sm text-zinc-500 font-medium">Real verified reviews powered by aspect sentiment analysis.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Review 1 */}
            <div className="bg-[#FAFAFA] border border-zinc-200/80 rounded-3xl p-6 space-y-4 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="text-xs font-bold text-zinc-900 ml-1">5.0 / 5.0</span>
              </div>
              <p className="text-xs text-zinc-700 font-medium leading-relaxed">
                "GoDine made finding a quiet resthouse during our highway trip effortless. The AI concierge picked the exact spot we needed!"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-zinc-200/60">
                <img src={IMAGES.alexAvatar} alt="Reviewer" className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <h4 className="text-xs font-black text-zinc-900">Alex Rivera</h4>
                  <p className="text-[11px] text-zinc-400 font-bold">Gold Explorer · Verified Diner</p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-[#FAFAFA] border border-zinc-200/80 rounded-3xl p-6 space-y-4 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="text-xs font-bold text-zinc-900 ml-1">4.9 / 5.0</span>
              </div>
              <p className="text-xs text-zinc-700 font-medium leading-relaxed">
                "The live discount deals and instant table reservation at Copper Kettle Bistro saved us 20% and guaranteed our table on Friday night."
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-zinc-200/60">
                <img src={IMAGES.miaAvatar} alt="Reviewer" className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <h4 className="text-xs font-black text-zinc-900">Mia Zhang</h4>
                  <p className="text-[11px] text-zinc-400 font-bold">Food Critic · 140 Reviews</p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-[#FAFAFA] border border-zinc-200/80 rounded-3xl p-6 space-y-4 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="text-xs font-bold text-zinc-900 ml-1">4.9 / 5.0</span>
              </div>
              <p className="text-xs text-zinc-700 font-medium leading-relaxed">
                "Being able to view real OpenStreetMap locations and message post owners directly makes GoDine standout."
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-zinc-200/60">
                <img src={IMAGES.danielAvatar} alt="Reviewer" className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <h4 className="text-xs font-black text-zinc-900">Daniel Vance</h4>
                  <p className="text-[11px] text-zinc-400 font-bold">Traveler · Verified Member</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. Call-to-Action Banner */}
      <section className="py-16 px-6 lg:px-12 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to experience GoDine & manage your profile?
          </h2>
          <p className="text-sm text-zinc-300 max-w-xl mx-auto font-medium">
            Sign in with JWT Token or Google OAuth to unlock instant table reservations, taste preference management, and personalized user profile analytics.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onOpenAuth && onOpenAuth(false)}
              className="bg-[#FF5A5F] hover:bg-[#E0484D] text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-[#FF5A5F]/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              Sign In to Your Profile
            </button>
            <button
              onClick={() => handleQuickOAuth('google')}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3.5 rounded-2xl backdrop-blur-md border border-white/20 transition-all cursor-pointer"
            >
              Google OAuth Quick Login
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 lg:px-12 bg-white border-t border-zinc-200 text-center text-xs font-medium text-zinc-400">
        © 2024 GoDine · Hospitality Discovery Network · JWT & OAuth 2.0
      </footer>

    </div>
  );
};

export default LandingPage;
