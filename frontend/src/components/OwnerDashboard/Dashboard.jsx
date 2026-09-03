import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import useStore from '../../store/store';
import axios from 'axios';
import { BarChart3, TrendingUp, Users, Megaphone, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const Dashboard = () => {
  const { user, token } = useStore();
  const [venues, setVenues] = useState([]);
  const [activeVenue, setActiveVenue] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Promo Form state
  const [content, setContent] = useState('');
  const [discount, setDiscount] = useState(20);
  const [durationHours, setDurationHours] = useState(6);
  const [publishing, setPublishing] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [promoError, setPromoError] = useState('');

  // 1. Load Owner Venues on Mount
  useEffect(() => {
    const loadOwnerVenues = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/v1/venues/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Filter venues owned by this user
        const ownerVenues = response.data.filter(v => v.owner_id === user.id);
        setVenues(ownerVenues);
        if (ownerVenues.length > 0) {
          setActiveVenue(ownerVenues[0]);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading owner venues: ", err);
        // Fallback mock venue for testing
        const mockV = {
          id: "e4a2e1d0-9999-4c12-8822-123456789abc",
          name: "Artisan Smokehouse & Bistro",
          category: "RESTAURANT",
          owner_id: user.id
        };
        setVenues([mockV]);
        setActiveVenue(mockV);
      }
    };
    loadOwnerVenues();
  }, [token, user.id]);

  // 2. Fetch Analytics for Selected Venue
  useEffect(() => {
    if (!activeVenue) return;
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8000/api/v1/analytics/venue/${activeVenue.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnalytics(response.data);
      } catch (err) {
        console.error("Error loading analytics: ", err);
        // Load fallback mock analytics
        setAnalytics({
          venue_name: activeVenue.name,
          average_rating: 4.6,
          total_reviews: 14,
          aspect_averages: { taste: 4.7, ambience: 4.1, service: 3.2, portion: 4.3, price: 3.5 },
          sentiment_timeline: [
            { date: "Mon", sentiment_score: 0.6, reviews_count: 5 },
            { date: "Tue", sentiment_score: 0.7, reviews_count: 4 },
            { date: "Wed", sentiment_score: 0.5, reviews_count: 8 },
            { date: "Thu", sentiment_score: 0.8, reviews_count: 3 },
            { date: "Fri", sentiment_score: 0.4, reviews_count: 12 },
            { date: "Sat", sentiment_score: 0.9, reviews_count: 18 },
            { date: "Sun", sentiment_score: 0.85, reviews_count: 14 }
          ],
          demographics: {
            age_groups: { "18-24": 42, "25-34": 38, "35-44": 12, "45+": 8 },
            gender: { "Male": 54, "Female": 44, "Other": 2 },
            live_occupancy: 68
          }
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [activeVenue, token]);

  const handleBroadcastPromo = async (e) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess(false);
    if (!content.trim()) {
      setPromoError('Please enter the promotional message content.');
      return;
    }
    setPublishing(true);
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + durationHours);

      await axios.post('http://localhost:8000/api/v1/posts/', {
        venue_id: activeVenue.id,
        post_type: "PROMO",
        content: content,
        media_urls: ["https://images.unsplash.com/photo-1544025162-d76694265947"],
        discount_pct: discount,
        expires_at: expiresAt.toISOString()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setContent('');
      setPromoSuccess(true);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

    } catch (err) {
      console.error("Error creating promo: ", err);
      setPromoError("Failed to broadcast promotional offer. Check endpoint connectivity.");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)] bg-zinc-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!activeVenue) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] bg-zinc-950 p-6">
        <AlertCircle className="h-10 w-10 text-rose-500 mb-3" />
        <h2 className="text-md font-bold text-zinc-300">No venues owned</h2>
        <p className="text-xs text-zinc-500 mt-1 max-w-xs text-center leading-relaxed">
          Please register a restaurant or cafe venue using your OWNER credentials first.
        </p>
      </div>
    );
  }

  // 1. Line Chart Config - Sentiment Scores over time
  const sentimentTimelineOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: '#18181b', borderColor: '#27272a', textStyle: { color: '#fafafa' } },
    xAxis: {
      type: 'category',
      data: analytics?.sentiment_timeline.map(t => t.date) || [],
      axisLine: { lineStyle: { color: '#27272a' } },
      axisLabel: { color: '#a1a1aa', fontFamily: 'monospace' }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 1.0,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#1e1e24' } },
      axisLabel: { color: '#a1a1aa', fontFamily: 'monospace' }
    },
    series: [{
      data: analytics?.sentiment_timeline.map(t => t.sentiment_score) || [],
      type: 'line',
      smooth: true,
      lineStyle: { color: '#3b82f6', width: 3 },
      itemStyle: { color: '#3b82f6' },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: 'rgba(59, 130, 246, 0.3)' }, { offset: 1, color: 'rgba(59, 130, 246, 0.0)' }]
        }
      }
    }]
  };

  // 2. Bar Chart Config - Aspect Scores Breakdown
  const aspectScoresOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: '#18181b', borderColor: '#27272a', textStyle: { color: '#fafafa' } },
    xAxis: {
      type: 'value',
      min: 1.0,
      max: 5.0,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#1e1e24' } },
      axisLabel: { color: '#a1a1aa', fontFamily: 'monospace' }
    },
    yAxis: {
      type: 'category',
      data: Object.keys(analytics?.aspect_averages || {}).map(asp => asp.toUpperCase()),
      axisLine: { lineStyle: { color: '#27272a' } },
      axisLabel: { color: '#a1a1aa', fontFamily: 'monospace' }
    },
    series: [{
      data: Object.values(analytics?.aspect_averages || {}),
      type: 'bar',
      itemStyle: {
        color: '#10b981',
        borderRadius: [0, 6, 6, 0]
      },
      barWidth: '50%'
    }]
  };

  // 3. Pie Chart Config - Demographic distribution
  const demographicOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', backgroundColor: '#18181b', borderColor: '#27272a', textStyle: { color: '#fafafa' } },
    legend: { bottom: '0%', left: 'center', textStyle: { color: '#a1a1aa' } },
    series: [
      {
        name: 'Age Group',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#09090b', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: 12, fontWeight: 'bold', color: '#fff' } },
        labelLine: { show: false },
        data: Object.keys(analytics?.demographics.age_groups || {}).map(key => ({
          value: analytics.demographics.age_groups[key],
          name: key
        }))
      }
    ]
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 flex flex-col gap-6 bg-zinc-950">
      
      {/* Top Banner metrics row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-white">Merchant ROI Command Center</h2>
          <p className="text-xs text-zinc-500 mt-1 font-mono">Managing analytics for {activeVenue?.name}</p>
        </div>
        
        {/* Dropdown selector */}
        {venues.length > 1 && (
          <select
            value={activeVenue.id}
            onChange={(e) => setActiveVenue(venues.find(v => v.id === e.target.value))}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 font-bold focus:outline-none focus:border-blue-500"
          >
            {venues.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Average Rating</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">★ {analytics?.average_rating}</h3>
          </div>
          <div className="bg-amber-500/10 text-amber-400 p-3 rounded-xl border border-amber-500/20">
            <Megaphone className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Sentiment Index</p>
            <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">+85%</h3>
          </div>
          <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl border border-emerald-500/20">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Total Feed Reviews</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{analytics?.total_reviews}</h3>
          </div>
          <div className="bg-zinc-850 text-zinc-400 p-3 rounded-xl border border-zinc-800">
            <BarChart3 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Live Occupancy Density</p>
            <h3 className="text-2xl font-extrabold text-blue-400 mt-1">{analytics?.demographics.live_occupancy} guests</h3>
          </div>
          <div className="bg-blue-500/10 text-blue-400 p-3 rounded-xl border border-blue-500/20">
            <Users className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Main Grid Content Split (1 Chart Per Row in Left Content) */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Charts list (Each chart gets its own full container card, 1 chart per row) */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          
          {/* Chart 1: Sentiment timeline */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-4 border-b border-zinc-850 pb-3">
              <TrendingUp className="h-4.5 w-4.5 text-blue-400" />
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Weekly Aspect Sentiment Trend</h3>
            </div>
            <div className="h-[280px] w-full">
              <ReactECharts option={sentimentTimelineOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>

          {/* Chart 2: Aspect ratings */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-4 border-b border-zinc-850 pb-3">
              <Megaphone className="h-4.5 w-4.5 text-emerald-400" />
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Aspect Ratings Analysis</h3>
            </div>
            <div className="h-[280px] w-full">
              <ReactECharts option={aspectScoresOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>

        </div>

        {/* Right Side: Promo creator & Demographics pie */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Promo broadcasting Form */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-4 border-b border-zinc-850 pb-3">
              <Megaphone className="h-4.5 w-4.5 text-indigo-400" />
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Broadcast Promo Campaign</h3>
            </div>

            {promoSuccess && (
              <div className="flex gap-2 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-800/30 p-3 rounded-lg mb-4">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                <span>Promo broadcast successfully added to spatial diner feeds!</span>
              </div>
            )}
            
            {promoError && (
              <div className="flex gap-2 text-xs text-rose-500 bg-rose-500/5 border border-rose-800/30 p-3 rounded-lg mb-4">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{promoError}</span>
              </div>
            )}

            <form onSubmit={handleBroadcastPromo} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Flash Sale Info</label>
                <textarea
                  placeholder="e.g. Freshly pit-cooked briskets ready! Use 20% discount code BBQ20 until midnight."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows="3"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                  <span>Discount Percentage</span>
                  <span className="font-bold text-rose-400">{discount}% OFF</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={discount}
                  onChange={(e) => setDiscount(parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                  <span>Active Window Duration</span>
                  <span className="font-bold text-blue-400">{durationHours} Hours</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="24"
                  step="2"
                  value={durationHours}
                  onChange={(e) => setDurationHours(parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={publishing}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2.5 text-xs font-bold transition-all disabled:opacity-50 mt-2"
              >
                {publishing ? 'Publishing...' : 'Broadcast Promo Code'}
              </button>
            </form>
          </div>

          {/* Demographic Pie chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-4 border-b border-zinc-850 pb-3">
              <Users className="h-4.5 w-4.5 text-zinc-400" />
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Diner Demographics</h3>
            </div>
            <div className="h-[220px] w-full">
              <ReactECharts option={demographicOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
