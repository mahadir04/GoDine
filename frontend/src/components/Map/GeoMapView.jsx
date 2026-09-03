import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import useStore from '../../store/store';
import axios from 'axios';
import { Layers, Navigation, Star, ShieldCheck } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Helper component to pan/recenter map dynamically when coordinates change
const MapRecenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

// Custom colored category markers using Leaflet's DivIcon to avoid Vite bundling image path errors
const createCustomIcon = (category, isPromo) => {
  let color = '#3b82f6'; // default blue
  if (category === 'RESTAURANT') color = '#f97316'; // orange
  else if (category === 'CAFE') color = '#06b6d4'; // cyan
  else if (category === 'BAKERY') color = '#eab308'; // yellow
  else if (category === 'HOTEL') color = '#8b5cf6'; // purple
  else if (category === 'MOTEL') color = '#ef4444'; // red
  else if (category === 'RESTHOUSE') color = '#6366f1'; // indigo

  const borderClass = isPromo ? 'border-2 border-emerald-400 glowing-beacon-green' : 'border border-white/40';

  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div class="relative flex items-center justify-center">
        <span class="absolute inline-flex h-6 w-6 rounded-full opacity-35 animate-ping" style="background-color: ${color}"></span>
        <div class="relative h-4.5 w-4.5 rounded-full ${borderClass} shadow-md" style="background-color: ${color}"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const GeoMapView = () => {
  const { coordinates, token, setActiveVenueId } = useStore();
  const [venues, setVenues] = useState([]);
  const [mapMode, setMapMode] = useState('dark'); // dark, satellite
  const [error, setError] = useState(null);

  // Load venues on mount
  useEffect(() => {
    const loadVenues = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/v1/venues/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVenues(response.data);
      } catch (err) {
        console.error("Error loading venues: ", err);
        setError("Offline mode active. Rendering mock map coordinates.");
        // Fallback mock venues including motels and resthouses
        setVenues([
          { id: "v1", name: "Artisan Smokehouse & Bistro", category: "RESTAURANT", latitude: 23.776000, longitude: 90.398000, average_rating: 4.8, address: "Banani, Dhaka", is_verified: true, description: "Premium BBQ briskets." },
          { id: "v2", name: "Dhakai Kacchi Ghar", category: "RESTAURANT", latitude: 23.778500, longitude: 90.400500, average_rating: 4.5, address: "Gulshan 1, Dhaka", is_verified: true, description: "Authentic basmati kacchi." },
          { id: "v3", name: "Espresso Lounge & Café", category: "CAFE", latitude: 23.779000, longitude: 90.395000, average_rating: 4.0, address: "Tejgaon, Dhaka", is_verified: false, description: "Quiet rooftop cafe." },
          { id: "v4", name: "Bakers Delight & Sweetery", category: "BAKERY", latitude: 23.775000, longitude: 90.402000, average_rating: 4.2, address: "Niketon, Dhaka", is_verified: false, description: "Pastries & croissants." },
          { id: "v5", name: "Lakeshore Premium Hotel", category: "HOTEL", latitude: 23.774500, longitude: 90.396500, average_rating: 4.9, address: "Gulshan 2, Dhaka", is_verified: true, description: "5-star luxury lake suites." },
          { id: "v6", name: "Banani Highway Motel", category: "MOTEL", latitude: 23.780200, longitude: 90.402500, average_rating: 4.3, address: "Banani, Dhaka", is_verified: false, description: "Clean transient rooms & parking." },
          { id: "v7", name: "Gulshan Resthouse & Suite", category: "RESTHOUSE", latitude: 23.773000, longitude: 90.399800, average_rating: 4.1, address: "Gulshan 1, Dhaka", is_verified: false, description: "Quiet residential suites." }
        ]);
      }
    };
    loadVenues();
  }, [token]);

  const mapCenter = [coordinates.latitude, coordinates.longitude];

  // Tile layers URLs
  const darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  const satelliteTiles = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

  return (
    <div className="relative h-[calc(100vh-80px)] w-full bg-zinc-950">
      
      {/* Tile View Toggle Controller */}
      <div className="absolute top-4 left-4 z-10 glass-panel border border-zinc-800 rounded-xl p-1.5 flex gap-1 shadow-2xl">
        <button
          onClick={() => setMapMode('dark')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            mapMode === 'dark'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-250'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          Dark Vector
        </button>
        <button
          onClick={() => setMapMode('satellite')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            mapMode === 'satellite'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-250'
          }`}
        >
          <Navigation className="h-3.5 w-3.5" />
          3D Satellite
        </button>
      </div>

      {/* Leaflet Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={15}
        zoomControl={false}
        className="h-full w-full z-0"
      >
        <TileLayer
          url={mapMode === 'dark' ? darkTiles : satelliteTiles}
          attribution='&copy; ESRI / CartoDB'
        />
        
        <MapRecenter center={mapCenter} />

        {venues.map((venue) => {
          const isPromo = venue.average_rating > 4.5; // Promo visual glow representation
          const icon = createCustomIcon(venue.category, isPromo);

          return (
            <Marker
              key={venue.id}
              position={[venue.latitude, venue.longitude]}
              icon={icon}
            >
              <Popup>
                <div className="text-zinc-950 p-1 min-w-[200px]">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-mono font-bold bg-zinc-100 border border-zinc-250 text-zinc-600 px-1.5 py-0.5 rounded">
                        {venue.category}
                      </span>
                      <h4 className="font-extrabold text-sm text-zinc-900 mt-1 flex items-center gap-1">
                        {venue.name}
                        {venue.is_verified && <ShieldCheck className="h-3.5 w-3.5 text-blue-500 fill-blue-50" />}
                      </h4>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">{venue.address}</p>
                  <p className="text-[11px] text-zinc-700 leading-normal mt-1.5">{venue.description}</p>
                  
                  <div className="flex items-center justify-between border-t border-zinc-150 pt-2 mt-2">
                    <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                      ★ {venue.average_rating}
                    </span>
                    <button
                      onClick={() => {
                        // Triggers detail reviews modal in App.jsx
                        setActiveVenueId(venue.id);
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-2.5 py-1 rounded text-[10px] transition-colors border-none cursor-pointer"
                    >
                      Reviews & Book
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay Card */}
      <div className="absolute bottom-6 left-6 z-10 glass-panel border border-zinc-800 p-4 rounded-2xl max-w-xs shadow-2xl pointer-events-auto">
        <h3 className="text-xs font-extrabold text-white uppercase tracking-wider mb-2">Hospitality Map Legend</h3>
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#f97316]"></span>
            <span>Restaurant</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#06b6d4]"></span>
            <span>Café</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#eab308]"></span>
            <span>Bakery</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#8b5cf6]"></span>
            <span>Hotel</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ef4444]"></span>
            <span>Motel</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#6366f1]"></span>
            <span>Resthouse</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default GeoMapView;
