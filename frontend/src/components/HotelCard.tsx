'use client';

import { Hotel } from '@/types';
import { Star, MapPin, DollarSign } from 'lucide-react';

interface Props {
  hotels: Hotel[];
}

const tierStyles: Record<string, string> = {
  'Budget':    'text-green-400 bg-green-500/10 border-green-500/20',
  'Mid-Range': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  'Luxury':    'text-purple-400 bg-purple-500/10 border-purple-500/20',
};

export default function HotelCard({ hotels }: Props) {
  if (!hotels || hotels.length === 0) return null;

  return (
    <div className="card space-y-4">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Recommended Hotels</h3>
        <p className="text-slate-400 text-sm">Options across all budget tiers</p>
      </div>

      <div className="space-y-3">
        {hotels.map((hotel, idx) => (
          <div key={hotel._id || idx} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-colors">
            <div className="flex justify-between items-start gap-3 mb-2">
              <h4 className="font-semibold text-white text-sm">{hotel.name}</h4>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${tierStyles[hotel.tier] || tierStyles['Mid-Range']}`}>
                {hotel.tier}
              </span>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
              {hotel.rating && (
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400" />
                  {hotel.rating}
                </span>
              )}
              {hotel.estimatedCostNightUSD > 0 && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-slate-400" />
                  ${hotel.estimatedCostNightUSD}/night
                </span>
              )}
              {hotel.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {hotel.location}
                </span>
              )}
            </div>

            {hotel.highlights && (
              <p className="text-slate-500 text-xs mt-2">{hotel.highlights}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
