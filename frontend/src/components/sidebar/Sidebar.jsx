import React from 'react';
import useStore, { IMAGES } from '../../store/store';
import {
  Home,
  Compass,
  Building2,
  MessageSquare,
  Bell,
  User,
  PlusSquare,
  LogOut,
  Utensils,
  ChevronRight,
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';

const Sidebar = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    logout,
    setIsCreatePostOpen,
    unreadNotificationsCount
  } = useStore();

  const handleLogout = () => {
    logout();
  };

  const isOwner = currentUser?.role === 'OWNER';

  return (
    <aside className="w-64 bg-white border-r border-zinc-200/80 min-h-screen p-4 flex flex-col justify-between sticky top-0 h-screen overflow-y-auto selection:bg-[#FF5A5F] selection:text-white">
      <div className="space-y-6">
        
        {/* Brand Logo */}
        <div className="px-3 py-2 flex items-center justify-between cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF5A5F] to-rose-400 flex items-center justify-center text-white shadow-md shadow-[#FF5A5F]/20">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-zinc-950">GoDine</span>
              <span className="ml-2 text-[10px] font-extrabold bg-[#FFF0F1] text-[#FF5A5F] px-2 py-0.5 rounded-full uppercase tracking-wider">
                v2.0
              </span>
            </div>
          </div>
        </div>

        {/* Create Post Button */}
        <button
          onClick={() => setIsCreatePostOpen(true)}
          className="w-full bg-[#FF5A5F] hover:bg-[#E0484D] text-white font-black text-sm py-3 px-4 rounded-2xl shadow-lg shadow-[#FF5A5F]/20 hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
        >
          <PlusSquare className="w-5 h-5" />
          <span>New Post / Offer</span>
        </button>

        {/* Primary Navigation Menu */}
        <nav className="space-y-1">
          <button
            onClick={() => setActiveTab('home')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-zinc-950 text-white shadow-md shadow-zinc-950/10'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('explore')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'explore'
                ? 'bg-zinc-950 text-white shadow-md shadow-zinc-950/10'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span>Explore Map</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'messages'
                ? 'bg-zinc-950 text-white shadow-md shadow-zinc-950/10'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Messages & Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-zinc-950 text-white shadow-md shadow-zinc-950/10'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </div>
            {unreadNotificationsCount > 0 && (
              <span className="bg-[#FF5A5F] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-zinc-950 text-white shadow-md shadow-zinc-950/10'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
            }`}
          >
            <User className="w-5 h-5" />
            <span>My Profile</span>
          </button>

          {isOwner && (
            <button
              onClick={() => setActiveTab('owner_dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'owner_dashboard'
                  ? 'bg-zinc-950 text-white shadow-md shadow-zinc-950/10'
                  : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 text-amber-600" />
              <span>Owner Dashboard</span>
            </button>
          )}
        </nav>
      </div>

      {/* User Footer Profile & Logout */}
      <div className="pt-4 border-t border-zinc-200/80 space-y-3">
        <div
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-3 p-2 rounded-2xl hover:bg-zinc-100 transition-all cursor-pointer group"
        >
          <img
            src={currentUser?.avatar || IMAGES.alexAvatar}
            alt={currentUser?.name || 'User'}
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black text-zinc-900 truncate flex items-center gap-1">
              <span>{currentUser?.name || 'Explorer'}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            </h4>
            <p className="text-[11px] text-zinc-400 font-bold truncate">
              {currentUser?.handle || '@explorer'}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-xs font-bold text-zinc-500 hover:text-rose-600 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
