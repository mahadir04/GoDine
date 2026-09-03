import React, { useState } from 'react';
import useStore, { IMAGES } from '../../store/store';
import { geoapifyAPI } from '../../services/api';
import {
  X,
  Plus,
  MapPin,
  Tag,
  Calendar,
  Film,
  FileText,
  Percent,
  Building,
  Hotel,
  Coffee,
  Utensils,
  Zap,
  Navigation,
  Loader2
} from 'lucide-react';

const CreatePostModal = () => {
  const { isCreatePostOpen, setIsCreatePostOpen, addPost, venues } = useStore();

  const [selectedImages, setSelectedImages] = useState([IMAGES.ramen, IMAGES.ribs, IMAGES.interior]);
  const [activeImage, setActiveImage] = useState(IMAGES.ramen);
  const [caption, setCaption] = useState('');
  const [postType, setPostType] = useState('Standard Post'); // 'Standard Post', 'Promo / Discount', 'Event', 'Reel'
  
  // Tag location selection state
  const availableVenues = venues && venues.length > 0 ? venues : [
    { id: 'v1', name: 'Grand Horizon Hotel & Spa', category: 'HOTEL', address: '104 Ocean Promenade', latitude: 23.777176, longitude: 90.399452 },
    { id: 'v2', name: 'Copper Kettle Bistro & Bar', category: 'RESTAURANT', address: '42 Gourmet Row', latitude: 23.780000, longitude: 90.410000 },
    { id: 'v3', name: 'Bean & Brew Roastery', category: 'CAFE', address: '15 Barista Way', latitude: 23.770000, longitude: 90.390000 },
    { id: 'v4', name: 'Sunset Highway Motel', category: 'MOTEL', address: 'Mile 12 Express Highway', latitude: 23.765000, longitude: 90.380000 },
    { id: 'v5', name: 'Pine Valley Hill Resthouse', category: 'RESTHOUSE', address: 'Highland Pass Ridge', latitude: 23.790000, longitude: 90.420000 }
  ];

  const [selectedVenueId, setSelectedVenueId] = useState(availableVenues[0]?.id || 'v2');
  const [customLocationName, setCustomLocationName] = useState('');
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [currentGpsCoords, setCurrentGpsCoords] = useState(null);

  const [offerText, setOfferText] = useState('20% OFF TODAY');
  const [validUntil, setValidUntil] = useState('9 PM Tonight');
  const [showOnMap, setShowOnMap] = useState(true);
  const [allowComments, setAllowComments] = useState(true);

  if (!isCreatePostOpen) return null;

  const selectedVenue = availableVenues.find(v => v.id === selectedVenueId) || availableVenues[0];

  const handleClose = () => {
    setIsCreatePostOpen(false);
  };

  // Real GPS Device Location Handler
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCurrentGpsCoords({ latitude: lat, longitude: lng });

        try {
          const address = await geoapifyAPI.reverseGeocode(lat, lng);
          setCustomLocationName(address);
        } catch (err) {
          setCustomLocationName(`GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        }
        setIsLocatingGps(false);
      },
      (err) => {
        console.warn('GPS location error:', err.message);
        alert('GPS location permission denied or unavailable.');
        setIsLocatingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleShare = () => {
    const finalLocationName = customLocationName.trim() || selectedVenue?.name || 'Hospitality Location';
    const finalCategory = selectedVenue?.category || 'Restaurant';

    addPost({
      caption,
      images: selectedImages,
      venueId: selectedVenue?.id,
      location: finalLocationName,
      category: finalCategory,
      badge: postType === 'Promo / Discount' ? (offerText || '20% OFF TODAY') : (postType === 'Event' ? 'Live Event' : null),
      postType: postType === 'Promo / Discount' ? 'PROMO' : 'POST',
      latitude: currentGpsCoords?.latitude || selectedVenue?.latitude || 23.7770,
      longitude: currentGpsCoords?.longitude || selectedVenue?.longitude || 90.3990
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Modal Main Container */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col animate-modal border border-zinc-200"
      >
        {/* Top Header Bar */}
        <div className="p-4 px-6 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg hover:bg-zinc-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-base text-zinc-900">Create location post</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="text-xs font-bold text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded-lg hover:bg-zinc-100 cursor-pointer"
            >
              Save Draft
            </button>
            <button
              onClick={handleShare}
              className="bg-[#FF5A5F] hover:bg-[#E0484D] text-white text-xs font-bold px-5 py-2 rounded-full shadow-sm transition-transform hover:scale-105 cursor-pointer"
            >
              Share Post
            </button>
          </div>
        </div>

        {/* Content Body: Split Left & Right */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Side: Images Preview & Thumbnails Selector */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 shadow-xs border border-zinc-200">
              <img
                src={activeImage}
                alt="Post preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF5A5F]" />
                <span className="truncate max-w-[200px]">{customLocationName || selectedVenue?.name}</span>
              </div>
            </div>

            {/* Thumbnail Selectors + Add Photo */}
            <div className="flex items-center gap-3">
              {selectedImages.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${
                    activeImage === img ? 'border-[#FF5A5F] ring-2 ring-[#FF5A5F]/20' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
                </div>
              ))}

              <button className="w-16 h-16 rounded-xl border-2 border-dashed border-zinc-300 hover:border-zinc-400 text-zinc-400 hover:text-zinc-600 flex items-center justify-center transition-colors cursor-pointer">
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Right Side: Posting Details & Form Options */}
          <div className="space-y-5">
            {/* Posting As Account */}
            <div className="flex items-center gap-3">
              <img
                src={selectedVenue?.avatar || IMAGES.copperAvatar}
                alt="Business"
                className="w-10 h-10 rounded-full object-cover ring-1 ring-zinc-200"
              />
              <div>
                <h4 className="font-bold text-xs text-zinc-900">{selectedVenue?.name || 'Selected Location'}</h4>
                <p className="text-[11px] text-zinc-400 font-medium">
                  {selectedVenue?.category || 'RESTAURANT'} · Verified Spot
                </p>
              </div>
            </div>

            {/* Caption Textarea */}
            <div>
              <textarea
                placeholder="Write a caption... mention today's special offer, ambience, or room availability"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={4}
                className="w-full text-xs text-zinc-800 placeholder-zinc-400 p-3 rounded-xl border border-zinc-200 focus:border-zinc-400 focus:outline-none resize-none transition-colors"
              />
              <div className="flex justify-end text-[10px] text-zinc-400 mt-1">
                {caption.length} / 2,200
              </div>
            </div>

            {/* Post Type Selector Pills */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-2">
                Post type
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Standard Post', icon: FileText },
                  { label: 'Promo / Discount', icon: Tag },
                  { label: 'Event', icon: Calendar },
                  { label: 'Reel', icon: Film },
                ].map((type) => {
                  const Icon = type.icon;
                  const isSelected = postType === type.label;
                  return (
                    <button
                      key={type.label}
                      type="button"
                      onClick={() => setPostType(type.label)}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                          : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tag Location Selector & Current Location Button */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Tag Location (Hotel, Restaurant, Cafe, Motel, Resthouse)</span>
                <span className="text-[#FF5A5F] font-bold text-[10px]">Active GPS</span>
              </label>

              <div className="space-y-2">
                {/* Use Current GPS Location Button */}
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocatingGps}
                  className="w-full flex items-center justify-center gap-1.5 bg-[#FFF0F1] hover:bg-[#FFE2E4] text-[#FF5A5F] text-xs font-bold py-2.5 rounded-xl border border-[#FF5A5F]/20 transition-all cursor-pointer shadow-xs"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isLocatingGps ? 'animate-spin' : ''}`} />
                  <span>{isLocatingGps ? 'Acquiring GPS Location...' : '📍 Use My Current GPS Location'}</span>
                </button>

                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#FF5A5F] absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={selectedVenueId}
                    onChange={(e) => setSelectedVenueId(e.target.value)}
                    className="w-full text-xs font-bold text-zinc-800 pl-9 pr-8 py-2.5 rounded-xl border border-zinc-200 bg-white focus:border-zinc-400 focus:outline-none appearance-none cursor-pointer"
                  >
                    {availableVenues.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.category}) · {v.address}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  type="text"
                  placeholder="Or enter custom landmark address..."
                  value={customLocationName}
                  onChange={(e) => setCustomLocationName(e.target.value)}
                  className="w-full text-xs text-zinc-800 p-2.5 rounded-xl border border-zinc-200 focus:border-zinc-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Offer Details (if Promo) */}
            {postType === 'Promo / Discount' && (
              <div className="p-3 bg-[#FFF0F1] rounded-2xl border border-[#FF5A5F]/20 space-y-2">
                <label className="block text-[11px] font-bold text-[#FF5A5F] uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Special Location Offer Details</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 20% OFF TODAY"
                    value={offerText}
                    onChange={(e) => setOfferText(e.target.value)}
                    className="text-xs font-bold text-zinc-900 p-2.5 rounded-xl border border-zinc-200 bg-white focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Valid until"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="text-xs text-zinc-800 p-2.5 rounded-xl border border-zinc-200 bg-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Toggles */}
            <div className="space-y-2 pt-2 border-t border-zinc-100 text-xs font-semibold">
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 border border-zinc-100">
                <span className="text-zinc-700">Show on Explore Map & Feed</span>
                <input
                  type="checkbox"
                  checked={showOnMap}
                  onChange={(e) => setShowOnMap(e.target.checked)}
                  className="w-4 h-4 accent-[#FF5A5F]"
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 border border-zinc-100">
                <span className="text-zinc-700 font-medium">Send Proximity Notification to Nearby Diners</span>
                <input
                  type="checkbox"
                  checked={allowComments}
                  onChange={(e) => setAllowComments(e.target.checked)}
                  className="w-4 h-4 accent-[#FF5A5F]"
                />
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
