import React from 'react';
import useStore from '../../store/store';
import StoriesBar from '../stories/StoriesBar';
import PostCard from './PostCard';
import { Utensils, RefreshCw, PlusCircle } from 'lucide-react';

const HomeFeed = () => {
  const { posts, isLoadingBackend, fetchInitialData, setIsCreatePostOpen, currentUser } = useStore();

  return (
    <div className="max-w-[620px] w-full mx-auto py-6 px-4">
      {/* Top Stories Row */}
      <StoriesBar />

      {/* Loading State */}
      {isLoadingBackend && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <RefreshCw className="w-8 h-8 text-[#FF5A5F] animate-spin" />
          <p className="text-zinc-500 text-sm font-medium">Loading your personalized feed…</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoadingBackend && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
          <div className="w-20 h-20 rounded-full bg-[#FFF0F1] flex items-center justify-center">
            <Utensils className="w-9 h-9 text-[#FF5A5F]" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 text-lg mb-1">No posts yet</h3>
            <p className="text-zinc-500 text-sm max-w-[280px] leading-relaxed">
              Be the first to share a location update, deal, or dining experience!
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full max-w-[240px]">
            <button
              onClick={() => setIsCreatePostOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-[#FF5A5F] hover:bg-[#E0484D] text-white text-sm font-bold py-2.5 rounded-full shadow-sm transition-transform hover:scale-105 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Create a Post
            </button>
            <button
              onClick={fetchInitialData}
              className="w-full flex items-center justify-center gap-2 text-zinc-600 hover:text-zinc-900 text-sm font-medium py-2.5 rounded-full border border-zinc-200 hover:bg-zinc-50 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Feed
            </button>
          </div>
        </div>
      )}

      {/* Posts Stream */}
      {!isLoadingBackend && posts.length > 0 && (
        <div className="space-y-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeFeed;
