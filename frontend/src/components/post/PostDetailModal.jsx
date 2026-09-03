import React, { useState } from 'react';
import useStore from '../../store/store';
import {
  X,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  CheckCircle2,
  Smile,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const PostDetailModal = () => {
  const {
    posts,
    selectedPostId,
    setSelectedPostId,
    toggleLikePost,
    toggleSavePost,
    addCommentToPost,
    setSelectedVenueId,
    setActiveTab
  } = useStore();

  const [commentText, setCommentText] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!selectedPostId) return null;

  const post = posts.find((p) => p.id === selectedPostId) || posts[0];

  const handleClose = () => {
    setSelectedPostId(null);
  };

  const handleVenueClick = () => {
    handleClose();
    setSelectedVenueId(post.venueId);
    setActiveTab('venue_profile');
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addCommentToPost(post.id, commentText);
    setCommentText('');
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % post.images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + post.images.length) % post.images.length);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Close Button on top right */}
      <button
        onClick={handleClose}
        className="absolute top-6 right-6 text-white hover:text-zinc-300 p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer z-50"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Modal Card Container */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col md:flex-row animate-modal border border-zinc-200"
      >
        {/* Left Side: Media Carousel */}
        <div className="relative w-full md:w-[60%] bg-black flex items-center justify-center select-none aspect-square md:aspect-auto">
          <img
            src={post.images[activeImageIndex] || post.images[0]}
            alt={post.venueName}
            className="w-full h-full object-cover max-h-[85vh]"
          />

          {/* Floating Badge */}
          {post.badge && (
            <div className="absolute top-4 left-4 bg-[#FF5A5F] text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md z-10">
              {post.badge}
            </div>
          )}

          {/* Carousel Arrows */}
          {post.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-zinc-900 flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-zinc-900 flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              {/* Pagination Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                {post.images.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === activeImageIndex ? 'bg-white scale-125' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Side: Header, Caption & Scrollable Comments Stream */}
        <div className="w-full md:w-[40%] flex flex-col justify-between bg-white h-[500px] md:h-auto max-h-[85vh]">
          
          {/* Header */}
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={handleVenueClick}>
              <img
                src={post.venueAvatar}
                alt={post.venueName}
                className="w-10 h-10 rounded-full object-cover ring-1 ring-zinc-200"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-[14px] text-zinc-900 hover:underline">
                    {post.venueName}
                  </h4>
                  {post.verified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500 text-white" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 font-medium">
                  {post.venueDistance} · {post.venueCategory}
                </p>
              </div>
            </div>

            <button className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Comments and Caption Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* Main Caption as First Item */}
            <div className="flex items-start gap-3 pb-3 border-b border-zinc-50">
              <img
                src={post.venueAvatar}
                alt={post.venueName}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-zinc-200 mt-0.5 flex-shrink-0"
              />
              <div className="flex-1">
                <p className="leading-relaxed">
                  <span className="font-bold text-zinc-900 mr-1.5">{post.venueName.toLowerCase().replace(/\s+/g, '')}</span>
                  <span className="text-zinc-700">{post.caption}</span>
                </p>
                <span className="text-[11px] text-zinc-400 mt-1 block">2 hours ago</span>
              </div>
            </div>

            {/* List of comments */}
            {post.comments.map((c) => (
              <div key={c.id} className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={c.avatar}
                      alt={c.user}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-zinc-200 mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="leading-relaxed">
                        <span className="font-bold text-zinc-900 mr-1.5">{c.user}</span>
                        <span className="text-zinc-700">{c.text}</span>
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1 font-medium">
                        <span>{c.time}</span>
                        <button className="font-bold hover:text-zinc-700">Reply</button>
                        <span>{c.likes} likes</span>
                      </div>
                    </div>
                  </div>

                  <button className="text-zinc-400 hover:text-rose-500 pt-1">
                    <Heart className={`w-3.5 h-3.5 ${c.liked ? 'text-rose-500 fill-rose-500' : ''}`} />
                  </button>
                </div>

                {/* Nested Reply if any */}
                {c.reply && (
                  <div className="ml-11 flex items-start gap-2.5 pt-1">
                    <img
                      src={c.reply.avatar}
                      alt={c.reply.user}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-zinc-200 mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="leading-relaxed">
                        <span className="font-bold text-zinc-900 mr-1.5">{c.reply.user}</span>
                        <span className="text-zinc-700">{c.reply.text}</span>
                      </p>
                      <span className="text-[10px] text-zinc-400 mt-0.5 block">{c.reply.time}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Actions & Comment Box */}
          <div className="p-4 border-t border-zinc-100 bg-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleLikePost(post.id)}
                  className="cursor-pointer active:scale-125 transition-transform"
                >
                  <Heart
                    className={`w-6 h-6 ${
                      post.liked ? 'text-[#FF5A5F] fill-[#FF5A5F]' : 'text-zinc-800 hover:text-zinc-500'
                    }`}
                  />
                </button>
                <button className="text-zinc-800 hover:text-zinc-500">
                  <MessageCircle className="w-6 h-6" />
                </button>
                <button className="text-zinc-800 hover:text-zinc-500">
                  <Send className="w-5.5 h-5.5 -rotate-12" />
                </button>
              </div>

              <button onClick={() => toggleSavePost(post.id)}>
                <Bookmark className={`w-6 h-6 ${post.saved ? 'text-zinc-950 fill-zinc-950' : 'text-zinc-800'}`} />
              </button>
            </div>

            <p className="text-[13px] font-bold text-zinc-900 mb-1">
              {post.likes.toLocaleString()} people liked this
            </p>
            <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider mb-3">
              {post.timeAgo}
            </p>

            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-2 border-t border-zinc-100">
              <Smile className="w-5 h-5 text-zinc-400 hover:text-zinc-600 cursor-pointer" />
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 text-xs text-zinc-800 placeholder-zinc-400 bg-transparent focus:outline-none"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className={`text-xs font-bold ${
                  commentText.trim() ? 'text-[#FF5A5F] cursor-pointer hover:text-[#E0484D]' : 'text-zinc-300'
                }`}
              >
                Post
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;
