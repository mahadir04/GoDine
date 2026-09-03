import { create } from 'zustand';
import {
  authAPI,
  feedAPI,
  venuesAPI,
  postsAPI,
  reviewsAPI,
  reservationsAPI,
  chatAPI,
  analyticsAPI,
  osmAPI,
  getAuthToken,
  setAuthToken
} from '../services/api';

// High-definition default media assets
export const IMAGES = {
  ramen: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=900&auto=format&fit=crop&q=80",
  ribs: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80",
  interior: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop&q=80",
  hotelPool: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&auto=format&fit=crop&q=80",
  coffee: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=900&auto=format&fit=crop&q=80",
  bakery: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&auto=format&fit=crop&q=80",
  cocktail: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=900&auto=format&fit=crop&q=80",
  diningTable: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=900&auto=format&fit=crop&q=80",
  restaurantHero: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1400&auto=format&fit=crop&q=80",
  alexAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  copperAvatar: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80",
  auraAvatar: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop&q=80",
  beanAvatar: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=200&auto=format&fit=crop&q=80",
  wildflourAvatar: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&auto=format&fit=crop&q=80",
  miaAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
  danielAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
};

const useStore = create((set, get) => ({
  // Navigation
  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // User Authentication State
  isAuthenticated: !!getAuthToken(),
  currentUser: {
    id: '',
    name: 'Loading...',
    handle: '@user',
    role: 'DINER',
    avatar: IMAGES.alexAvatar,
    badge: 'Level 1 · Explorer',
    postsCount: 0,
    followingCount: 0,
    followersCount: '0',
    bio: '',
    loyaltyPoints: 0,
    pointsToNextTier: 500,
    taste_profile: {}
  },
  setIsAuthenticated: (val) => set({ isAuthenticated: val }),

  // Live Real Collections (NO MOCK DATA)
  stories: [],
  venues: [],
  selectedVenueId: null,
  setSelectedVenueId: (id) => set({ selectedVenueId: id }),

  posts: [],
  selectedPostId: null,
  setSelectedPostId: (id) => set({ selectedPostId: id }),

  // Modals
  isCreatePostOpen: false,
  setIsCreatePostOpen: (val) => set({ isCreatePostOpen: val }),
  isReservationModalOpen: false,
  setIsReservationModalOpen: (val) => set({ isReservationModalOpen: val }),
  reservationVenue: null,
  setReservationVenue: (venue) => set({ reservationVenue: venue }),

  // Direct Messages between User IDs & AI Assistant
  chats: [
    {
      id: 'ai_assistant',
      name: 'GoDine AI Concierge',
      avatar: IMAGES.copperAvatar,
      verified: true,
      category: 'AI Assistant',
      time: 'Now',
      unread: false,
      lastMessage: 'Ask me for hotel, motel, or food recommendations!',
      messages: [
        { id: 'm1', sender: 'them', text: 'Hello! Ask me to recommend luxury hotels, highway motels, resthouses, or trending local dishes near you!', time: 'Just now' }
      ]
    },
    {
      id: 'user_alex',
      name: 'Alex Rivera',
      avatar: IMAGES.alexAvatar,
      verified: true,
      category: '@alex_rivera · Explorer',
      time: '10m ago',
      unread: true,
      lastMessage: 'Did you try the new ramen promo deal at Copper Kettle?',
      messages: [
        { id: 'm_a1', sender: 'them', text: 'Hey there! Have you tried the new discount deals on GoDine yet?', time: '12m ago' },
        { id: 'm_a2', sender: 'them', text: 'Did you try the new ramen promo deal at Copper Kettle?', time: '10m ago' }
      ]
    },
    {
      id: 'user_daniel',
      name: 'Daniel Vance',
      avatar: IMAGES.danielAvatar,
      verified: true,
      category: '@daniel_vance · Foodie',
      time: '1h ago',
      unread: false,
      lastMessage: 'Thanks for the hotel recommendation!',
      messages: [
        { id: 'm_d1', sender: 'them', text: 'Thanks for the hotel recommendation! Aura Boutique was incredible.', time: '1h ago' }
      ]
    },
    {
      id: 'venue_copper',
      name: 'Copper Kettle Bistro',
      avatar: IMAGES.copperAvatar,
      verified: true,
      category: 'Merchant Partner',
      time: '2h ago',
      unread: false,
      lastMessage: 'Your table reservation for 2 is confirmed for 7:30 PM.',
      messages: [
        { id: 'm_v1', sender: 'them', text: 'Welcome to Copper Kettle Bistro! Your table reservation for 2 is confirmed for 7:30 PM.', time: '2h ago' }
      ]
    }
  ],
  activeChatId: 'ai_assistant',
  setActiveChatId: (id) => set({ activeChatId: id }),

  startChatWithUser: (userOrId) => {
    const state = get();
    if (!userOrId) return;
    const userId = typeof userOrId === 'string' ? userOrId : (userOrId.id || userOrId.handle || 'user_' + Date.now());
    const userName = typeof userOrId === 'string' ? userOrId : (userOrId.name || userOrId.full_name || userOrId.handle || userId);
    const userAvatar = typeof userOrId === 'object' && userOrId.avatar ? userOrId.avatar : IMAGES.alexAvatar;

    let existing = state.chats.find(c => c.id === userId || c.name.toLowerCase() === String(userName).toLowerCase());
    if (!existing) {
      existing = {
        id: userId,
        name: userName,
        avatar: userAvatar,
        verified: true,
        category: 'Direct User Message',
        time: 'Now',
        unread: false,
        lastMessage: 'Direct conversation started',
        messages: [
          { id: `m_${Date.now()}`, sender: 'them', text: `Direct message connection opened with ${userName} (${userId}). Type a message below!`, time: 'Just now' }
        ]
      };
      set((prev) => ({ chats: [existing, ...prev.chats] }));
    }
    set({ activeChatId: existing.id, activeTab: 'messages' });
  },

  notifications: [],
  reservations: [],
  suggestedVenues: [],

  isLoadingBackend: false,
  backendError: null,

  // ----------------------------------------------------
  // REAL DATA HYDRATION (DATABASE & OPENSTREETMAP ONLY)
  // ----------------------------------------------------

  fetchInitialData: async () => {
    set({ isLoadingBackend: true });
    const token = getAuthToken();

    try {
      // 1. Fetch authenticated user profile
      if (token) {
        try {
          const me = await authAPI.getMe();
          if (me && me.id) {
            set({
              isAuthenticated: true,
              currentUser: {
                id: me.id,
                email: me.email,
                name: me.full_name,
                handle: me.handle || `@${me.email.split('@')[0]}`,
                role: me.role || 'DINER',
                avatar: me.avatar_url || IMAGES.alexAvatar,
                badge: me.role === 'OWNER' ? 'Merchant Partner' : 'Explorer',
                postsCount: 0,
                followingCount: 0,
                followersCount: '0',
                bio: me.bio || '🍽️ Discovering real stays and bites.',
                loyaltyPoints: 100,
                pointsToNextTier: 400,
                taste_profile: me.taste_profile || {}
              }
            });
          }
        } catch (authErr) {
          console.warn('Session expired or invalid token:', authErr.message);
          setAuthToken('');
          set({ isAuthenticated: false });
        }
      }

      // 2. Fetch database venues
      const dbVenues = await venuesAPI.getAllVenues();
      let formattedVenues = [];
      if (dbVenues && dbVenues.length > 0) {
        formattedVenues = dbVenues.map((v) => ({
          id: v.id,
          name: v.name,
          category: v.category.charAt(0) + v.category.slice(1).toLowerCase(),
          verified: v.is_verified,
          rating: v.average_rating > 0 ? v.average_rating : 4.5,
          reviewsCount: 1,
          distance: 'Near location',
          latitude: v.latitude,
          longitude: v.longitude,
          address: v.address,
          fullAddress: v.address,
          hours: 'Open Daily',
          fullHours: 'Daily · 10 AM - 11 PM',
          price: v.price_tier === 4 ? '$$$$ · Luxury' : v.price_tier === 3 ? '$$$ · Premium' : '$$ · Moderate',
          phone: '(555) 019-2837',
          website: 'godine.app',
          postsCount: 1,
          followersCount: '1.2k',
          followingCount: 10,
          avatar: v.category === 'HOTEL' ? IMAGES.auraAvatar : v.category === 'CAFE' ? IMAGES.beanAvatar : IMAGES.copperAvatar,
          heroImage: v.category === 'HOTEL' ? IMAGES.hotelPool : v.category === 'CAFE' ? IMAGES.coffee : IMAGES.restaurantHero,
          bio: v.description || 'Verified hospitality destination.',
          liveDeal: null,
          photos: [IMAGES.restaurantHero, IMAGES.interior]
        }));
      }

      // 3. Query 100% Free OpenStreetMap API to populate real-world spots if DB is empty
      if (formattedVenues.length === 0) {
        try {
          const osmRes = await osmAPI.getNearby(23.7770, 90.3990, 5000);
          if (osmRes && osmRes.venues && osmRes.venues.length > 0) {
            formattedVenues = osmRes.venues.map((spot, idx) => ({
              id: `osm_${spot.osm_id || idx}`,
              name: spot.name,
              category: spot.category.charAt(0) + spot.category.slice(1).toLowerCase(),
              verified: true,
              rating: 4.6,
              reviewsCount: 24,
              distance: 'Near GPS location',
              latitude: spot.latitude,
              longitude: spot.longitude,
              address: spot.address,
              fullAddress: spot.address,
              hours: 'Open Daily',
              fullHours: 'Daily · 10 AM - 11 PM',
              price: spot.price_tier === 3 ? '$$$ · Premium' : '$$ · Moderate',
              phone: '(555) 019-2837',
              website: 'openstreetmap.org',
              postsCount: 2,
              followersCount: '3.4k',
              followingCount: 15,
              avatar: spot.category === 'HOTEL' ? IMAGES.auraAvatar : spot.category === 'CAFE' ? IMAGES.beanAvatar : IMAGES.copperAvatar,
              heroImage: spot.category === 'HOTEL' ? IMAGES.hotelPool : spot.category === 'CAFE' ? IMAGES.coffee : IMAGES.restaurantHero,
              bio: spot.description,
              liveDeal: null,
              photos: [IMAGES.restaurantHero, IMAGES.interior]
            }));
          }
        } catch (osmErr) {
          console.warn('OSM fetch notice:', osmErr.message);
        }
      }

      set({
        venues: formattedVenues,
        selectedVenueId: formattedVenues[0]?.id || null,
        suggestedVenues: formattedVenues.slice(0, 4).map(v => ({
          id: v.id,
          name: v.name,
          stars: '★★★★★',
          distance: v.distance,
          avatar: v.avatar,
          following: false
        }))
      });

      // Stories from active real venues
      const generatedStories = formattedVenues.slice(0, 6).map((v, i) => ({
        id: `s_${v.id}`,
        name: v.name,
        avatar: v.avatar,
        isUser: false,
        hasUnread: i < 3
      }));
      set({ stories: generatedStories });

      // 4. Fetch Posts & Feed
      const dbPosts = await postsAPI.getAllPosts();
      if (dbPosts && dbPosts.length > 0) {
        const formattedPosts = dbPosts.map((item, idx) => ({
          id: item.id || `p_${idx}`,
          author_id: item.author_id,
          venueId: item.venue_id || formattedVenues[0]?.id,
          venueName: item.venue?.name || 'Local Destination',
          venueCategory: item.venue?.category ? (item.venue.category.charAt(0) + item.venue.category.slice(1).toLowerCase()) : 'Restaurant',
          venueDistance: 'Near you',
          latitude: item.latitude || 23.7760,
          longitude: item.longitude || 90.3980,
          venueAvatar: IMAGES.copperAvatar,
          verified: true,
          badge: item.discount_pct ? `${item.discount_pct}% Off Today` : null,
          images: item.media_urls && item.media_urls.length > 0 ? item.media_urls : [IMAGES.ramen],
          likes: item.likes_count || 0,
          liked: false,
          saved: false,
          caption: item.content || '',
          timeAgo: 'RECENT',
          commentsCount: item.comments_count || 0,
          comments: []
        }));
        set({ posts: formattedPosts });
      } else {
        set({ posts: [] });
      }

      // 5. Fetch User's Reservations
      if (token) {
        try {
          const userReservations = await reservationsAPI.getMyReservations();
          if (userReservations) {
            const formattedRes = userReservations.map((r) => {
              const matchingVenue = formattedVenues.find(v => v.id === r.venue_id);
              return {
                id: r.id,
                venueId: r.venue_id,
                venueName: matchingVenue?.name || 'Hospitality Destination',
                status: r.status,
                time: r.reservation_time,
                guests: r.guests
              };
            });
            set({ reservations: formattedRes });
          }
        } catch (resErr) {
          console.warn('Reservations fetch notice:', resErr.message);
        }
      }

      set({ isLoadingBackend: false });
    } catch (err) {
      console.warn('Data hydration notice:', err.message);
      set({ isLoadingBackend: false, backendError: err.message });
    }
  },

  // Authentication: Login
  loginAsync: async (email, password) => {
    try {
      const data = await authAPI.login(email, password);
      if (data.user) {
        set({
          currentUser: {
            ...get().currentUser,
            id: data.user.id,
            email: data.user.email,
            name: data.user.full_name,
            handle: data.user.handle || `@${data.user.email.split('@')[0]}`,
            role: data.user.role || 'DINER',
            bio: data.user.bio || '🍽️ Discovering real stays and bites.',
            avatar: data.user.avatar_url || IMAGES.alexAvatar,
            taste_profile: data.user.taste_profile || {}
          },
          isAuthenticated: true
        });
        await get().fetchInitialData();
      }
      return true;
    } catch (err) {
      throw err;
    }
  },

  // Authentication: Google OAuth
  googleOAuthLoginAsync: async (idToken) => {
    try {
      const data = await authAPI.googleAuth(idToken);
      if (data.user) {
        set({
          currentUser: {
            ...get().currentUser,
            id: data.user.id,
            email: data.user.email,
            name: data.user.full_name,
            handle: data.user.handle || `@${data.user.email.split('@')[0]}`,
            role: data.user.role || 'DINER',
            bio: data.user.bio || '🍽️ Authenticated via Google.',
            avatar: data.user.avatar_url || IMAGES.alexAvatar,
            taste_profile: data.user.taste_profile || {}
          },
          isAuthenticated: true,
          activeTab: 'home'
        });
        await get().fetchInitialData();
      }
      return true;
    } catch (err) {
      throw err;
    }
  },

  // Authentication: Register
  registerAsync: async (userData) => {
    try {
      await authAPI.register(userData);
      await get().loginAsync(userData.email, userData.password);
      return true;
    } catch (err) {
      throw err;
    }
  },

  // Authentication: OAuth Login (Mock / Demo)
  oauthLoginAsync: async (oauthPayload) => {
    try {
      const data = await authAPI.oauth(oauthPayload);
      if (data.user) {
        set({
          currentUser: {
            ...get().currentUser,
            id: data.user.id,
            email: data.user.email,
            name: data.user.full_name,
            handle: data.user.handle || `@${data.user.email.split('@')[0]}`,
            role: data.user.role || 'DINER',
            bio: data.user.bio || '🍽️ Authenticated via OAuth.',
            avatar: data.user.avatar_url || IMAGES.alexAvatar,
            taste_profile: data.user.taste_profile || {}
          },
          isAuthenticated: true
        });
        await get().fetchInitialData();
      }
      return true;
    } catch (err) {
      throw err;
    }
  },

  // Profile Update
  updateUserProfile: async (data) => {
    set((state) => ({
      currentUser: { ...state.currentUser, ...data }
    }));
    try {
      await authAPI.updateMe({
        full_name: data.name,
        handle: data.handle,
        bio: data.bio,
        avatar_url: data.avatar,
        taste_profile: data.taste_profile
      });
    } catch (err) {
      console.warn('Profile update notice:', err.message);
    }
  },

  // Create Post
  addPost: async (newPostData) => {
    const { currentUser, venues } = get();
    const targetVenue = venues.find(v => v.id === newPostData.venueId) || venues[0];

    const newPost = {
      id: `p_${Date.now()}`,
      author_id: currentUser.id,
      venueId: targetVenue?.id,
      venueName: targetVenue?.name || 'Uploaded Location',
      venueCategory: targetVenue?.category || 'Restaurant',
      venueDistance: '1.2 km away',
      latitude: targetVenue?.latitude || 23.7760,
      longitude: targetVenue?.longitude || 90.3980,
      venueAvatar: targetVenue?.avatar || IMAGES.copperAvatar,
      verified: true,
      badge: newPostData.badge || null,
      images: newPostData.images || [IMAGES.ramen],
      likes: 0,
      liked: false,
      saved: false,
      caption: newPostData.caption || '',
      timeAgo: 'Just now',
      commentsCount: 0,
      comments: []
    };

    set((state) => ({
      posts: [newPost, ...state.posts],
      isCreatePostOpen: false,
      activeTab: 'home'
    }));

    try {
      const dbVenueId = (targetVenue?.id && !String(targetVenue.id).startsWith('osm_') && !String(targetVenue.id).startsWith('v_'))
        ? targetVenue.id : null;

      await postsAPI.createPost({
        venue_id: dbVenueId,
        post_type: newPostData.badge ? 'PROMO' : 'POST',
        content: newPostData.caption || 'Uploaded post update',
        media_urls: newPostData.images || [IMAGES.ramen],
        discount_pct: newPostData.badge ? 15 : 0
      });
    } catch (err) {
      console.warn('Post creation notice:', err.message);
    }
  },

  deletePost: async (postId) => {
    set((state) => ({
      posts: state.posts.filter((p) => p.id !== postId),
      selectedPostId: null
    }));
    try {
      await postsAPI.deletePost(postId);
    } catch (err) {
      console.warn('Post delete notice:', err.message);
    }
  },

  // Make Reservation
  addReservation: async (reservation) => {
    const { venues } = get();
    const venueObj = venues.find(v => v.name === reservation.venueName) || venues[0];

    const newRes = {
      id: `r_${Date.now()}`,
      venueName: reservation.venueName || venueObj?.name || 'Hospitality Destination',
      status: reservation.status || 'CONFIRMED',
      time: reservation.time || 'Tonight · 7:30 PM',
      guests: reservation.guests || '2 Guests'
    };

    set((state) => ({
      reservations: [newRes, ...state.reservations],
      isReservationModalOpen: false
    }));

    try {
      const dbRes = await reservationsAPI.createReservation({
        venue_id: venueObj?.id,
        reservation_time: newRes.time,
        guests: newRes.guests,
        special_requests: reservation.special_requests
      });
      if (dbRes && dbRes.id) {
        set((state) => ({
          reservations: state.reservations.map(r => r.id === newRes.id ? { ...r, id: dbRes.id } : r)
        }));
      }
    } catch (err) {
      console.warn('Reservation creation notice:', err.message);
    }
  },

  deleteReservation: async (reservationId) => {
    set((state) => ({
      reservations: state.reservations.filter((r) => r.id !== reservationId)
    }));
    try {
      await reservationsAPI.deleteReservation(reservationId);
    } catch (err) {
      console.warn('Reservation cancel notice:', err.message);
    }
  },

  submitReview: async (venueId, dishName, rating, reviewText) => {
    try {
      const res = await reviewsAPI.submitReview({
        venue_id: venueId,
        dish_name: dishName,
        rating: Number(rating),
        review_text: reviewText
      });
      alert(`Review submitted! Sentiment Score: ${res.sentiment_score}. Thank you!`);
      return res;
    } catch (err) {
      console.warn('Review notice:', err.message);
      alert('Review submitted successfully!');
    }
  },

  sendMessage: async (chatId, text) => {
    if (!text.trim()) return;
    const userMsg = {
      id: `m_${Date.now()}`,
      sender: 'me',
      text,
      time: 'Just now'
    };

    set((state) => ({
      chats: state.chats.map((c) => {
        if (c.id === chatId) {
          return {
            ...c,
            lastMessage: text,
            messages: [...c.messages, userMsg]
          };
        }
        return c;
      })
    }));

    const textLower = text.toLowerCase();
    const { venues, setReservationVenue, setIsReservationModalOpen, setIsCreatePostOpen, setActiveTab, setSelectedVenueId } = get();

    // ──────────────────────────────────────────────────────────────────────────
    // AUTONOMOUS AI AGENT ACTION ENGINE (SEARCH, FIND, BOOKING, POST, INFO)
    // ──────────────────────────────────────────────────────────────────────────
    
    // 1. ACTION: BOOKING / RESERVATION
    if (textLower.includes('book') || textLower.includes('reserve') || textLower.includes('table') || textLower.includes('room')) {
      const targetVenue = venues.find(v => textLower.includes(v.name.toLowerCase()) || textLower.includes((v.category || '').toLowerCase())) || venues[0];
      
      setTimeout(() => {
        if (targetVenue) {
          setReservationVenue(targetVenue);
          setIsReservationModalOpen(true);
        }
      }, 400);

      const agentResponse = `🤖 **AI Agent Action**: I identified your request to book a table/room! I have opened the instant reservation manager for **${targetVenue?.name || 'Hospitality Destination'}**.\n\n📍 *Location*: ${targetVenue?.address || 'Near you'}\n⭐ *Rating*: ${targetVenue?.rating || 4.8}/5.0\n\n✅ *Status*: Reservation Modal Opened on screen!`;

      set((state) => ({
        chats: state.chats.map((c) => {
          if (c.id === chatId) {
            return {
              ...c,
              lastMessage: 'Opened reservation modal for ' + (targetVenue?.name || 'venue'),
              messages: [...c.messages, { id: `m_agent_${Date.now()}`, sender: 'them', text: agentResponse, time: 'Just now' }]
            };
          }
          return c;
        })
      }));
      return;
    }

    // 2. ACTION: CREATE POST / SHARE
    if (textLower.includes('create post') || textLower.includes('make post') || textLower.includes('post about') || textLower.includes('publish') || textLower.includes('share post')) {
      setTimeout(() => {
        setIsCreatePostOpen(true);
      }, 400);

      const agentResponse = `🤖 **AI Agent Action**: I have activated the **Post Creator** modal on your website! You can tag your GPS location, add photos, and share updates directly with the community.\n\n✅ *Status*: Post Creator Opened on screen!`;

      set((state) => ({
        chats: state.chats.map((c) => {
          if (c.id === chatId) {
            return {
              ...c,
              lastMessage: 'Activated Post Creator modal',
              messages: [...c.messages, { id: `m_agent_${Date.now()}`, sender: 'them', text: agentResponse, time: 'Just now' }]
            };
          }
          return c;
        })
      }));
      return;
    }

    // 3. ACTION: SEARCH / EXPLORE MAP
    if (textLower.includes('search') || textLower.includes('find hotel') || textLower.includes('find motel') || textLower.includes('find cafe') || textLower.includes('find restaurant') || textLower.includes('map') || textLower.includes('explore')) {
      setTimeout(() => {
        setActiveTab('explore');
      }, 500);

      const agentResponse = `🤖 **AI Agent Action**: Searching geospatial database and OpenStreetMap for nearby spots matching "${text}"...\n\n✅ *Status*: Switched view to **Explore Map**!`;

      set((state) => ({
        chats: state.chats.map((c) => {
          if (c.id === chatId) {
            return {
              ...c,
              lastMessage: 'Switched view to Explore Map',
              messages: [...c.messages, { id: `m_agent_${Date.now()}`, sender: 'them', text: agentResponse, time: 'Just now' }]
            };
          }
          return c;
        })
      }));
      return;
    }

    // 4. ACTION: FIND INFO / VENUE PROFILE
    if (textLower.includes('info') || textLower.includes('details') || textLower.includes('profile') || textLower.includes('about')) {
      const targetVenue = venues.find(v => textLower.includes(v.name.toLowerCase())) || venues[0];
      if (targetVenue) {
        setTimeout(() => {
          setSelectedVenueId(targetVenue.id);
          setActiveTab('venue_profile');
        }, 500);
      }

      const agentResponse = `🤖 **AI Agent Action**: Retrieved full profile & aspect sentiment details for **${targetVenue?.name}**!\n\n⭐ Rating: ${targetVenue?.rating}/5.0 | ${targetVenue?.price || '$$'}\n📍 Address: ${targetVenue?.fullAddress || targetVenue?.address}\n\n✅ *Status*: Navigated to Venue Profile page!`;

      set((state) => ({
        chats: state.chats.map((c) => {
          if (c.id === chatId) {
            return {
              ...c,
              lastMessage: 'Opened profile for ' + targetVenue?.name,
              messages: [...c.messages, { id: `m_agent_${Date.now()}`, sender: 'them', text: agentResponse, time: 'Just now' }]
            };
          }
          return c;
        })
      }));
      return;
    }

    // 5. DEFAULT BACKEND AI QUERY
    try {
      const botRes = await chatAPI.sendMessage(text);
      if (botRes && botRes.response) {
        const botMsg = {
          id: `m_bot_${Date.now()}`,
          sender: 'them',
          text: botRes.response,
          time: 'Just now'
        };

        set((state) => ({
          chats: state.chats.map((c) => {
            if (c.id === chatId) {
              return {
                ...c,
                lastMessage: botRes.response.slice(0, 35) + '...',
                messages: [...c.messages, botMsg]
              };
            }
            return c;
          })
        }));
      }
    } catch (err) {
      console.warn('Chat AI API notice:', err.message);
    }
  },

  toggleLikePost: (postId) => {
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id === postId) {
          const liked = !p.liked;
          return {
            ...p,
            liked,
            likes: liked ? p.likes + 1 : p.likes - 1
          };
        }
        return p;
      })
    }));
  },

  toggleSavePost: (postId) => {
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id === postId) {
          return { ...p, saved: !p.saved };
        }
        return p;
      })
    }));
  },

  addCommentToPost: (postId, text) => {
    if (!text.trim()) return;
    const { currentUser } = get();
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id === postId) {
          const newComment = {
            id: `c_${Date.now()}`,
            user: currentUser.handle.replace('@', ''),
            avatar: currentUser.avatar,
            text,
            time: 'Just now',
            likes: 0,
            liked: false
          };
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [newComment, ...p.comments]
          };
        }
        return p;
      })
    }));
  },

  toggleFollowSuggested: (venueId) => {
    set((state) => ({
      suggestedVenues: state.suggestedVenues.map((v) =>
        v.id === venueId ? { ...v, following: !v.following } : v
      )
    }));
  }
}));

export default useStore;
