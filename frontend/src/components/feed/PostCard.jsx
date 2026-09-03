import React, { useState } from 'react';
import useStore, { IMAGES } from '../../store/store';
import {
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  MapPin,
  Star,
  CheckCircle2,
  Calendar,
  Sparkles,
  Tag,
  Send
} from 'lucide-react';

const PostCard = ({ post }) => {
  const {
    setSelectedVenueId,
    setActiveTab,
    setReservationVenue,
    setIsReservationModalOpen,
    venues,
    setSelectedPostId
  } = useStore();

  const [liked, setLiked] = useState(post?.liked || false);
  const [likesCount, setLikesCount] = useState(post?.likes || 0);
  const [saved, setSaved] = useState(post?.saved || false);

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikesCount(prev => prev - 1);
    } else {
      setLiked(true);
      setLikesCount(prev => prev + 1);
    }
  };

  const handleVenueClick = () => {
    if (post?.venueId) {
      setSelectedVenueId(post.venueId);
      setActiveTab('venue_profile');
    }
  };

  const matchingVenue = venues.find(v => v.id === post?.venueId || v.name === post?.venueName);

  return (
    <div className="bg-white border border-zinc-200/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 mb-6 selection:bg-[#FF5A5F] selection:text-white">
      
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-zinc-100">
        <div
          onClick={handleVenueClick}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img
            src={post?.venueAvatar || IMAGES.copperAvatar}
            alt={post?.venueName}
            className="w-10 h-10 rounded-full object-cover border border-zinc-200 group-hover:scale-105 transition-transform"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black text-zinc-900 group-hover:text-[#FF5A5F] transition-colors">
                {post?.venueName || 'Hospitality Venue'}
              </h3>
              {post?.verified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
            </div>
            <p className="text-[11px] text-zinc-400 font-bold flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#FF5A5F]" />
              <span>{post?.venueDistance || 'Near location'}</span>
            </p>
          </div>
        </div>

        {/* Badge or Discount Tag */}
        {post?.badge && (
          <span className="bg-[#FFF0F1] text-[#FF5A5F] border border-[#FF5A5F]/20 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
            <Tag className="w-3 h-3" />
            <span>{post.badge}</span>
          </span>
        )}
      </div>

      {/* Media Image */}
      {post?.images && post.images.length > 0 && (
        <div
          onClick={() => setSelectedPostId(post.id)}
          className="relative h-72 sm:h-96 w-full overflow-hidden bg-zinc-900 cursor-pointer group"
        >
          <img
            src={post.images[0]}
            alt="Post content"
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          />
        </div>
      )}

      {/* Actions Bar */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                liked ? 'text-rose-500 scale-105' : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-rose-500' : ''}`} />
              <span>{likesCount}</span>
            </button>

            <button
              onClick={() => setSelectedPostId(post.id)}
              className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-950 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-5 h-5" />
              <span>{post?.commentsCount || 0}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSaved(!saved)}
              className={`text-xs font-bold transition-all cursor-pointer ${
                saved ? 'text-[#FF5A5F]' : 'text-zinc-400 hover:text-zinc-950'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${saved ? 'fill-[#FF5A5F]' : ''}`} />
            </button>

            {matchingVenue && (
              <button
                onClick={() => {
                  setReservationVenue(matchingVenue);
                  setIsReservationModalOpen(true);
                }}
                className="bg-[#FF5A5F] hover:bg-[#E0484D] text-white text-xs font-black px-3.5 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book</span>
              </button>
            )}
          </div>
        </div>

        {/* Caption */}
        {post?.caption && (
          <p className="text-xs text-zinc-700 font-medium leading-relaxed">
            <span className="font-extrabold text-zinc-950 mr-1.5">{post.venueName}:</span>
            {post.caption}
          </p>
        )}
      </div>

    </div>
  );
};

export default PostCard;
