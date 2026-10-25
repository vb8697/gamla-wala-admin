export interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_paise: number;
  created_at: string;
  shipping_address: any;
  user_id: string | null;
  profile: { full_name?: string; email?: string; phone?: string } | null;
  order_items: { id: string; product_name: string; variant_name: string; quantity: number; unit_price_paise: number }[];
}

const DAY = 86400000;
export const counted = (o: OrderRow) => o.status !== 'cancelled' && o.status !== 'refunded';

/** Revenue per day for `days` days ending `offsetDays` ago. */
export function dailyRevenue(orders: OrderRow[], days: number, offsetDays = 0): number[] {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const endMs = end.getTime() - offsetDays * DAY;
  const out = new Array(days).fill(0);
  orders.filter(counted).forEach((o) => {
    const idx = days - 1 - Math.floor((endMs - new Date(o.created_at).getTime()) / DAY);
    if (idx >= 0 && idx < days) out[idx] += o.total_paise / 100;
  });
  return out;
}

export function dayLabels(days: number): string[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - 1 - i) * DAY);
    return `${d.getDate()}`;
  });
}

export const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
export const pctChange = (cur: number, prev: number) => (prev === 0 ? (cur > 0 ? 100 : 0) : Math.round(((cur - prev) / prev) * 100));

export function weekdayCounts(orders: OrderRow[]): number[] {
  const out = [0, 0, 0, 0, 0, 0, 0];
  orders.filter(counted).forEach((o) => (out[(new Date(o.created_at).getDay() + 6) % 7] += 1));
  return out;
}

export function addressText(a: any): string {
  if (!a) return '—';
  if (typeof a === 'string') return a;
  const parts = [a.line1 ?? a.address_line1 ?? a.address, a.line2 ?? a.address_line2, a.city, a.state, a.postal_code ?? a.pincode].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
}
export const addressCity = (a: any): string => (a && typeof a === 'object' && a.city) || 'Unknown';
