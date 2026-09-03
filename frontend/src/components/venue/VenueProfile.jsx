import React, { useState } from 'react';
import useStore, { IMAGES } from '../../store/store';
import {
  MapPin,
  Star,
  Calendar,
  Sparkles,
  Phone,
  Globe,
  Clock,
  ShieldCheck,
  Tag,
  ArrowLeft,
  Share2,
  Heart,
  MessageSquare,
  Building,
  CheckCircle2,
  Utensils
} from 'lucide-react';

const VenueProfile = () => {
  const {
    venues,
    selectedVenueId,
    setActiveTab,
    setReservationVenue,
    setIsReservationModalOpen,
    posts
  } = useStore();

  const [activeTab, setVenueTab] = useState('posts');
  const [isSaved, setIsSaved] = useState(false);

  const venue = venues.find(v => v.id === selectedVenueId) || venues[0];

  if (!venue) {
    return (
      <div className="p-8 text-center text-zinc-500 font-bold">
        Venue not found.{' '}
        <button
          onClick={() => setActiveTab('explore')}
          className="text-[#FF5A5F] underline cursor-pointer"
        >
          Return to map
        </button>
      </div>
    );
  }

  const venuePosts = posts.filter(p => p.venueId === venue.id || p.venueName === venue.name);

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] pb-16 selection:bg-[#FF5A5F] selection:text-white">
      
      {/* Header Banner */}
      <div className="relative h-72 md:h-80 w-full overflow-hidden">
        <img
          src={venue.heroImage || IMAGES.restaurantHero}
          alt={venue.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

        {/* Back Button & Share Controls */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10 max-w-5xl mx-auto">
          <button
            onClick={() => setActiveTab('explore')}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-zinc-900 shadow-md hover:bg-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center shadow-md transition-all cursor-pointer ${
                isSaved ? 'bg-[#FF5A5F] text-white' : 'bg-white/90 text-zinc-900 hover:bg-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Floating Category Tag */}
        <div className="absolute bottom-6 left-6 right-6 max-w-5xl mx-auto text-white">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5A5F] text-xs font-black uppercase tracking-wider mb-2 shadow-sm">
            <Building className="w-3.5 h-3.5" />
            <span>{venue.category || 'Hospitality'}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">{venue.name}</h1>
          <p className="text-xs md:text-sm text-zinc-200 font-medium flex items-center gap-1.5 mt-1">
            <MapPin className="w-4 h-4 text-[#FF5A5F]" />
            <span>{venue.fullAddress || venue.address}</span>
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        
        {/* Info & Action Card */}
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-4 text-sm font-bold text-zinc-700">
              <div className="flex items-center gap-1 text-amber-500 font-black">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{venue.rating || 4.8}</span>
                <span className="text-zinc-400 font-normal">({venue.reviewsCount || 120} reviews)</span>
              </div>
              <span className="text-zinc-300">·</span>
              <span className="text-zinc-900">{venue.price || '$$ · Moderate'}</span>
              <span className="text-zinc-300">·</span>
              <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Venue</span>
              </span>
            </div>
            <p className="text-sm text-zinc-500 font-medium">{venue.bio}</p>
          </div>

          <button
            onClick={() => {
              setReservationVenue(venue);
              setIsReservationModalOpen(true);
            }}
            className="bg-[#FF5A5F] hover:bg-[#E0484D] text-white font-black text-sm px-8 py-4 rounded-2xl shadow-lg shadow-[#FF5A5F]/20 hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <Calendar className="w-5 h-5" />
            <span>Book Table / Room</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-200 gap-8">
          <button
            onClick={() => setVenueTab('posts')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'posts'
                ? 'border-[#FF5A5F] text-[#FF5A5F]'
                : 'border-transparent text-zinc-500 hover:text-zinc-950'
            }`}
          >
            Community Feed & Posts ({venuePosts.length})
          </button>
          <button
            onClick={() => setVenueTab('info')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'info'
                ? 'border-[#FF5A5F] text-[#FF5A5F]'
                : 'border-transparent text-zinc-500 hover:text-zinc-950'
            }`}
          >
            Venue Details & Hours
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'posts' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {venuePosts.length > 0 ? (
              venuePosts.map(post => (
                <div key={post.id} className="bg-white border border-zinc-200/80 rounded-3xl p-5 space-y-4 shadow-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.venueAvatar || IMAGES.copperAvatar}
                      alt={post.venueName}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-200"
                    />
                    <div>
                      <h4 className="text-xs font-black text-zinc-900">{post.venueName}</h4>
                      <p className="text-[11px] text-zinc-400 font-bold">{post.timeAgo}</p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-700 font-medium leading-relaxed">{post.caption}</p>
                  {post.images && post.images.length > 0 && (
                    <div className="h-48 rounded-2xl overflow-hidden">
                      <img src={post.images[0]} alt="Post media" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-2 p-12 bg-white rounded-3xl border border-zinc-200 text-center space-y-3">
                <Utensils className="w-8 h-8 text-zinc-300 mx-auto" />
                <h3 className="text-base font-black text-zinc-900">No posts for this venue yet</h3>
                <p className="text-xs text-zinc-500 font-medium">Be the first to share an experience or deal!</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#FF5A5F] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider">Hours</h4>
                  <p className="text-xs text-zinc-500 font-bold mt-1">{venue.fullHours || 'Daily 10:00 AM - 11:00 PM'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#FF5A5F] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider">Phone</h4>
                  <p className="text-xs text-zinc-500 font-bold mt-1">{venue.phone || '+1 (555) 234-5678'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-[#FF5A5F] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider">Website</h4>
                  <p className="text-xs text-zinc-500 font-bold mt-1">{venue.website || 'godine.app'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VenueProfile;
