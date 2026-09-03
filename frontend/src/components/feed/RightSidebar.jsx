import React from 'react';
import useStore from '../../store/store';
import { Edit3, CheckCircle2, Clock } from 'lucide-react';

const RightSidebar = () => {
  const {
    currentUser,
    suggestedVenues,
    toggleFollowSuggested,
    reservations,
    setSelectedVenueId,
    setActiveTab,
    setReservationVenue,
    setIsReservationModalOpen
  } = useStore();

  return (
    <aside className="w-80 h-screen sticky top-0 py-6 px-4 hidden xl:block select-none overflow-y-auto scrollbar-none">
      {/* 1. User Header Mini Profile */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 mb-6 shadow-xs">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
              alt={currentUser?.name || 'User'}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-zinc-100"
            />
            <div>
              <h3 className="font-bold text-[15px] text-zinc-900 leading-tight">
                {currentUser?.name || 'Explorer'}
              </h3>
              <p className="text-[12px] text-zinc-400 font-medium">
                {currentUser?.handle || '@user'} <span className="text-[#FF5A5F] font-semibold">· {currentUser?.role || 'DINER'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('profile')}
            className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-around pt-3 border-t border-zinc-100 text-center">
          <div>
            <span className="block text-[14px] font-bold text-zinc-900">{currentUser?.followingCount || 0}</span>
            <span className="text-[11px] text-zinc-400 font-medium">Following</span>
          </div>
          <div className="h-6 w-[1px] bg-zinc-100" />
          <div>
            <span className="block text-[14px] font-bold text-zinc-900">{currentUser?.followersCount || '0'}</span>
            <span className="text-[11px] text-zinc-400 font-medium">Followers</span>
          </div>
        </div>
      </div>

      {/* 2. Suggested for you Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <h4 className="font-bold text-[13px] text-zinc-900">Suggested for you</h4>
          <button 
            onClick={() => setActiveTab('explore')}
            className="text-[12px] font-bold text-zinc-400 hover:text-zinc-700 cursor-pointer"
          >
            See all
          </button>
        </div>

        <div className="space-y-3">
          {(suggestedVenues || []).map((venue) => (
            <div
              key={venue.id}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-100/70 transition-colors"
            >
              <div 
                className="flex items-center gap-2.5 cursor-pointer"
                onClick={() => {
                  setSelectedVenueId(venue.id);
                  setActiveTab('venue_profile');
                }}
              >
                <img
                  src={venue.avatar}
                  alt={venue.name}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-zinc-200"
                />
                <div>
                  <h5 className="font-bold text-[13px] text-zinc-900 leading-tight hover:underline">
                    {venue.name}
                  </h5>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    <span className="text-amber-500 font-semibold">{venue.stars}</span>
                    <span className="mx-1">·</span>
                    <span>{venue.distance}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => toggleFollowSuggested(venue.id)}
                className={`text-[12px] font-bold px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  venue.following
                    ? 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
                    : 'text-[#FF5A5F] hover:bg-[#FFF0F1]'
                }`}
              >
                {venue.following ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Your Reservations Section */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs">
        <h4 className="font-bold text-[13px] text-zinc-900 mb-3">Your Reservations</h4>

        <div className="space-y-3">
          {(reservations || []).map((res) => {
            const isConfirmed = res.status === 'CONFIRMED';
            return (
              <div
                key={res.id}
                className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 hover:border-zinc-200 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <h5 className="font-bold text-[13px] text-zinc-900">{res.venueName}</h5>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                      isConfirmed
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isConfirmed ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {res.status}
                  </span>
                </div>
                <p className="text-[12px] text-zinc-500 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  {res.time}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
