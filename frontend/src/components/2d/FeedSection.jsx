import React, { useState, useEffect } from 'react';
import useStore from '../../store/store';
import FeedCard from './FeedCard';
import axios from 'axios';
import { Search, Compass, SlidersHorizontal, MapPin } from 'lucide-react';

const CATEGORIES = [
  { id: 'ALL', label: 'All Places' },
  { id: 'RESTAURANT', label: 'Restaurants' },
  { id: 'CAFE', label: 'Cafés' },
  { id: 'BAKERY', label: 'Bakeries' },
  { id: 'HOTEL', label: 'Hotels' },
  { id: 'MOTEL', label: 'Motels' },
  { id: 'RESTHOUSE', label: 'Resthouses' },
  { id: 'LOUNGE', label: 'Lounges' },
];

const FeedSection = () => {
  const { coordinates, radius, setRadius, category, setCategory, searchQuery, setSearchQuery, token } = useStore();
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load feed items from API
  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:8000/api/v1/feed', {
          params: {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            radius_km: radius,
            page: 1,
            limit: 20
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Filter by category client-side if not ALL
        let items = response.data;
        if (category !== 'ALL') {
          items = items.filter(item => item.venue?.category === category);
        }
        // Filter by text search query
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          items = items.filter(item => 
            (item.content || '').toLowerCase().includes(q) || 
            (item.venue?.name || '').toLowerCase().includes(q)
          );
        }

        setFeedItems(items);
      } catch (err) {
        console.error("Error fetching feed: ", err);
        setError("Failed to fetch live feed. Rendering local cache.");
        // Fallback mock data in case backend server is loading or offline
        generateFallbackFeed();
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchFeed();
    }
  }, [coordinates, radius, category, searchQuery, token]);

  const generateFallbackFeed = () => {
    const mockItems = [
      {
        post_id: "8f3b6c20-1a2b-4e89-91f1-3cf938472a11",
        venue: {
          id: "e4a2e1d0-9999-4c12-8822-123456789abc",
          name: "Artisan Smokehouse & Bistro",
          category: "RESTAURANT",
          distance_km: 1.42,
          is_verified: true
        },
        post_type: "PROMO",
        content: "Smoked Brisket platters fresh off the pit today! Flash 20% discount until 9 PM. Mutton is juicy.",
        media_urls: ["https://images.unsplash.com/photo-1544025162-d76694265947"],
        match_confidence: 0.964,
        taste_alignment_tags: ["Smoked BBQ", "High Protein", "Evening Dinner", "20% Off"],
        likes_count: 142,
        comments_count: 12,
        created_at: new Date()
      },
      {
        post_id: "71fb62a0-43b8-40a1-89e4-182390abc120",
        venue: {
          id: "d9a3f2b0-8888-4c12-9922-ab829cd1234a",
          name: "Espresso Lounge & Café",
          category: "CAFE",
          distance_km: 0.85,
          is_verified: true
        },
        post_type: "STORY",
        content: "Fresh coffee beans brewing at Espresso Lounge! Stop by for a quiet rooftop afternoon vibe.",
        media_urls: ["https://images.unsplash.com/photo-1509042239860-f550ce710b93"],
        match_confidence: 0.88,
        taste_alignment_tags: ["Quiet Vibe", "Coffee & Chill"],
        likes_count: 98,
        comments_count: 8,
        created_at: new Date()
      }
    ];
    
    let items = mockItems;
    if (category !== 'ALL') {
      items = items.filter(item => item.venue.category === category);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(item => 
        (item.content || '').toLowerCase().includes(q) || 
        (item.venue.name || '').toLowerCase().includes(q)
      );
    }
    setFeedItems(items);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto p-6">
      
      {/* Left Sidebar controls */}
      <div className="w-full lg:w-1/4 flex flex-col gap-6">
        
        {/* Spatial control card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal className="h-4 w-4 text-blue-500" />
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Spatial Range</h2>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
              <span>Geospatial Radius</span>
              <span className="font-bold text-blue-400 font-mono">{radius.toFixed(1)} km</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="15.0"
              step="0.5"
              value={radius}
              onChange={(e) => setRadius(parseFloat(e.target.value))}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-600 font-mono mt-1">
              <span>1 km</span>
              <span>8 km</span>
              <span>15 km</span>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4.5 w-4.5 text-zinc-400" />
              <span className="text-xs text-zinc-300 font-medium">Coordinate Center</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed font-mono">
              Displaying posts and verified menus within travel isochrones.
            </p>
          </div>
        </div>

        {/* Categories panel */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 px-2">Filter Places</h2>
          <div className="flex flex-col gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  category === cat.id
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-800/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Main Feed Content */}
      <div className="w-full lg:w-3/4 flex flex-col gap-6">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search kacchi biryani, cozy rooftops, smoking briskets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500/80 transition-all shadow-md"
          />
        </div>

        {/* Loading / Error / Feed Loop */}
        {loading ? (
          <div className="flex flex-col gap-6 max-w-xl mx-auto w-full">
            {[1, 2].map((i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shimmer-anim h-[400px]"></div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {feedItems.length > 0 ? (
              feedItems.map((item) => (
                <FeedCard key={item.post_id} item={item} />
              ))
            ) : (
              <div className="text-center py-16 bg-zinc-900/40 border border-zinc-800/60 rounded-2xl max-w-xl mx-auto w-full">
                <Compass className="h-10 w-10 text-zinc-600 mx-auto mb-3 animate-spin-slow" />
                <h3 className="text-sm font-bold text-zinc-300">No restaurants nearby</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Try extending your search radius slider or clear category filters.
                </p>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};

export default FeedSection;
