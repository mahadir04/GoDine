import React, { useState } from 'react';
import useStore, { IMAGES } from '../../store/store';
import EditProfileModal from './EditProfileModal';
import {
  Edit3,
  Share2,
  Sparkles,
  Award,
  Coffee,
  Flag,
  Calendar,
  Grid,
  Bookmark,
  Star,
  Tag,
  Clock,
  LogOut,
  Trash2,
  PlusCircle,
  Zap,
  MapPin,
  ChevronRight,
  Utensils
} from 'lucide-react';

const UserProfile = () => {
  const {
    currentUser,
    reservations,
    venues,
    setSelectedVenueId,
    setActiveTab,
    setSelectedPostId,
    posts,
    deleteReservation,
    setIsAuthenticated,
    setIsCreatePostOpen,
    setReservationVenue,
    setIsReservationModalOpen
  } = useStore();

  const [activeTabName, setActiveTabName] = useState('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // User authored posts from database
  const myPosts = posts.filter(p => p.author_id === currentUser.id || !p.author_id);
  const offerPosts = posts.filter(p => p.badge || p.discount_pct > 0 || p.post_type === 'PROMO');

  const tabs = [
    { id: 'posts', label: 'Posts', icon: Grid },
    { id: 'offers', label: 'Location Offers', icon: Zap },
    { id: 'saved', label: 'Saved', icon: Bookmark },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'reservations', label: 'Reservations', icon: Calendar },
  ];

  const handleBookVenueOffer = (venueName, venueCategory, venueId) => {
    setReservationVenue({
      id: venueId || venues[0]?.id,
      name: venueName || 'Hospitality Destination',
      category: venueCategory || 'Restaurant'
    });
    setIsReservationModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 md:px-8 pb-16">
      
      {/* 1. Header Row: Avatar, User Details, Loyalty Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Left 2 Cols: Profile Info */}
        <div className="lg:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-zinc-200 flex-shrink-0">
            <img
              src={currentUser.avatar || IMAGES.alexAvatar}
              alt={currentUser.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black text-zinc-900">{currentUser.name}</h1>
              <span className="bg-[#FFF0F1] text-[#FF5A5F] text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                {currentUser.role}
              </span>
              <span className="bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span>👑</span>
                <span>{currentUser.badge || 'Level 3 · Gold Explorer'}</span>
              </span>
            </div>

            <p className="text-xs font-semibold text-zinc-400">{currentUser.handle}</p>

            {/* Stats */}
            <div className="flex items-center gap-6 text-xs text-zinc-700 font-medium">
              <div>
                <strong className="text-zinc-900 font-bold">{myPosts.length}</strong> Posts
              </div>
              <div>
                <strong className="text-zinc-900 font-bold">{offerPosts.length}</strong> Saved Offers
              </div>
              <div>
                <strong className="text-zinc-900 font-bold">{currentUser.followersCount || '2.4k'}</strong> Followers
              </div>
            </div>

            <p className="text-xs text-zinc-700 leading-relaxed max-w-lg">
              {currentUser.bio || '🍽️ Discovering great stays and bites around the city.'}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>

              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`https://godine.app/users/${currentUser.handle?.replace('@','')}`);
                  alert('Profile link copied to clipboard!');
                }}
                className="flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Profile</span>
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem('godine_token');
                  setIsAuthenticated(false);
                }}
                className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Loyalty Points Card */}
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
              <span>Loyalty Points</span>
              <Sparkles className="w-4 h-4 text-[#FF5A5F]" />
            </div>
            <div className="text-3xl font-black text-zinc-900 mb-1">
              {(currentUser.loyaltyPoints || 1280).toLocaleString()}{' '}
              <span className="text-sm font-bold text-zinc-400">pts</span>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium mb-4">
              {currentUser.pointsToNextTier || 620} pts to next tier
            </p>
          </div>

          <div>
            <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden mb-1.5">
              <div className="h-full bg-gradient-to-r from-amber-400 to-[#FF5A5F] rounded-full w-[65%]" />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-400 font-bold">
              <span>Silver Explorer</span>
              <span>Gold Tier</span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. Main Content Split: Left Tabs & Grid, Right Achievements & Reservations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Tabs & Photos */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-zinc-200 mb-6">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTabName === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTabName(t.id)}
                  className={`flex items-center gap-2 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                    isActive
                      ? 'border-zinc-950 text-zinc-950'
                      : 'border-transparent text-zinc-400 hover:text-zinc-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Posts Grid */}
          {activeTabName === 'posts' && (
            <div>
              {myPosts.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200 text-zinc-400 space-y-3">
                  <p className="text-xs font-medium">No posts published yet.</p>
                  <button
                    onClick={() => setIsCreatePostOpen(true)}
                    className="inline-flex items-center gap-1.5 bg-[#FF5A5F] hover:bg-[#E0484D] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Your First Post</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {myPosts.map((post, idx) => (
                    <div
                      key={post.id || idx}
                      onClick={() => setSelectedPostId(post.id)}
                      className="aspect-square rounded-2xl overflow-hidden bg-zinc-100 cursor-pointer group shadow-xs hover:shadow-md transition-all relative"
                    >
                      <img
                        src={post.images?.[0] || IMAGES.ramen}
                        alt="Post thumbnail"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold text-xs">
                        <span>❤️ {post.likes || 0}</span>
                        <span>💬 {post.commentsCount || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Location Offers */}
          {activeTabName === 'offers' && (
            <div className="space-y-4">
              {offerPosts.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200 text-zinc-400 text-xs font-medium">
                  No active location discount offers available right now. Check back soon for live promos!
                </div>
              ) : (
                offerPosts.map((offer) => (
                  <div
                    key={offer.id}
                    className="bg-white border border-zinc-200/80 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#FF5A5F]/40 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-100 flex-shrink-0 relative">
                        <img
                          src={offer.images?.[0] || IMAGES.ramen}
                          alt="Offer deal"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-[#FFF0F1] text-[#FF5A5F] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            <span>{offer.badge || `${offer.discount_pct}% OFF TODAY`}</span>
                          </span>
                          <span className="text-[11px] font-bold text-zinc-400">{offer.venueCategory}</span>
                        </div>
                        <h4 className="font-bold text-sm text-zinc-900">{offer.venueName}</h4>
                        <p className="text-xs text-zinc-600 font-medium line-clamp-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{offer.caption || 'Special dining promotion nearby.'}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBookVenueOffer(offer.venueName, offer.venueCategory, offer.venueId)}
                      className="bg-[#FF5A5F] hover:bg-[#E0484D] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      <span>Claim & Book Table</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Reservations Tab */}
          {activeTabName === 'reservations' && (
            <div className="space-y-4">
              {reservations.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200 text-zinc-400 text-xs font-medium">
                  No active reservations booked yet. Explore venues to reserve a table or room!
                </div>
              ) : (
                reservations.map((res) => (
                  <div
                    key={res.id}
                    className="bg-white border border-zinc-200/80 rounded-3xl p-5 shadow-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-sm text-zinc-900">{res.venueName}</h4>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          res.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {res.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{res.time}</span>
                        <span>· {res.guests}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => deleteReservation(res.id)}
                      className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Other Tabs */}
          {(activeTabName === 'saved' || activeTabName === 'reviews') && (
            <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200 text-zinc-400 text-xs font-medium">
              No {activeTabName} items to display yet.
            </div>
          )}
        </div>

        {/* Right 1 Col: Achievements, Upcoming Reservations */}
        <div className="space-y-6">
          
          {/* Achievements */}
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-5 shadow-xs">
            <h4 className="font-bold text-sm text-zinc-900 mb-4">Achievements</h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-[#FFF0F1] flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-[#FFE2E4] text-[#FF5A5F] flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-zinc-900 leading-tight">Ramen Master</span>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Coffee className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-zinc-900 leading-tight">Cafe Hopper</span>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-50 flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Flag className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-zinc-900 leading-tight">Jetsetter</span>
              </div>
            </div>
          </div>

          {/* Upcoming Reservations List */}
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-5 shadow-xs">
            <h4 className="font-bold text-sm text-zinc-900 mb-4">Upcoming Reservations</h4>
            <div className="space-y-3">
              {reservations.length === 0 ? (
                <p className="text-xs text-zinc-400">No upcoming reservations.</p>
              ) : (
                reservations.slice(0, 2).map((res) => {
                  const isConfirmed = res.status === 'CONFIRMED';
                  return (
                    <div
                      key={res.id}
                      className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-bold text-xs text-zinc-900">{res.venueName}</h5>
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isConfirmed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {res.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {res.time}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

    </div>
  );
};

export default UserProfile;
