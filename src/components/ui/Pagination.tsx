import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({
  page,
  pageSize,
  total,
  noun = 'items',
  onChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  noun?: string;
  onChange: (p: number) => void;
}) {
  const pages = Math.max(Math.ceil(total / pageSize), 1);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-5 py-3.5 text-xs text-ink-500 sm:flex-row">
      <span>
        Showing <b className="text-ink-800">{from}–{to}</b> of <b className="text-ink-800">{total}</b> {noun}
      </span>
      <div className="flex items-center gap-1">
        <button className="icon-btn !h-8 !w-8 border border-line disabled:opacity-40" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: pages }).map((_, i) => (
          <button
            key={i}
            onClick={() => onChange(i + 1)}
            className={`h-8 w-8 rounded-lg text-xs font-semibold ${
              page === i + 1 ? 'bg-brand-800 text-white' : 'text-ink-600 hover:bg-black/5'
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button className="icon-btn !h-8 !w-8 border border-line disabled:opacity-40" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
