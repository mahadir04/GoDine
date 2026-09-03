import React, { useState, useEffect } from 'react';
import useStore from '../../store/store';
import axios from 'axios';
import { X, Star, Sparkles, MessageSquarePlus, MessageSquareDot, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const VenueDetailModal = () => {
  const { activeVenueId, setActiveVenueId, token } = useStore();
  const [venue, setVenue] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [dishName, setDishName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!activeVenueId) return;
    
    const fetchVenueDetails = async () => {
      setLoading(true);
      try {
        const vResp = await axios.get(`http://localhost:8000/api/v1/venues/${activeVenueId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVenue(vResp.data);

        const rResp = await axios.get(`http://localhost:8000/api/v1/reviews/venue/${activeVenueId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReviews(rResp.data);
      } catch (err) {
        console.error("Error fetching venue details: ", err);
        // Load fallback details if offline
        generateFallbackDetails();
      } finally {
        setLoading(false);
      }
    };

    fetchVenueDetails();
  }, [activeVenueId, token]);

  const generateFallbackDetails = () => {
    setVenue({
      id: activeVenueId,
      name: "Artisan Smokehouse & Bistro",
      category: "RESTAURANT",
      description: "Premium slow-smoked briskets, ribs, and craft burgers. Best BBQ in town.",
      price_tier: 4,
      latitude: 23.776000,
      longitude: 90.398000,
      address: "Road 11, Banani, Dhaka",
      opening_hours: {"mon-fri": "12:00-23:00", "sat-sun": "12:00-00:00"},
      average_rating: 4.8
    });
    setReviews([
      {
        id: "r1",
        dish_name: "Smoked Beef Brisket",
        rating: 5,
        review_text: "Brisket was extremely juicy and tender! Price is high but worth the money.",
        sentiment_score: 0.95,
        aspect_scores: { taste: 5.0, price: 2.0, service: 4.0, portion: 4.0, ambience: 4.0 },
        created_at: new Date().toISOString()
      },
      {
        id: "r2",
        dish_name: "BBQ Platter",
        rating: 3,
        review_text: "The BBQ sauce was good, but service was too slow. Waited 45 mins.",
        sentiment_score: -0.2,
        aspect_scores: { taste: 4.0, service: 1.0, ambience: 3.0, portion: 3.0, price: 3.0 },
        created_at: new Date().toISOString()
      }
    ]);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!reviewText.trim()) {
      setFormError('Please write your review feedback.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await axios.post('http://localhost:8000/api/v1/reviews/', {
        venue_id: activeVenueId,
        dish_name: dishName || null,
        rating: rating,
        review_text: reviewText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Clear form
      setDishName('');
      setReviewText('');
      setRating(5);
      
      // Add new review to list
      setReviews([response.data, ...reviews]);
      
      // Update average rating locally
      if (venue) {
        const newTotal = reviews.reduce((acc, r) => acc + r.rating, 0) + rating;
        const newAvg = (newTotal / (reviews.length + 1)).toFixed(2);
        setVenue({ ...venue, average_rating: parseFloat(newAvg) });
      }

      // Spark celebration!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 }
      });

    } catch (err) {
      console.error("Error submitting review: ", err);
      setFormError("Failed to submit review. Running in fallback mode.");
      
      // Mock review add for UI testing if offline
      const mockRes = {
        id: Math.random().toString(),
        venue_id: activeVenueId,
        dish_name: dishName || "Special Dish",
        rating: rating,
        review_text: reviewText,
        sentiment_score: 0.8,
        aspect_scores: { taste: 4.5, service: 3.0, ambience: 4.0, portion: 4.0, price: 3.0 },
        created_at: new Date().toISOString()
      };
      setReviews([mockRes, ...reviews]);
    } finally {
      setSubmitting(false);
    }
  };

  if (!activeVenueId) return null;

  // Calculate simulated aspect averages if not loaded from backend
  const aspectAverages = {
    taste: 4.2,
    ambience: 3.8,
    service: 3.5,
    portion: 4.0,
    price: 3.0
  };

  if (reviews.length > 0) {
    const aspects = ["taste", "ambience", "service", "portion", "price"];
    aspects.forEach(asp => {
      let sum = 0;
      let count = 0;
      reviews.forEach(r => {
        if (r.aspect_scores && r.aspect_scores[asp]) {
          sum += r.aspect_scores[asp];
          count++;
        }
      });
      if (count > 0) {
        aspectAverages[asp] = roundToOne(sum / count);
      }
    });
  }

  function roundToOne(num) {
    return Math.round(num * 10) / 10;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row">
        
        {/* Left Column - Details & Aspect scores */}
        <div className="w-full md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-zinc-800">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] font-mono font-bold bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded-md">
                {venue?.category}
              </span>
              <h2 className="text-xl font-extrabold text-white mt-1">{venue?.name}</h2>
              <p className="text-xs text-zinc-500 mt-1">{venue?.address}</p>
            </div>
            
            <button
              onClick={() => setActiveVenueId(null)}
              className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed mb-6">
            {venue?.description}
          </p>

          {/* Aspect sentiment rating bars */}
          <div className="mb-6 bg-zinc-950/50 rounded-2xl p-4 border border-zinc-800/60">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">AI Aspect Sentiment Ratings</h3>
            </div>
            
            <div className="flex flex-col gap-3">
              {Object.keys(aspectAverages).map((aspect) => {
                const score = aspectAverages[aspect];
                // Convert 1-5 score to % width
                const pct = ((score - 1) / 4) * 100;
                let colorClass = 'bg-emerald-500';
                if (score < 3.0) colorClass = 'bg-rose-500';
                else if (score < 4.0) colorClass = 'bg-amber-400';

                return (
                  <div key={aspect}>
                    <div className="flex justify-between text-xs mb-1.5 capitalize">
                      <span className="text-zinc-400">{aspect}</span>
                      <span className="font-bold text-zinc-200 font-mono">{score.toFixed(1)} / 5.0</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full ${colorClass} rounded-full`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Opening Hours Info */}
          <div className="text-xs text-zinc-500 font-mono">
            <h4 className="font-bold text-zinc-400 mb-1">Operating Hours</h4>
            {venue?.opening_hours && Object.keys(venue.opening_hours).map(day => (
              <div key={day} className="flex gap-2">
                <span className="uppercase text-zinc-600">{day}:</span>
                <span>{venue.opening_hours[day]}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column - Reviews & Form */}
        <div className="w-full md:w-1/2 p-6 flex flex-col max-h-[85vh] md:max-h-none overflow-y-auto">
          
          {/* Write a Review Section */}
          <form onSubmit={handleReviewSubmit} className="mb-6 border-b border-zinc-800 pb-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquarePlus className="h-4.5 w-4.5 text-blue-500" />
              <h3 className="text-sm font-bold text-zinc-200">Submit Diner Feedback</h3>
            </div>

            {formError && (
              <p className="text-xs text-rose-500 bg-rose-500/5 border border-rose-800/30 p-2.5 rounded-lg mb-3">
                {formError}
              </p>
            )}

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-zinc-400">Rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((stars) => (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => setRating(stars)}
                    className="text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star className={`h-5 w-5 ${rating >= stars ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              placeholder="Dish Name (e.g. Basmati Kacchi) - Optional"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 placeholder-zinc-600 mb-3 focus:outline-none focus:border-blue-500"
            />

            <textarea
              placeholder="Write your review... Supports English, Bangla (খাবার চমৎকার) & Banglish (kacchi mozar chilo kintu service slow)"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows="3"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 placeholder-zinc-600 mb-4 focus:outline-none focus:border-blue-500"
            ></textarea>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2.5 text-xs font-bold transition-colors shadow-lg shadow-blue-500/10 disabled:opacity-50"
            >
              {submitting ? 'Analyzing & Posting...' : 'Submit Review (Trigger AI ABSA)'}
            </button>
          </form>

          {/* Historical Reviews List */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquareDot className="h-4.5 w-4.5 text-zinc-400" />
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Historical Reviews ({reviews.length})</h3>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px]">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-zinc-950/40 border border-zinc-850 p-3.5 rounded-xl">
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        ))}
                      </div>
                      {rev.dish_name && (
                        <span className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 rounded">
                          {rev.dish_name}
                        </span>
                      )}
                    </div>
                    
                    {/* Sentiment Analysis Score Badge */}
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      rev.sentiment_score > 0.1 ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/30' :
                      rev.sentiment_score < -0.1 ? 'bg-rose-950/50 text-rose-400 border border-rose-900/30' :
                      'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}>
                      {rev.sentiment_score > 0.1 ? 'Positive' : rev.sentiment_score < -0.1 ? 'Negative' : 'Mixed/Neutral'}
                    </span>
                  </div>
                  
                  <p className="text-xs text-zinc-300 mb-2 leading-relaxed">
                    {rev.review_text}
                  </p>
                  
                  <p className="text-[10px] text-zinc-600 font-mono">
                    Reviewed on {new Date(rev.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default VenueDetailModal;
