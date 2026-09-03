import React from 'react';
import useStore from '../../store/store';
import { MapPin, LogOut, Compass, BarChart3, Layers, User, Bell, MessageSquare } from 'lucide-react';

const Header = () => {
  const { user, activeTab, setActiveTab, logout, coordinates } = useStore();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-zinc-800/80 px-6 py-4 shadow-lg backdrop-blur-md">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('feed')}>
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-md shadow-blue-500/20">
            <Compass className="h-5 w-5 text-white animate-spin-slow" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">
              Geo<span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Dine</span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono">Geospatial AI Network</p>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-900/60 p-1.5 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'feed'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Compass className="h-4 w-4" />
            Social Feed
          </button>
          
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'map'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MapPin className="h-4 w-4 text-rose-500" />
            Social Map
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'chat'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MessageSquare className="h-4 w-4 text-blue-400" />
            AI Chat
          </button>

          {user.role === 'OWNER' && (
            <button
              onClick={() => setActiveTab('owner_dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'owner_dashboard'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Owner Dashboard
            </button>
          )}
        </nav>

        {/* Location & User Profile */}
        <div className="flex items-center gap-4">
          
          {/* Geolocation Tag */}
          <div className="hidden lg:flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5">
            <MapPin className="h-4 w-4 text-rose-500 animate-bounce" />
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Diner GPS</p>
              <p className="text-xs text-zinc-300 font-semibold">{coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}</p>
            </div>
          </div>

          <button className="relative text-zinc-400 hover:text-zinc-200 p-2 rounded-lg hover:bg-zinc-900 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500"></span>
          </button>

          {/* User profile dropdown info */}
          <div className="flex items-center gap-3 pl-2 border-l border-zinc-800">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-zinc-200">{user.full_name}</p>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                user.role === 'OWNER' ? 'bg-indigo-900/40 text-indigo-300 border border-indigo-800/40' : 'bg-emerald-900/40 text-emerald-300 border border-emerald-800/40'
              }`}>
                {user.role}
              </span>
            </div>
            
            <button
              onClick={logout}
              title="Logout"
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 p-2.5 rounded-xl border border-zinc-800 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};

export default Header;
