import React, { useState } from 'react';
import useStore from '../../store/store';
import {
  Calendar,
  Tag,
  CheckCircle2,
  Heart,
  MessageCircle,
  UserPlus,
  Music
} from 'lucide-react';

const NOTIF_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'likes', label: 'Likes & Comments' },
  { id: 'reservations', label: 'Reservations' },
  { id: 'deals', label: 'Deals' },
  { id: 'follows', label: 'Follows' },
];

const NotificationsPage = () => {
  const { notifications, setSelectedVenueId, setActiveTab, setSelectedPostId, posts } = useStore();
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredNotifs = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'likes' && (n.type === 'like' || n.type === 'comment' || n.type === 'mention')) return true;
    if (activeFilter === 'reservations' && (n.type === 'reservation_confirmed' || n.type === 'reservation_reminder')) return true;
    if (activeFilter === 'deals' && n.type === 'deal') return true;
    if (activeFilter === 'follows' && n.type === 'follow') return true;
    return true;
  });

  const sections = ['NEW', 'TODAY', 'THIS WEEK'];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 md:px-8 select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-zinc-900">Notifications</h1>
        <button className="text-xs font-bold text-[#FF5A5F] hover:underline cursor-pointer">
          Mark all as read
        </button>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
        {NOTIF_FILTERS.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`text-xs font-bold px-4 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Grouped Notifications List */}
      <div className="space-y-8">
        {sections.map((section) => {
          const sectionNotifs = filteredNotifs.filter((n) => n.section === section);
          if (sectionNotifs.length === 0) return null;

          return (
            <div key={section}>
              <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-wider mb-3 px-1">
                {section}
              </h3>

              <div className="bg-white border border-zinc-200/80 rounded-3xl divide-y divide-zinc-100 shadow-xs overflow-hidden">
                {sectionNotifs.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-zinc-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 overflow-hidden">
                      {/* Avatar or Icon */}
                      {item.avatar ? (
                        <img
                          src={item.avatar}
                          alt="Notif avatar"
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-zinc-200 flex-shrink-0"
                        />
                      ) : item.type === 'reservation_confirmed' ? (
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5" />
                        </div>
                      ) : item.type === 'deal' ? (
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                          <Tag className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                          <Music className="w-5 h-5" />
                        </div>
                      )}

                      {/* Text */}
                      <div className="text-xs text-zinc-700 leading-relaxed">
                        <span className="font-bold text-zinc-900 mr-1.5">
                          {item.user || item.venue}
                        </span>
                        <span>{item.action}</span>
                        <span className="text-[11px] text-zinc-400 font-medium ml-2">
                          {item.time}
                        </span>
                      </div>
                    </div>

                    {/* Right side Thumbnail or Action Button */}
                    {item.thumb ? (
                      <img
                        src={item.thumb}
                        alt="Post thumb"
                        onClick={() => setSelectedPostId(posts[0]?.id || 'p1')}
                        className="w-10 h-10 rounded-xl object-cover flex-shrink-0 cursor-pointer shadow-xs"
                      />
                    ) : item.btnText ? (
                      <button
                        onClick={() => {
                          if (item.type === 'deal' || item.type === 'reservation_confirmed') {
                            setSelectedVenueId('copper_fork');
                            setActiveTab('venue_profile');
                          }
                        }}
                        className={`text-xs font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                          item.btnText === 'View Deal'
                            ? 'bg-[#FF5A5F] hover:bg-[#E0484D] text-white shadow-xs'
                            : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                        }`}
                      >
                        {item.btnText}
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default NotificationsPage;
