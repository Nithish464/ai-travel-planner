'use client';

import { PackingItem } from '@/types';
import { Package, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface Props {
  items: PackingItem[];
  onToggle: (itemId: string) => Promise<void>;
  weatherSummary?: string;
}

const categoryColors: Record<string, string> = {
  Documents:  'text-blue-400 bg-blue-500/10',
  Clothing:   'text-pink-400 bg-pink-500/10',
  Gear:       'text-orange-400 bg-orange-500/10',
  Toiletries: 'text-green-400 bg-green-500/10',
  Other:      'text-slate-400 bg-slate-500/10',
};

const categoryOrder = ['Documents', 'Clothing', 'Gear', 'Toiletries', 'Other'];

export default function PackingList({ items, onToggle, weatherSummary }: Props) {
  const grouped = categoryOrder.reduce<Record<string, PackingItem[]>>((acc, cat) => {
    acc[cat] = items.filter((i) => i.category === cat);
    return acc;
  }, {});

  const packedCount = items.filter((i) => i.isPacked).length;
  const progress = items.length > 0 ? Math.round((packedCount / items.length) * 100) : 0;

  return (
    <div className="card space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Package className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">AI Packing Assistant</h3>
        </div>
        <p className="text-slate-400 text-sm">Smart checklist generated for your trip</p>
      </div>

      {/* Weather Summary */}
      {weatherSummary && (
        <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl px-4 py-3 flex gap-3">
          <AlertCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <p className="text-sky-300 text-sm">{weatherSummary}</p>
        </div>
      )}

      {/* Progress */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">Packing progress</span>
          <span className="text-white font-semibold">{packedCount}/{items.length} items</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Items by Category */}
      {categoryOrder.map((category) => {
        const catItems = grouped[category];
        if (!catItems || catItems.length === 0) return null;
        return (
          <div key={category}>
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold mb-3 ${categoryColors[category] || categoryColors.Other}`}>
              {category}
            </div>
            <div className="space-y-2">
              {catItems.map((item) => (
                <button
                  key={item._id}
                  onClick={() => item._id && onToggle(item._id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 transition-all text-left group"
                >
                  {item.isPacked ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500 group-hover:text-slate-400 shrink-0 transition-colors" />
                  )}
                  <span className={`text-sm flex-1 ${item.isPacked ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {item.item}
                  </span>
                  {item.essential && !item.isPacked && (
                    <span className="text-xs text-amber-400 font-medium">Essential</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {items.length === 0 && (
        <p className="text-slate-500 text-sm text-center py-4">Packing list will appear after generating your trip.</p>
      )}
    </div>
  );
}
