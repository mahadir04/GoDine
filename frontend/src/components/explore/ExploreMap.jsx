import React, { useState, useEffect } from 'react';
import useStore, { IMAGES } from '../../store/store';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { osmAPI, geoapifyAPI } from '../../services/api';
import {
  Search,
  MapPin,
  LayoutGrid,
  Map as MapIcon,
  Utensils,
  Hotel,
  Coffee,
  Croissant,
  Tag,
  Sparkles,
  Maximize2,
  Minimize2,
  Building,
  Loader2,
  Compass
} from 'lucide-react';

// Custom Map Marker Generator for Leaflet
const createCustomMarkerIcon = (category, isPost = false) => {
  let bgColor = '#FF5A5F'; // Restaurant / default coral
  let emoji = '🍽️';

  const catLower = (category || '').toLowerCase();
  if (isPost) {
    bgColor = '#EC4899';
    emoji = '📸';
  } else if (catLower.includes('hotel')) {
    bgColor = '#3B82F6';
    emoji = '🏨';
  } else if (catLower.includes('motel')) {
    bgColor = '#8B5CF6';
    emoji = '🚗';
  } else if (catLower.includes('resthouse') || catLower.includes('guest_house')) {
    bgColor = '#10B981';
    emoji = '🏡';
  } else if (catLower.includes('cafe') || catLower.includes('coffee')) {
    bgColor = '#F59E0B';
    emoji = '☕';
  } else if (catLower.includes('bakery')) {
    bgColor = '#F97316';
    emoji = '🥐';
  }

  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background: ${bgColor};
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 4px 14px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: transform 0.2s ease;
        font-size: 16px;
      ">
        ${emoji}
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });
};

// Map Recenter Helper Component
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const CATEGORY_PILLS = [
  { id: 'all', label: 'All', icon: null },
  { id: 'restaurants', label: 'Restaurants', icon: Utensils },
  { id: 'hotels', label: 'Hotels', icon: Hotel },
  { id: 'motels', label: 'Motels', icon: Building },
  { id: 'resthouses', label: 'Resthouses', icon: Building },
  { id: 'cafes', label: 'Cafes', icon: Coffee },
  { id: 'bakeries', label: 'Bakeries', icon: Croissant },
  { id: 'deals', label: 'Deals Nearby', icon: Tag },
];

const ExploreMap = () => {
  const {
    venues,
    setSelectedVenueId,
    setActiveTab,
    posts,
    setSelectedPostId,
    setReservationVenue,
    setIsReservationModalOpen,
    fetchInitialData,
    fetchNearbyVenues
  } = useStore();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [isFullMap, setIsFullMap] = useState(false);
  const [mapCenter, setMapCenter] = useState([23.7770, 90.3990]);
  const [isLocating, setIsLocating] = useState(false);
  const [userGps, setUserGps] = useState(null);
  const [osmSpots, setOsmSpots] = useState([]);
  const [gpsStatus, setGpsStatus] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Real GPS Location Trigger for "Near Me"
  const handleNearMeClick = () => {
    setIsLocating(true);
    setGpsStatus('Requesting GPS location...');

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserGps({ lat, lng });
        setMapCenter([lat, lng]);
        setGpsStatus('GPS Found! Querying Geoapify Places API...');

        try {
          // Query Geoapify Places API v2 using API Key
          const geoPlaces = await geoapifyAPI.getNearbyPlacesGeoapify(lat, lng, 3000);
          if (geoPlaces && geoPlaces.length > 0) {
            const formattedGeo = geoPlaces.map((g, idx) => ({
              id: `geo_${idx}`,
              name: g.name,
              category: g.category,
              address: g.address,
              latitude: g.lat,
              longitude: g.lon,
              distance: `${(g.distanceMeters / 1000).toFixed(1)} km away`,
              verified: true,
              rating: 4.8,
              reviewsCount: 22,
              hours: 'Open Daily',
              fullAddress: g.address,
              avatar: g.category === 'Hotel' ? IMAGES.auraAvatar : g.category === 'Cafe' ? IMAGES.beanAvatar : IMAGES.copperAvatar,
              heroImage: g.category === 'Hotel' ? IMAGES.hotelPool : g.category === 'Cafe' ? IMAGES.coffee : IMAGES.restaurantHero,
              bio: `Geoapify Place: ${g.address}`
            }));
            setOsmSpots(formattedGeo);
            setGpsStatus(`Found ${geoPlaces.length} real Geoapify places near your GPS!`);
          } else {
            if (typeof fetchNearbyVenues === 'function') {
              fetchNearbyVenues(lat, lng, 10);
            }
            setGpsStatus('Located nearby venues on map.');
          }
        } catch (err) {
          console.warn('Geoapify fetch notice:', err);
          if (typeof fetchNearbyVenues === 'function') {
            fetchNearbyVenues(lat, lng, 10);
          }
          setGpsStatus('Located nearby venues on map.');
        }

        setIsLocating(false);
      },
      (error) => {
        console.warn('GPS location error:', error.message);
        setGpsStatus('GPS denied/unavailable. Using default location.');
        setMapCenter([23.7770, 90.3990]);
        if (typeof fetchNearbyVenues === 'function') {
          fetchNearbyVenues(23.7770, 90.3990, 10);
        }
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Combine database venues with real OpenStreetMap / Geoapify spots
  const allMapVenues = [
    ...(venues || []),
    ...(osmSpots || []).map((spot, idx) => {
      const catStr = spot.category || 'Restaurant';
      const catFormatted = catStr.charAt(0).toUpperCase() + catStr.slice(1).toLowerCase();
      const catUpper = catStr.toUpperCase();
      return {
        id: spot.id || `spot_${idx}`,
        name: spot.name || 'Hospitality Destination',
        category: catFormatted,
        verified: true,
        rating: spot.rating || 4.6,
        reviewsCount: spot.reviewsCount || 38,
        distance: spot.distance || 'Near location',
        latitude: spot.latitude,
        longitude: spot.longitude,
        address: spot.address || spot.fullAddress || 'Nearby location',
        fullAddress: spot.fullAddress || spot.address || 'Nearby location',
        hours: 'Open Daily',
        fullHours: 'Daily · 10 AM - 11 PM',
        price: spot.price_tier === 3 ? '$$$ · Premium' : '$$ · Moderate',
        phone: '(555) 019-2837',
        website: 'geodine.com',
        postsCount: 5,
        followersCount: '5.2k',
        followingCount: 20,
        avatar: catUpper.includes('HOTEL') ? IMAGES.auraAvatar : catUpper.includes('CAFE') ? IMAGES.beanAvatar : IMAGES.copperAvatar,
        heroImage: catUpper.includes('HOTEL') ? IMAGES.hotelPool : catUpper.includes('CAFE') ? IMAGES.coffee : IMAGES.restaurantHero,
        bio: spot.bio || spot.description || 'Verified location',
        liveDeal: catUpper.includes('RESTAURANT') ? { title: '10% off today', subtitle: 'Special Deal' } : null
      };
    })
  ];

  // Filter venues according to category and search query
  const filteredVenues = allMapVenues.filter((v) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = v.name.toLowerCase().includes(q);
    const catMatch = (v.category || '').toLowerCase().includes(q);
    const addrMatch = (v.address || '').toLowerCase().includes(q);
    if (searchQuery && !(nameMatch || catMatch || addrMatch)) return false;

    if (activeCategory === 'all') return true;
    const catLower = (v.category || '').toLowerCase();
    if (activeCategory === 'restaurants' && catLower.includes('restaurant')) return true;
    if (activeCategory === 'hotels' && catLower.includes('hotel')) return true;
    if (activeCategory === 'motels' && catLower.includes('motel')) return true;
    if (activeCategory === 'resthouses' && catLower.includes('resthouse')) return true;
    if (activeCategory === 'cafes' && catLower.includes('cafe')) return true;
    if (activeCategory === 'bakeries' && catLower.includes('bakery')) return true;
    if (activeCategory === 'deals' && v.liveDeal) return true;
    return false;
  });

  const handleReserve = (venue, e) => {
    e?.stopPropagation();
    setReservationVenue({
      id: venue.id,
      name: venue.name,
      category: venue.category
    });
    setIsReservationModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 md:px-8">
      
      {/* 1. Search Bar & Controls Row */}
      <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
        {/* Search Input Box */}
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search venues, hotels, motels, cuisines, cities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-100 hover:bg-zinc-200/60 focus:bg-white text-[14px] text-zinc-900 placeholder-zinc-400 pl-11 pr-4 py-2.5 rounded-full border border-transparent focus:border-zinc-300 focus:outline-none transition-all"
          />
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <button 
            onClick={handleNearMeClick}
            disabled={isLocating}
            className="flex items-center gap-1.5 bg-[#FFF0F1] hover:bg-[#FFE2E4] text-[#FF5A5F] text-[13px] font-bold px-4 py-2.5 rounded-full transition-all cursor-pointer shadow-2xs"
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#FF5A5F]" />
            ) : (
              <MapPin className="w-4 h-4 text-[#FF5A5F]" />
            )}
            <span>{isLocating ? 'Locating...' : 'Near me'}</span>
          </button>

          <div className="flex items-center bg-zinc-100 p-1 rounded-full border border-zinc-200/60">
            <button
              onClick={() => { setViewMode('grid'); setIsFullMap(false); }}
              className={`flex items-center gap-1.5 text-[12px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                viewMode === 'grid' && !isFullMap
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => { setViewMode('map'); setIsFullMap(true); }}
              className={`flex items-center gap-1.5 text-[12px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                viewMode === 'map' || isFullMap
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* GPS Status Toast */}
      {gpsStatus && (
        <div className="mb-3 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold flex items-center justify-between shadow-xs">
          <span>📍 {gpsStatus}</span>
          <button onClick={() => setGpsStatus('')} className="text-zinc-400 hover:text-white">✕</button>
        </div>
      )}

      {/* 2. Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {CATEGORY_PILLS.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 text-[13px] font-bold px-4 py-2 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Real Interactive Leaflet Map with Live Pins */}
      <div className={`relative w-full rounded-3xl overflow-hidden mb-8 shadow-md border border-zinc-200 transition-all duration-300 ${
        isFullMap ? 'h-[600px]' : 'h-64 md:h-80'
      }`}>
        
        {/* Map Top Badge */}
        <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-xs px-4 py-2 rounded-2xl shadow-lg border border-zinc-200/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A5F] map-dot-pulse" />
            <h4 className="text-[13px] font-bold text-zinc-900">
              {filteredVenues.length} spots (100% Free OpenStreetMap)
            </h4>
          </div>
          <p className="text-[11px] text-zinc-500 font-medium pl-4.5">Interactive Live GPS & Overpass API</p>
        </div>

        {/* Toggle Full Map Button */}
        <button
          onClick={() => setIsFullMap(!isFullMap)}
          className="absolute top-4 right-4 z-[1000] bg-white hover:bg-zinc-50 text-zinc-900 text-[12px] font-bold px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer border border-zinc-200"
        >
          {isFullMap ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          <span>{isFullMap ? 'Minimize' : 'Open Full Map'}</span>
        </button>

        {/* Leaflet Interactive Map */}
        <MapContainer
          center={mapCenter}
          zoom={14}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          <ChangeView center={mapCenter} zoom={isFullMap ? 15 : 14} />

          {/* Clean CartoDB Voyager Map Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* User GPS Location Marker */}
          {userGps && (
            <Marker
              position={[userGps.lat, userGps.lng]}
              icon={L.divIcon({
                className: 'user-gps-pin',
                html: `<div style="background: #3B82F6; width: 24px; height: 24px; border-radius: 50%; border: 4px solid white; box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3);"></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              })}
            >
              <Popup>
                <div className="p-1 font-bold text-xs">📍 You are here!</div>
              </Popup>
            </Marker>
          )}

          {/* Render Venue Markers */}
          {filteredVenues.map((v) => {
            const lat = v.latitude || 23.7760;
            const lng = v.longitude || 90.3980;

            return (
              <Marker
                key={`venue_${v.id}`}
                position={[lat, lng]}
                icon={createCustomMarkerIcon(v.category, false)}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-1 max-w-[200px] text-left">
                    <img
                      src={v.heroImage || IMAGES.restaurantHero}
                      alt={v.name}
                      className="w-full h-24 rounded-xl object-cover mb-2"
                    />
                    <span className="bg-[#FFF0F1] text-[#FF5A5F] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                      {v.category}
                    </span>
                    <h5 className="font-bold text-xs text-zinc-900 mt-1 truncate">{v.name}</h5>
                    <p className="text-[10px] text-zinc-500 truncate">{v.address}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100">
                      <span className="text-[11px] font-bold text-amber-500">★ {v.rating}</span>
                      <button
                        onClick={() => {
                          setSelectedVenueId(v.id);
                          setActiveTab('venue_profile');
                        }}
                        className="bg-zinc-950 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg hover:bg-zinc-800"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Render Post Markers on Real Map */}
          {posts.map((p) => {
            if (!p.latitude || !p.longitude) return null;
            return (
              <Marker
                key={`post_${p.id}`}
                position={[p.latitude + 0.001, p.longitude + 0.001]}
                icon={createCustomMarkerIcon(p.venueCategory, true)}
              >
                <Popup>
                  <div className="p-1 max-w-[200px]">
                    <img
                      src={p.images[0]}
                      alt="Post"
                      className="w-full h-24 rounded-xl object-cover mb-2"
                    />
                    <p className="text-[10px] font-bold text-zinc-900 truncate">{p.venueName}</p>
                    <p className="text-[9px] text-zinc-600 line-clamp-2">{p.caption}</p>
                    <button
                      onClick={() => setSelectedPostId(p.id)}
                      className="w-full bg-[#FF5A5F] text-white text-[10px] font-bold py-1 rounded-lg mt-2"
                    >
                      View Post
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* 4. Trending this week Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-zinc-900">Trending this week</h3>
          <span className="text-xs text-zinc-400 font-medium">
            Showing {filteredVenues.length} results
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredVenues.slice(0, 4).map((venue) => (
            <div
              key={venue.id}
              onClick={() => {
                setSelectedVenueId(venue.id);
                setActiveTab('venue_profile');
              }}
              className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
                <img
                  src={venue.heroImage}
                  alt={venue.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs text-zinc-900 text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-xs">
                  {venue.category}
                </span>
              </div>

              <div className="p-3.5">
                <h4 className="font-bold text-[14px] text-zinc-900 group-hover:text-[#FF5A5F] transition-colors truncate">
                  {venue.name}
                </h4>
                <p className="text-[12px] text-zinc-500 font-medium mt-1 flex items-center justify-between">
                  <span className="text-amber-500 font-bold">★ {venue.rating}</span>
                  <span>{venue.distance}</span>
                </p>

                <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-700">{venue.price}</span>
                  <button
                    onClick={(e) => handleReserve(venue, e)}
                    className="text-[11px] font-bold text-[#FF5A5F] hover:underline"
                  >
                    Reserve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Discover Posts Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-zinc-900">Discover posts</h3>
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-zinc-500">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5A5F]" />
            <span>Live Geospatial Feed</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedPostId(post.id)}
              className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 cursor-pointer group shadow-xs hover:shadow-md transition-all"
            >
              <img
                src={post.images[0]}
                alt={post.venueName}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                <span className="text-[#FF5A5F] text-[10px] font-black uppercase">
                  {post.venueCategory}
                </span>
                <p className="text-white text-xs font-bold truncate">{post.venueName}</p>
                <p className="text-white/80 text-[10px] truncate">{post.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ExploreMap;
