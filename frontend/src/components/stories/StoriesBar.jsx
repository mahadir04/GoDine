import React from 'react';
import useStore from '../../store/store';
import { Plus } from 'lucide-react';

const StoriesBar = () => {
  const { stories, setSelectedVenueId, setActiveTab } = useStore();

  const handleStoryClick = (story) => {
    if (story.isUser) return;
    if (story.name.includes('Copper')) {
      setSelectedVenueId('copper_fork');
      setActiveTab('venue_profile');
    } else if (story.name.includes('Grand Hotel') || story.name.includes('Stay')) {
      setSelectedVenueId('aura_boutique');
      setActiveTab('venue_profile');
    } else if (story.name.includes('Roast') || story.name.includes('Bean')) {
      setSelectedVenueId('bean_grind');
      setActiveTab('venue_profile');
    } else {
      setSelectedVenueId('wildflour_bakery');
      setActiveTab('venue_profile');
    }
  };

  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 mb-6 shadow-xs flex items-center gap-4 overflow-x-auto scrollbar-none">
      {stories.map((story) => (
        <div
          key={story.id}
          onClick={() => handleStoryClick(story)}
          className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0 group"
        >
          <div className="relative">
            {/* Story Gradient Ring */}
            <div
              className={`w-[66px] h-[66px] rounded-full p-[2.5px] flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${
                story.isUser
                  ? 'border-2 border-dashed border-zinc-300'
                  : 'bg-gradient-to-tr from-[#F59E0B] via-[#EC4899] to-[#EF4444]'
              }`}
            >
              <div className="w-full h-full rounded-full bg-white p-[2px] flex items-center justify-center overflow-hidden">
                <img
                  src={story.avatar}
                  alt={story.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>

            {/* Plus badge on user story */}
            {story.isUser && (
              <div className="absolute bottom-0 right-0 bg-[#FF5A5F] text-white p-0.5 rounded-full ring-2 ring-white flex items-center justify-center">
                <Plus className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          <span className="text-[11px] font-medium text-zinc-700 max-w-[70px] truncate text-center group-hover:text-zinc-950">
            {story.name}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StoriesBar;
