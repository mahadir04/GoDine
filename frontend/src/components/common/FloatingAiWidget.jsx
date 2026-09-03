import React, { useState, useRef, useEffect } from 'react';
import useStore, { IMAGES } from '../../store/store';
import {
  Bot,
  Sparkles,
  Zap,
  X,
  Send,
  Compass,
  Tag,
  Calendar,
  MapPin,
  Radar,
  ArrowRight,
  PlusCircle
} from 'lucide-react';

const FloatingAiWidget = () => {
  const {
    sendMessage,
    chats,
    activeTab,
    setActiveTab,
    setReservationVenue,
    setIsReservationModalOpen,
    setSelectedVenueId,
    setIsCreatePostOpen,
    venues,
    posts
  } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [isScanningDeals, setIsScanningDeals] = useState(false);
  const [dealResults, setDealResults] = useState([]);
  const chatEndRef = useRef(null);

  const aiChat = chats.find(c => c.id === 'ai_assistant') || chats[0];

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, aiChat?.messages, dealResults]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputMsg.trim()) return;
    sendMessage('ai_assistant', inputMsg);
    setInputMsg('');
  };

  // 1-Tap Nearby Deal & Offer Radar Scanner
  const handleScanNearbyDeals = () => {
    setIsScanningDeals(true);
    setDealResults([]);

    setTimeout(() => {
      // Collect deals from venues & posts
      const activeDeals = [];

      // Check posts for discount tags
      posts.forEach(p => {
        if (p.badge || p.discount_pct) {
          activeDeals.push({
            id: p.id,
            venueName: p.venueName || 'Local Hotspot',
            badge: p.badge || '15% OFF SPECIAL',
            address: p.venueDistance || '0.8 km away',
            heroImage: p.images?.[0] || IMAGES.ramen,
            venueId: p.venueId
          });
        }
      });

      // Check venues
      venues.forEach(v => {
        if (v.category === 'HOTEL' || v.category === 'RESTAURANT' || v.category === 'CAFE') {
          activeDeals.push({
            id: `v_deal_${v.id}`,
            venueName: v.name,
            badge: v.category === 'HOTEL' ? '20% OFF TODAY' : '15% OFF PROMO',
            address: v.address || 'Near location',
            heroImage: v.heroImage || IMAGES.restaurantHero,
            venueId: v.id,
            venueObj: v
          });
        }
      });

      setDealResults(activeDeals.slice(0, 3));
      setIsScanningDeals(false);

      // Send confirmation to chat
      sendMessage('ai_assistant', 'Radar scan complete: Found top active deals nearby!');
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#FF5A5F] selection:text-white">
      
      {/* 1. Floating AI Assistant & Deal Radar Trigger Button */}
      {!isOpen && (
        <div className="flex items-center gap-2">
          {/* Quick 1-Tap Deal Radar Button */}
          <button
            onClick={() => {
              setIsOpen(true);
              handleScanNearbyDeals();
            }}
            className="bg-zinc-950/90 hover:bg-zinc-900 text-amber-400 border border-amber-500/30 px-3.5 py-2.5 rounded-full shadow-xl backdrop-blur-md text-xs font-black flex items-center gap-1.5 hover:scale-105 transition-all cursor-pointer"
            title="1-Tap Deal Radar"
          >
            <Radar className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Deals Radar</span>
          </button>

          {/* Main Floating AI Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative bg-gradient-to-r from-[#FF5A5F] to-rose-500 hover:from-[#E0484D] hover:to-rose-600 text-white p-3.5 rounded-full shadow-2xl shadow-[#FF5A5F]/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer group"
          >
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
          </button>
        </div>
      )}

      {/* 2. Expandable Glassmorphism AI Chat & Radar Panel */}
      {isOpen && (
        <div className="w-96 h-[540px] bg-zinc-950/95 border border-zinc-800 rounded-3xl shadow-2xl backdrop-blur-2xl text-white flex flex-col justify-between overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Panel Header */}
          <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FF5A5F] to-indigo-500 flex items-center justify-center text-white shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white flex items-center gap-1">
                  <span>GoDine AI Agent</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h3>
                <p className="text-[10px] text-zinc-400 font-bold">Autonomous Agent & Deal Radar</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* 1-Tap Deal Radar Scan Button */}
              <button
                onClick={handleScanNearbyDeals}
                disabled={isScanningDeals}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer"
                title="Scan Nearby Deals"
              >
                <Radar className={`w-3.5 h-3.5 ${isScanningDeals ? 'animate-spin' : ''}`} />
                <span>Deals Radar</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Panel Messages & Deal Stream Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-950/40 text-xs">
            
            {/* 1-Tap Deal Radar Cards Stream */}
            {dealResults.length > 0 && (
              <div className="bg-zinc-900/90 border border-amber-500/30 rounded-2xl p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>Nearby 1-Tap Deals Found ({dealResults.length})</span>
                  </span>
                </div>

                <div className="space-y-2">
                  {dealResults.map((deal) => (
                    <div key={deal.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 flex items-center justify-between gap-3">
                      <img src={deal.heroImage} alt={deal.venueName} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-black text-white truncate">{deal.venueName}</h5>
                        <span className="text-[9px] font-black text-[#FF5A5F] bg-[#FFF0F1]/10 px-1.5 py-0.5 rounded-md uppercase">
                          {deal.badge}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const v = venues.find(x => x.id === deal.venueId) || venues[0];
                          setReservationVenue(v);
                          setIsReservationModalOpen(true);
                        }}
                        className="bg-[#FF5A5F] hover:bg-[#E0484D] text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg shrink-0 cursor-pointer"
                      >
                        Book
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conversation Messages */}
            {aiChat?.messages?.map((m) => {
              const isMe = m.sender === 'me';
              return (
                <div
                  key={m.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                      isMe
                        ? 'bg-[#FF5A5F] text-white rounded-br-xs font-bold'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-xs'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}

            <div ref={chatEndRef} />
          </div>

          {/* Autonomous Quick Chips */}
          <div className="px-3 py-1.5 bg-zinc-900/80 border-t border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto text-[10px]">
            <button
              onClick={() => sendMessage('ai_assistant', 'book table at Copper Kettle Bistro')}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2.5 py-1 rounded-full shrink-0 cursor-pointer font-bold"
            >
              📅 Book Table
            </button>
            <button
              onClick={() => sendMessage('ai_assistant', 'create post about dining')}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2.5 py-1 rounded-full shrink-0 cursor-pointer font-bold"
            >
              ✍️ Post
            </button>
            <button
              onClick={() => sendMessage('ai_assistant', 'search hotels near me')}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2.5 py-1 rounded-full shrink-0 cursor-pointer font-bold"
            >
              🗺️ Map
            </button>
          </div>

          {/* Panel Input Bar */}
          <form onSubmit={handleSend} className="p-3 border-t border-zinc-800 bg-zinc-900/90 flex gap-2">
            <input
              type="text"
              placeholder="Ask AI agent to book, post, search..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5A5F] transition-all font-bold"
            />
            <button
              type="submit"
              className="bg-[#FF5A5F] hover:bg-[#E0484D] text-white p-2.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};

export default FloatingAiWidget;
