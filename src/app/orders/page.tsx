'use client';

import React, { useMemo, useState } from 'react';
import { CheckCircle2, MapPin, PackageCheck, Phone, Search, ShoppingBag, Truck } from 'lucide-react';
import { formatPaise } from '@/types/database';
import { fetchOrders, setOrderStatus } from '@/lib/catalog';
import { OrderRow, addressText } from '@/lib/stats';
import { errorMessage, useAsync } from '@/lib/useAsync';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge, orderTone } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadState } from '@/components/ui/LoadState';
import { useToast } from '@/components/ui/Toast';

const TABS = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
const FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const pageSize = 8;

export default function OrdersPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(fetchOrders);
  const orders: OrderRow[] = (data as OrderRow[] | undefined) ?? [];
  const [tab, setTab] = useState<(typeof TABS)[number]>('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = orders.find((o) => o.id === openId) ?? null;

  const filtered = useMemo(
    () => orders.filter((o) => (tab === 'all' || o.status === tab) && (!q || (o.order_number + (o.profile?.full_name ?? '') + addressText(o.shipping_address)).toLowerCase().includes(q.toLowerCase()))),
    [orders, tab, q]
  );
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const count = (t: string) => (t === 'all' ? orders.length : orders.filter((o) => o.status === t).length);

  const update = async (o: OrderRow, status: string) => {
    try {
      await setOrderStatus(o.id, status);
      toast(`Order ${o.order_number} marked as ${status}`);
      await reload();
    } catch (e) {
      toast(errorMessage(e), 'error');
    }
  };
  const nextOf = (o: OrderRow) => FLOW[FLOW.indexOf(o.status) + 1];
  const when = (d: string) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

  return (
    <>
      <PageHeader title="Orders" subtitle="Track, pack and ship customer orders." />
      <LoadState loading={loading} error={error}>
        <div className="card overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-xl bg-canvas p-1">
              {TABS.map((t) => (
                <button key={t} onClick={() => { setTab(t); setPage(1); }} className={`tab ${tab === t ? 'tab-active' : ''}`}>
                  {cap(t)}<span className={`rounded-full px-1.5 text-[11px] ${tab === t ? 'bg-brand-50 text-brand-700' : 'bg-black/5'}`}>{count(t)}</span>
                </button>
              ))}
            </div>
            <div className="relative lg:w-72">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input className="input pl-10" placeholder="Search order, customer, city…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={<ShoppingBag className="h-6 w-6" />} title="No orders yet" text="Orders placed on your storefront will appear here in real time." />
          ) : (
            <div className="table-wrap">
              <table className="tbl">
                <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {rows.map((o) => (
                    <tr key={o.id} className="cursor-pointer" onClick={() => setOpenId(o.id)}>
                      <td><span className="font-mono text-xs font-bold">{o.order_number}</span><span className="block text-[11px] text-ink-400">{when(o.created_at)}</span></td>
                      <td><span className="font-semibold">{o.profile?.full_name ?? 'Guest'}</span><span className="block text-[11px] text-ink-400">{addressText(o.shipping_address)}</span></td>
                      <td className="max-w-[220px] truncate text-ink-600">{o.order_items.map((i) => `${i.product_name} ×${i.quantity}`).join(', ')}</td>
                      <td className="font-semibold">{formatPaise(o.total_paise)}</td>
                      <td><Badge tone={o.payment_status === 'paid' ? 'green' : o.payment_status === 'failed' ? 'red' : 'amber'}>{cap(o.payment_status)}</Badge></td>
                      <td><Badge tone={orderTone(o.status)}>{cap(o.status)}</Badge></td>
                      <td className="text-right"><span className="text-xs font-semibold text-brand-700">View</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={page} pageSize={pageSize} total={filtered.length} noun="orders" onChange={setPage} />
        </div>
      </LoadState>

      <Drawer
        open={!!open}
        onClose={() => setOpenId(null)}
        title={open ? `Order ${open.order_number}` : ''}
        footer={open && nextOf(open) && (
          <div className="flex gap-2.5">
            <button className="btn btn-secondary" onClick={() => update(open, 'cancelled')}>Cancel order</button>
            <button className="btn btn-primary flex-1" onClick={() => update(open, nextOf(open)!)}>Mark as {nextOf(open)}</button>
          </div>
        )}
      >
        {open && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Badge tone={orderTone(open.status)}>{cap(open.status)}</Badge>
              <span className="text-xs text-ink-500">{when(open.created_at)}</span>
            </div>

            {FLOW.includes(open.status) && (
              <ol className="flex items-center">
                {FLOW.map((s, i) => {
                  const done = FLOW.indexOf(open.status) >= i;
                  const Icon = [ShoppingBag, CheckCircle2, PackageCheck, Truck, CheckCircle2][i];
                  return (
                    <li key={s} className="flex flex-1 items-center last:flex-none">
                      <span className="flex flex-col items-center gap-1.5">
                        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${done ? 'bg-brand-700 text-white' : 'bg-canvas text-ink-400'}`}><Icon className="h-4 w-4" /></span>
                        <span className={`text-[10.5px] font-semibold ${done ? 'text-ink-800' : 'text-ink-400'}`}>{cap(s)}</span>
                      </span>
                      {i < FLOW.length - 1 && <span className={`mx-1 mb-5 h-0.5 flex-1 rounded ${FLOW.indexOf(open.status) > i ? 'bg-brand-600' : 'bg-line'}`} />}
                    </li>
                  );
                })}
              </ol>
            )}

            <div className="rounded-2xl border border-line p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-400">Customer</p>
              <p className="mt-2 font-semibold">{open.profile?.full_name ?? 'Guest'}</p>
              {open.profile?.phone && <p className="mt-1 flex items-center gap-2 text-[13px] text-ink-600"><Phone className="h-3.5 w-3.5" />{open.profile.phone}</p>}
              <p className="mt-1 flex items-start gap-2 text-[13px] text-ink-600"><MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />{addressText(open.shipping_address)}</p>
            </div>

            <div className="rounded-2xl border border-line">
              <p className="px-4 pt-4 text-xs font-bold uppercase tracking-wider text-ink-400">Items</p>
              <ul className="divide-y divide-line">
                {open.order_items.map((i) => (
                  <li key={i.id} className="flex items-center justify-between px-4 py-3 text-[13px]">
                    <span><b>{i.product_name}</b><span className="block text-xs text-ink-400">{i.variant_name} × {i.quantity}</span></span>
                    <span className="font-semibold">{formatPaise(i.unit_price_paise * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between rounded-b-2xl bg-canvas px-4 py-3.5">
                <span className="text-[13px] font-semibold">Total · {cap(open.payment_status)}</span>
                <span className="font-heading text-lg font-semibold">{formatPaise(open.total_paise)}</span>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
