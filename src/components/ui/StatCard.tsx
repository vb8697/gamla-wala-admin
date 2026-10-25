import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Sparkline } from './Charts';

export function StatCard({
  label,
  value,
  delta,
  deltaLabel = 'vs last month',
  icon,
  tone = 'green',
  spark,
}: {
  label: string;
  value: React.ReactNode;
  delta?: number;
  deltaLabel?: string;
  icon: React.ReactNode;
  tone?: 'green' | 'amber' | 'red' | 'blue' | 'gold';
  spark?: number[];
}) {
  const iconTone = {
    green: 'bg-brand-50 text-brand-700',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-rose-50 text-rose-600',
    blue: 'bg-sky-50 text-sky-600',
    gold: 'bg-gold-50 text-gold-600',
  }[tone];
  const sparkColor = { green: '#2c9a69', amber: '#d97706', red: '#e11d48', blue: '#0284c7', gold: '#bf8c2e' }[tone];
  const up = (delta ?? 0) >= 0;

  return (
    <div className="card card-pad relative overflow-hidden transition-shadow hover:shadow-lift">
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconTone}`}>{icon}</div>
        {delta !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11.5px] font-bold ${
              up ? 'bg-brand-50 text-brand-700' : 'bg-rose-50 text-rose-600'
            }`}
          >
            {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-ink-500">{label}</p>
          <p className="mt-1 font-heading text-[28px] font-semibold leading-none text-ink-900">{value}</p>
          {delta !== undefined && <p className="mt-2 text-[11.5px] text-ink-400">{deltaLabel}</p>}
        </div>
        {spark && <Sparkline data={spark} color={sparkColor} className="h-10 w-24" />}
      </div>
    </div>
  );
}
