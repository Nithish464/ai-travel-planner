'use client';

import { EstimatedBudget } from '@/types';
import { Wallet } from 'lucide-react';

interface Props {
  budget: EstimatedBudget;
  destination: string;
  durationDays: number;
}

const budgetItems = [
  { key: 'flights',       label: 'Flights',        emoji: '✈️' },
  { key: 'accommodation', label: 'Accommodation',   emoji: '🏨' },
  { key: 'food',          label: 'Food & Dining',   emoji: '🍜' },
  { key: 'activities',    label: 'Activities',      emoji: '🎯' },
  { key: 'miscellaneous', label: 'Miscellaneous',   emoji: '🛍️' },
];

export default function BudgetCard({ budget, destination, durationDays }: Props) {
  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-2">
        <Wallet className="w-5 h-5 text-sky-400" />
        <h3 className="text-lg font-bold text-white">Estimated Budget</h3>
      </div>

      <div className="space-y-3">
        {budgetItems.map(({ key, label, emoji }) => {
          const amount = budget[key as keyof EstimatedBudget] as number;
          if (!amount) return null;
          const pct = budget.total > 0 ? Math.round((amount / budget.total) * 100) : 0;
          return (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">{emoji} {label}</span>
                <span className="text-white font-medium">${amount.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-slate-700 pt-4 flex justify-between items-center">
        <span className="text-slate-300 font-semibold">Total Estimate</span>
        <span className="text-2xl font-extrabold text-white">${budget.total?.toLocaleString()}</span>
      </div>

      <p className="text-xs text-slate-500">
        Estimates for {durationDays} days in {destination}. Prices may vary by season and availability.
      </p>
    </div>
  );
}
