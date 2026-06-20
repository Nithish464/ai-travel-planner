'use client';

import { useState } from 'react';
import { Plane, Loader2, X } from 'lucide-react';

const INTERESTS = ['Food & Cuisine', 'Culture & History', 'Adventure', 'Shopping', 'Nature', 'Nightlife', 'Art & Museums', 'Beaches', 'Photography', 'Wellness & Spa'];
const BUDGET_TIERS = [
  { value: 'Low', label: 'Budget', desc: 'Hostels, street food, free sights', color: 'text-green-400 border-green-500/40 bg-green-500/10' },
  { value: 'Medium', label: 'Mid-Range', desc: 'Hotels, local restaurants, paid tours', color: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10' },
  { value: 'High', label: 'Luxury', desc: 'Resorts, fine dining, premium experiences', color: 'text-purple-400 border-purple-500/40 bg-purple-500/10' },
];

interface Props {
  onGenerate: (data: {
    destination: string;
    durationDays: number;
    budgetTier: string;
    interests: string[];
    startDate: string;
  }) => Promise<void>;
  loading: boolean;
}

export default function CreateTripForm({ onGenerate, loading }: Props) {
  const [destination, setDestination] = useState('');
  const [durationDays, setDurationDays] = useState(5);
  const [budgetTier, setBudgetTier] = useState('Medium');
  const [interests, setInterests] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [error, setError] = useState('');

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!destination.trim()) return setError('Please enter a destination.');
    if (interests.length === 0) return setError('Select at least one interest.');
    await onGenerate({ destination, durationDays, budgetTier, interests, startDate });
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Plan a New Trip</h2>
        <p className="text-slate-400 text-sm">Fill in the details and our AI will build your itinerary.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm flex justify-between items-center">
          {error}
          <X className="w-4 h-4 cursor-pointer" onClick={() => setError('')} />
        </div>
      )}

      {/* Destination */}
      <div>
        <label className="label">Destination</label>
        <input
          type="text"
          className="input"
          placeholder="e.g. Tokyo, Japan"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          required
        />
      </div>

      {/* Days + Start Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Duration (days)</label>
          <input
            type="number"
            className="input"
            min={1}
            max={30}
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="label">Start Date <span className="text-slate-500">(optional)</span></label>
          <input
            type="date"
            className="input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="label">Budget Preference</label>
        <div className="grid grid-cols-3 gap-3">
          {BUDGET_TIERS.map(({ value, label, desc, color }) => (
            <button
              type="button"
              key={value}
              onClick={() => setBudgetTier(value)}
              className={`p-3 rounded-xl border text-left transition-all ${
                budgetTier === value ? color : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
              }`}
            >
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs mt-0.5 opacity-75">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div>
        <label className="label">Interests <span className="text-slate-500">(select all that apply)</span></label>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((interest) => (
            <button
              type="button"
              key={interest}
              onClick={() => toggleInterest(interest)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                interests.includes(interest)
                  ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
        {interests.length > 0 && (
          <p className="text-xs text-slate-500 mt-2">{interests.length} selected</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating your itinerary...
          </>
        ) : (
          <>
            <Plane className="w-4 h-4" />
            Generate Itinerary
          </>
        )}
      </button>
    </form>
  );
}
