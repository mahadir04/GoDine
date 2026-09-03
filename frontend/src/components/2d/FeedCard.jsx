import React, { useState, useRef } from 'react';
import useStore from '../../store/store';
import { Heart, MessageCircle, Star, ShieldCheck, Share2, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

const FeedCard = ({ item }) => {
  const { setActiveVenueId, setActiveTab, setActiveDishId } = useStore();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(item.likes_count);
  const cardRef = useRef(null);

  // Parallax Depth Stacking Tilt Effect
  const [transformStyle, setTransformStyle] = useState('rotateX(0deg) rotateY(0deg)');
  const [shadowStyle, setShadowStyle] = useState('0 10px 30px -15px rgba(0,0,0,0.3)');

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    
    // Calculate rotation angles
    const rotateX = ((y / box.height) - 0.5) * -12; // tilt limit
    const rotateY = ((x / box.width) - 0.5) * 12;
    
    setTransformStyle(`rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`);
    setShadowStyle('0 20px 40px -15px rgba(59, 130, 246, 0.15)');
  };

  const handleMouseLeave = () => {
    setTransformStyle('rotateX(0deg) rotateY(0deg) scale(1)');
    setShadowStyle('0 10px 30px -15px rgba(0,0,0,0.3)');
  };

  const handleLike = (e) => {
    e.stopPropagation();
    if (liked) {
      setLiked(false);
      setLikesCount(likesCount - 1);
    } else {
      setLiked(true);
      setLikesCount(likesCount + 1);
    }
  };

  const handleCardClick = () => {
    if (item.venue) {
      setActiveVenueId(item.venue.id);
    }
  };

  const [copied, setCopied] = useState(false);

  const handleShare = (e) => {
    e.stopPropagation();
    const shareUrl = `http://geodine.app/posts/${item.post_id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 }
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="perspective-container w-full max-w-xl mx-auto mb-6">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
        style={{
          transform: transformStyle,
          boxShadow: shadowStyle,
        }}
        className="tilt-card cursor-pointer bg-zinc-900/90 border border-zinc-800 rounded-2xl overflow-hidden glass-card transition-all"
      >
        
        {/* Card Header (Venue / Author Details) */}
        <div className="p-4 flex items-center justify-between border-b border-zinc-800/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-blue-400 border border-zinc-700">
              {(item.venue?.name || 'V')[0]}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-zinc-100 hover:underline">
                  {item.venue?.name || 'Nearby Diner'}
                </span>
                {item.venue?.is_verified && (
                  <ShieldCheck className="h-4 w-4 text-blue-400" title="Verified Venue" />
                )}
              </div>
              <p className="text-xs text-zinc-500 font-mono">
                {item.venue?.category} • {item.venue?.distance_km} km away
              </p>
            </div>
          </div>
          
          {/* Post Type Badge / Promo Tags */}
          <div className="flex items-center gap-2">
            {item.discount_pct > 0 && (
              <span className="bg-rose-500/10 text-rose-400 border border-rose-800/30 text-[10px] font-bold px-2 py-0.5 rounded-full glowing-beacon-green">
                {item.discount_pct}% OFF
              </span>
            )}
            <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              item.post_type === 'PROMO' ? 'bg-amber-950/40 text-amber-400 border border-amber-800/40' :
              item.post_type === 'STORY' ? 'bg-blue-950/40 text-blue-400 border border-blue-800/40' :
              'bg-zinc-800 text-zinc-400'
            }`}>
              {item.post_type}
            </span>
          </div>
        </div>

        {/* Post Image Container */}
        {item.media_urls && item.media_urls.length > 0 && (
          <div className="relative aspect-video w-full overflow-hidden bg-zinc-950 border-b border-zinc-800/40">
            <img
              src={item.media_urls[0]}
              alt="Post media representation"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
            {/* AI Recommendation Confidence Overlay Tag */}
            <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-[10px] font-bold text-blue-300 font-mono">
                {Math.round(item.match_confidence * 100)}% Taste Match
              </span>
            </div>
          </div>
        )}

        {/* Card Body */}
        <div className="p-4">
          <p className="text-sm text-zinc-300 leading-relaxed mb-4">
            {item.content}
          </p>

          {/* Taste Alignment Tags */}
          {item.taste_alignment_tags && item.taste_alignment_tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {item.taste_alignment_tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 text-[10px] px-2 py-0.5 rounded border border-zinc-800 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between border-t border-zinc-800/40 pt-3">
            <div className="flex items-center gap-4">
              
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                  liked ? 'text-rose-500' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Heart className={`h-4.5 w-4.5 ${liked ? 'fill-current' : ''}`} />
                <span>{likesCount}</span>
              </button>

              <button
                onClick={handleCardClick}
                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <MessageCircle className="h-4.5 w-4.5" />
                <span>{item.comments_count}</span>
              </button>

              {/* 3D inspect button removed */}
            </div>

            <button
              onClick={handleShare}
              className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-all ${
                copied 
                  ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-800/30' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-4.5 w-4.5" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FeedCard;
