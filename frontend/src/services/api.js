// API client for connecting to FastAPI backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Helper to get stored auth token
export const getAuthToken = () => {
  return localStorage.getItem('godine_token') || '';
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('godine_token', token);
  } else {
    localStorage.removeItem('godine_token');
  }
};

// Generic fetch wrapper with token header
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API error at ${endpoint}:`, error);
    throw error;
  }
}

// 1. Authentication & Profile CRUD APIs
export const authAPI = {
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Invalid email or password');
    }

    const data = await res.json();
    if (data.access_token) {
      setAuthToken(data.access_token);
    }
    return data;
  },

  register: async (userData) => {
    return await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  oauthLogin: async (oauthData) => {
    const res = await apiRequest('/auth/oauth', {
      method: 'POST',
      body: JSON.stringify(oauthData),
    });
    if (res.access_token) {
      setAuthToken(res.access_token);
    }
    return res;
  },

  getMe: async () => {
    return await apiRequest('/auth/me');
  },

  updateMe: async (userData) => {
    return await apiRequest('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Verify a real Google ID token and receive a platform JWT
  googleAuth: async (idToken) => {
    const res = await apiRequest('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ id_token: idToken }),
    });
    if (res.access_token) {
      setAuthToken(res.access_token);
    }
    return res;
  },
};

// 2. Geospatial Feed API
export const feedAPI = {
  getPersonalizedFeed: async (lat = 23.8103, lng = 90.4125, radius = 30) => {
    return await apiRequest(`/feed/?latitude=${lat}&longitude=${lng}&radius_km=${radius}`);
  },
};

// 3. Venues (Restaurants, Hotels, Motels, Resthouses, Cafes, Bakeries) CRUD
export const venuesAPI = {
  createVenue: async (venueData) => {
    return await apiRequest('/venues/', {
      method: 'POST',
      body: JSON.stringify(venueData),
    });
  },

  getAllVenues: async () => {
    return await apiRequest('/venues/');
  },

  searchVenues: async (query = '', category = '', lat = 23.8103, lng = 90.4125, radius = 30) => {
    const q = query ? `query=${encodeURIComponent(query)}&` : '';
    const cat = category ? `category=${encodeURIComponent(category)}&` : '';
    return await apiRequest(`/venues/search?${q}${cat}latitude=${lat}&longitude=${lng}&radius_km=${radius}`);
  },

  getVenueById: async (id) => {
    return await apiRequest(`/venues/${id}`);
  },

  updateVenue: async (id, venueData) => {
    return await apiRequest(`/venues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(venueData),
    });
  },

  deleteVenue: async (id) => {
    return await apiRequest(`/venues/${id}`, {
      method: 'DELETE',
    });
  },
};

// 4. Posts & Promos CRUD
export const postsAPI = {
  createPost: async (postData) => {
    return await apiRequest('/posts/', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  getAllPosts: async () => {
    return await apiRequest('/posts/');
  },

  getPostById: async (id) => {
    return await apiRequest(`/posts/${id}`);
  },

  getVenuePosts: async (venueId) => {
    return await apiRequest(`/posts/venue/${venueId}`);
  },

  updatePost: async (id, postData) => {
    return await apiRequest(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  },

  deletePost: async (id) => {
    return await apiRequest(`/posts/${id}`, {
      method: 'DELETE',
    });
  },
};

// 5. Reviews & Aspect-based Sentiment CRUD
export const reviewsAPI = {
  submitReview: async (reviewData) => {
    return await apiRequest('/reviews/', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  getVenueReviews: async (venueId) => {
    return await apiRequest(`/reviews/venue/${venueId}`);
  },

  updateReview: async (id, reviewData) => {
    return await apiRequest(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  },

  deleteReview: async (id) => {
    return await apiRequest(`/reviews/${id}`, {
      method: 'DELETE',
    });
  },
};

// 6. Reservations (Table & Room Bookings) CRUD
export const reservationsAPI = {
  createReservation: async (reservationData) => {
    return await apiRequest('/reservations/', {
      method: 'POST',
      body: JSON.stringify(reservationData),
    });
  },

  getMyReservations: async () => {
    return await apiRequest('/reservations/');
  },

  getVenueReservations: async (venueId) => {
    return await apiRequest(`/reservations/venue/${venueId}`);
  },

  updateReservation: async (id, updateData) => {
    return await apiRequest(`/reservations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  },

  deleteReservation: async (id) => {
    return await apiRequest(`/reservations/${id}`, {
      method: 'DELETE',
    });
  },
};

// 7. OpenStreetMap (Overpass & Nominatim) - 100% Free
export const osmAPI = {
  getNearby: async (lat, lng, radiusMeters = 5000) => {
    return await apiRequest(`/osm/nearby?latitude=${lat}&longitude=${lng}&radius_meters=${radiusMeters}`);
  },
  geocode: async (query) => {
    return await apiRequest(`/osm/geocode?query=${encodeURIComponent(query)}`);
  },
  getNearbyPlacesOverpass: async (lat, lon, radiusInMeters = 2000) => {
    const query = `
      [out:json][timeout:25];
      (
        nwr["amenity"~"restaurant|cafe|bakery"](around:${radiusInMeters},${lat},${lon});
        nwr["tourism"~"hotel|motel|guest_house"](around:${radiusInMeters},${lat},${lon});
      );
      out center tags;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'data=' + encodeURIComponent(query)
    });

    if (!response.ok) throw new Error(`Overpass error: ${response.status}`);

    const data = await response.json();

    return (data.elements || [])
      .filter(item => item.tags && item.tags.name)
      .map(item => ({
        name: item.tags.name,
        type: item.tags.amenity || item.tags.tourism,
        lat: item.lat || (item.center && item.center.lat),
        lon: item.lon || (item.center && item.center.lon),
        cuisine: item.tags.cuisine || null,
        stars: item.tags.stars || null
      }));
  }
};

// 8. Conversational AI Chat API
export const chatAPI = {
  sendMessage: async (message) => {
    return await apiRequest('/chat/', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },
};

// 9. Venue Owner Analytics API
export const analyticsAPI = {
  getVenueAnalytics: async (venueId) => {
    return await apiRequest(`/analytics/venue/${venueId}`);
  },
};

// 10. Geoapify Places API Integration
const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY || '1745c4ea7f244759b34ec216c0cc53df';

export const geoapifyAPI = {
  getNearbyPlacesGeoapify: async (lat, lon, radiusInMeters = 2000) => {
    const apiKey = GEOAPIFY_API_KEY;
    const categories = 'catering.restaurant,catering.cafe,accommodation.hotel,accommodation.motel,accommodation.guest_house';
    
    // Geoapify filter format expects longitude first, then latitude
    const endpoint = `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${lon},${lat},${radiusInMeters}&bias=proximity:${lon},${lat}&limit=30&apiKey=${apiKey}`;

    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`Geoapify error: ${response.status}`);
    
    const data = await response.json();

    return (data.features || []).map(feature => {
      const props = feature.properties || {};
      const coords = feature.geometry?.coordinates || [lon, lat];
      const mainCat = props.categories?.[0] || 'catering.restaurant';

      let category = 'Restaurant';
      if (mainCat.includes('hotel')) category = 'Hotel';
      else if (mainCat.includes('motel')) category = 'Motel';
      else if (mainCat.includes('cafe')) category = 'Cafe';
      else if (mainCat.includes('guest_house')) category = 'Resthouse';

      return {
        name: props.name || props.street || 'Hospitality Destination',
        category,
        address: props.formatted || `${props.address_line1 || ''} ${props.address_line2 || ''}`.trim() || 'Nearby location',
        lat: coords[1],
        lon: coords[0],
        distanceMeters: props.distance || 500,
        rawCategory: mainCat
      };
    });
  },

  // Geocode address text into latitude & longitude coordinates using Geoapify Geocoding API
  geocodeAddress: async (addressText) => {
    if (!addressText || !addressText.trim()) return null;
    const apiKey = GEOAPIFY_API_KEY;
    const endpoint = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressText)}&limit=1&apiKey=${apiKey}`;

    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`Geoapify geocoding error: ${response.status}`);
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const coords = feature.geometry?.coordinates || [];
        return {
          latitude: coords[1] || feature.properties?.lat,
          longitude: coords[0] || feature.properties?.lon,
          formattedAddress: feature.properties?.formatted || addressText
        };
      }
    } catch (err) {
      console.warn('Geoapify geocoding notice:', err.message);
    }
    return null;
  },

  // Reverse geocode latitude & longitude into location address name using Geoapify API
  reverseGeocode: async (lat, lon) => {
    if (!lat || !lon) return null;
    const apiKey = GEOAPIFY_API_KEY;
    const endpoint = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&limit=1&apiKey=${apiKey}`;

    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`Geoapify reverse geocoding error: ${response.status}`);
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const props = data.features[0].properties || {};
        return props.formatted || props.name || props.street || `GPS Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
      }
    } catch (err) {
      console.warn('Geoapify reverse geocoding notice:', err.message);
    }
    return `GPS Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
  }
};
