import React from 'react';

export type Tone = 'green' | 'amber' | 'red' | 'blue' | 'gray' | 'gold' | 'violet';

const tones: Record<Tone, { chip: string; dot: string }> = {
  green: { chip: 'bg-brand-50 text-brand-700 border-brand-200/70', dot: 'bg-brand-500' },
  amber: { chip: 'bg-amber-50 text-amber-700 border-amber-200/70', dot: 'bg-amber-500' },
  red: { chip: 'bg-rose-50 text-rose-700 border-rose-200/70', dot: 'bg-rose-500' },
  blue: { chip: 'bg-sky-50 text-sky-700 border-sky-200/70', dot: 'bg-sky-500' },
  violet: { chip: 'bg-violet-50 text-violet-700 border-violet-200/70', dot: 'bg-violet-500' },
  gold: { chip: 'bg-gold-50 text-gold-600 border-gold-200', dot: 'bg-gold-400' },
  gray: { chip: 'bg-ink-300/20 text-ink-600 border-ink-300/40', dot: 'bg-ink-400' },
};

export function Badge({
  tone = 'gray',
  dot = true,
  children,
}: {
  tone?: Tone;
  dot?: boolean;
  children: React.ReactNode;
}) {
  const t = tones[tone];
  return (
    <span className={`chip ${t.chip}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />}
      {children}
    </span>
  );
}

export function stockTone(status: string): Tone {
  if (status === 'In Stock' || status === 'active') return 'green';
  if (status === 'Low Stock') return 'amber';
  if (status === 'Out of Stock') return 'red';
  return 'gray';
}

export function orderTone(status: string): Tone {
  const s = status.toLowerCase();
  return ({ pending: 'amber', confirmed: 'blue', processing: 'blue', packed: 'blue', shipped: 'violet', delivered: 'green', cancelled: 'red', refunded: 'gray' } as Record<string, Tone>)[s] ?? 'gray';
}
