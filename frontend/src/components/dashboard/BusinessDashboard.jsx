import React from 'react';
import useStore, { IMAGES } from '../../store/store';
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Star,
  Eye,
  PlusCircle,
  ArrowUpRight
} from 'lucide-react';

const BusinessDashboard = () => {
  const { venues, setIsCreatePostOpen } = useStore();
  const venue = venues[0];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 md:px-8 select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-zinc-900">Business Dashboard</h1>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            Managing <strong className="text-zinc-800">{venue.name}</strong> · Downtown District
          </p>
        </div>

        <button
          onClick={() => setIsCreatePostOpen(true)}
          className="flex items-center gap-2 bg-[#FF5A5F] hover:bg-[#E0484D] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-transform hover:scale-105 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Promotion</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Weekly Impressions', value: '48.2k', change: '+14.6%', icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Table Bookings', value: '184', change: '+22.4%', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Live Deal Claims', value: '92', change: '+8.1%', icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Average Rating', value: '4.9 ★', change: '1,204 reviews', icon: Star, color: 'text-[#FF5A5F]', bg: 'bg-[#FFF0F1]' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white border border-zinc-200/80 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{stat.label}</span>
                <div className={`w-8 h-8 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-zinc-900 mb-1">{stat.value}</div>
              <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Performance & Active Deals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Live Promotion Performance */}
        <div className="lg:col-span-2 bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-xs">
          <h3 className="text-base font-bold text-zinc-900 mb-4">Active Promotions & Flash Deals</h3>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFF0F1] to-white border border-[#FFE2E4] mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={IMAGES.ramen} alt="Promo" className="w-14 h-14 rounded-xl object-cover" />
              <div>
                <span className="bg-[#FF5A5F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  LIVE NOW
                </span>
                <h4 className="font-bold text-sm text-zinc-900 mt-1">15% off dinner tonight</h4>
                <p className="text-xs text-zinc-500">Valid 5PM–9PM · 42 claims today</p>
              </div>
            </div>

            <button className="text-xs font-bold text-zinc-600 hover:text-zinc-900 bg-white px-3 py-1.5 rounded-lg border border-zinc-200 shadow-2xs">
              Manage
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/60 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={IMAGES.ribs} alt="Promo" className="w-14 h-14 rounded-xl object-cover" />
              <div>
                <span className="bg-zinc-200 text-zinc-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  SCHEDULED
                </span>
                <h4 className="font-bold text-sm text-zinc-900 mt-1">Weekend BBQ Feast Special</h4>
                <p className="text-xs text-zinc-500">Starts Saturday 12 PM</p>
              </div>
            </div>

            <button className="text-xs font-bold text-zinc-600 hover:text-zinc-900 bg-white px-3 py-1.5 rounded-lg border border-zinc-200 shadow-2xs">
              Edit
            </button>
          </div>
        </div>

        {/* Right 1 Col: Live Sentiment & Customer Demographics */}
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-xs">
          <h3 className="text-base font-bold text-zinc-900 mb-4">Customer Sentiment (NLP)</h3>
          
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-zinc-700">Food Quality & Taste</span>
                <span className="text-emerald-600">98% Positive</span>
              </div>
              <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[98%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-zinc-700">Service & Speed</span>
                <span className="text-emerald-600">92% Positive</span>
              </div>
              <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[92%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-zinc-700">Ambience & Noise Level</span>
                <span className="text-emerald-600">94% Positive</span>
              </div>
              <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[94%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default BusinessDashboard;
