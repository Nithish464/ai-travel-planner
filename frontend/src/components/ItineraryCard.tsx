'use client';

import { useState } from 'react';
import { ItineraryDay, Activity } from '@/types';
import { Plus, Trash2, RefreshCw, Clock, Loader2 } from 'lucide-react';

interface Props {
  day: ItineraryDay;
  tripId: string;
  onAddActivity: (dayNumber: number, title: string, timeOfDay: string) => Promise<void>;
  onRemoveActivity: (dayNumber: number, activityId: string) => Promise<void>;
  onRegenerateDay: (dayNumber: number, userRequest: string) => Promise<void>;
}

const timeColors: Record<string, string> = {
  Morning:   'bg-amber-500/10 text-amber-300 border border-amber-500/20',
  Afternoon: 'bg-sky-500/10 text-sky-300 border border-sky-500/20',
  Evening:   'bg-purple-500/10 text-purple-300 border border-purple-500/20',
};

export default function ItineraryCard({ day, tripId, onAddActivity, onRemoveActivity, onRegenerateDay }: Props) {
  const [newActivity, setNewActivity] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<'Morning' | 'Afternoon' | 'Evening'>('Afternoon');
  const [regenRequest, setRegenRequest] = useState('');
  const [showRegenForm, setShowRegenForm] = useState(false);
  const [addingActivity, setAddingActivity] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const handleAddActivity = async () => {
    if (!newActivity.trim()) return;
    setAddingActivity(true);
    await onAddActivity(day.dayNumber, newActivity, timeOfDay);
    setNewActivity('');
    setAddingActivity(false);
  };

  const handleRegen = async () => {
    setRegenerating(true);
    await onRegenerateDay(day.dayNumber, regenRequest);
    setRegenRequest('');
    setShowRegenForm(false);
    setRegenerating(false);
  };

  return (
    <div className="border border-slate-800 rounded-2xl overflow-hidden animate-fade-in">
      {/* Day Header */}
      <div className="bg-slate-800/50 px-5 py-3 flex justify-between items-center">
        <div>
          <span className="text-sky-400 font-bold text-sm uppercase tracking-wide">Day {day.dayNumber}</span>
          {day.theme && <p className="text-white font-semibold text-sm mt-0.5">{day.theme}</p>}
        </div>
        <button
          onClick={() => setShowRegenForm(!showRegenForm)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-medium transition-colors px-2 py-1 rounded-lg hover:bg-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Regenerate
        </button>
      </div>

      {/* Regenerate Form */}
      {showRegenForm && (
        <div className="bg-indigo-950/30 border-b border-indigo-500/20 px-5 py-3 flex gap-2">
          <input
            type="text"
            className="input text-sm py-2 flex-1"
            placeholder='e.g. "More outdoor activities" or "Focus on local food"'
            value={regenRequest}
            onChange={(e) => setRegenRequest(e.target.value)}
          />
          <button
            onClick={handleRegen}
            disabled={regenerating}
            className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5 whitespace-nowrap"
          >
            {regenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {regenerating ? 'Regenerating...' : 'Go'}
          </button>
        </div>
      )}

      {/* Activities */}
      <div className="p-5 space-y-3">
        {day.activities.map((activity, idx) => (
          <div key={activity._id || idx} className="flex items-start gap-3 group">
            <div className="flex-1 bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">{activity.title}</p>
                  {activity.description && (
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">{activity.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${timeColors[activity.timeOfDay] || timeColors.Morning}`}>
                    {activity.timeOfDay}
                  </span>
                  {activity.estimatedCostUSD > 0 && (
                    <span className="text-xs text-slate-400">${activity.estimatedCostUSD}</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => activity._id && onRemoveActivity(day.dayNumber, activity._id)}
              className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 mt-3"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* Add Activity */}
        <div className="flex gap-2 pt-1">
          <select
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(e.target.value as 'Morning' | 'Afternoon' | 'Evening')}
            className="input text-sm py-2 w-32 shrink-0"
          >
            <option>Morning</option>
            <option>Afternoon</option>
            <option>Evening</option>
          </select>
          <input
            type="text"
            className="input text-sm py-2 flex-1"
            placeholder="Add an activity..."
            value={newActivity}
            onChange={(e) => setNewActivity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddActivity()}
          />
          <button
            onClick={handleAddActivity}
            disabled={!newActivity.trim() || addingActivity}
            className="btn-primary text-sm py-2 px-3"
          >
            {addingActivity ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
