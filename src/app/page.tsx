'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, IndianRupee, Plus, ShoppingBag, Sprout, Users } from 'lucide-react';
import { formatPaise } from '@/types/database';
import { fetchCustomers, fetchGamlas, fetchOrders, fetchPlants } from '@/lib/catalog';
import { OrderRow, counted, dailyRevenue, dayLabels, pctChange, sum, weekdayCounts } from '@/lib/stats';
import { useAsync } from '@/lib/useAsync';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Field';
import { AreaChart, BarChart, Donut } from '@/components/ui/Charts';
import { Badge, orderTone } from '@/components/ui/Badge';
import { LoadState } from '@/components/ui/LoadState';
import { EmptyState } from '@/components/ui/EmptyState';

const palette = ['#1e7b54', '#d3a843', '#3b7ea1', '#e4849a', '#7c5cbf', '#b5532f', '#8fb39b'];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function DashboardPage() {
  const { data, loading, error } = useAsync(async () => {
    const [plants, pots, orders, customers] = await Promise.all([fetchPlants(), fetchGamlas(), fetchOrders(), fetchCustomers()]);
    return { plants, pots, orders: orders as OrderRow[], customers };
  });

  const v = useMemo(() => {
    if (!data) return null;
    const { plants, orders } = data;
    const cur = dailyRevenue(orders, 14);
    const prev = dailyRevenue(orders, 14, 14);
    const month = dailyRevenue(orders, 30);
    const monthPrev = dailyRevenue(orders, 30, 30);
    const live = orders.filter(counted);
    const since = Date.now() - 30 * 86400000;
    const ord30 = live.filter((o) => new Date(o.created_at).getTime() >= since).length;
    const ordPrev = live.filter((o) => { const t = new Date(o.created_at).getTime(); return t < since && t >= since - 30 * 86400000; }).length;
    const byCat: Record<string, number> = {};
    plants.forEach((p) => (byCat[p.category] = (byCat[p.category] || 0) + 1));
    return {
      cur, prev, revenue: sum(month), revDelta: pctChange(sum(month), sum(monthPrev)),
      ord30, ordDelta: pctChange(ord30, ordPrev),
      aov: live.length ? Math.round(sum(live.map((o) => o.total_paise)) / live.length) : 0,
      pending: orders.filter((o) => o.status === 'pending').length,
      lowStock: [...plants, ...data.pots].filter((p) => p.stock <= 10).sort((a, b) => a.stock - b.stock).slice(0, 5),
      byCat: Object.entries(byCat).sort((a, b) => b[1] - a[1]),
      week: weekdayCounts(orders),
    };
  }, [data]);

  const money = (n: number) => (n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`);

  return (
    <>
      <section className="bg-hero relative mb-8 overflow-hidden rounded-3xl p-7 text-white shadow-lift sm:p-9">
        <div className="bg-dots pointer-events-none absolute inset-0" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-300">Har Ghar Hariyali</p>
            <h1 className="mt-2 text-[32px] font-semibold leading-tight sm:text-4xl">Good day! Your nursery is thriving 🌿</h1>
            <p className="mt-2 text-[14px] text-brand-100/80">
              {v ? <>You have <b className="text-white">{v.pending} pending orders</b> and <b className="text-white">{v.lowStock.length} products</b> running low on stock.</> : 'Loading your store…'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/products/new" className="btn btn-gold !h-11"><Plus className="h-4 w-4" />Add plant</Link>
            <Link href="/gamlas/new" className="btn !h-11 bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20"><Plus className="h-4 w-4" />Add gamla</Link>
          </div>
        </div>
      </section>

      <LoadState loading={loading} error={error}>
        {data && v && (
          <>
            <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Revenue (30 days)" value={money(v.revenue)} delta={v.revDelta} icon={<IndianRupee className="h-5 w-5" />} spark={v.cur} />
              <StatCard label="Orders (30 days)" value={v.ord30} delta={v.ordDelta} icon={<ShoppingBag className="h-5 w-5" />} tone="blue" spark={v.week} />
              <StatCard label="Customers" value={data.customers.length} icon={<Users className="h-5 w-5" />} tone="gold" />
              <StatCard label="Avg. order value" value={formatPaise(v.aov)} icon={<Sprout className="h-5 w-5" />} tone="amber" />
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
              <Card className="xl:col-span-2" title="Revenue overview" subtitle="Last 14 days vs previous 14" action={
                <div className="flex items-center gap-4 text-xs text-ink-500">
                  <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-brand-600" />This period</span>
                  <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-gold-400" />Previous</span>
                </div>
              }>
                <AreaChart data={v.cur} secondary={v.prev} labels={dayLabels(14)} format={(n) => (n >= 1000 ? `${Math.round(n / 1000)}k` : String(n))} />
              </Card>

              <Card title="Catalogue mix" subtitle="Plants by category">
                <div className="flex flex-col items-center gap-5">
                  <Donut size={168} segments={v.byCat.map(([label, value], i) => ({ label, value, color: palette[i % palette.length] }))} center={<><span className="font-heading text-3xl font-semibold">{data.plants.length}</span><span className="text-[11px] text-ink-500">plants</span></>} />
                  <ul className="w-full space-y-2 text-[13px]">
                    {v.byCat.slice(0, 5).map(([c, n], i) => (
                      <li key={c} className="flex items-center justify-between"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full" style={{ background: palette[i % palette.length] }} />{c}</span><b>{n}</b></li>
                    ))}
                  </ul>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <Card className="xl:col-span-2" pad={false} title="Recent orders" action={<Link href="/orders" className="flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline">View all <ArrowRight className="h-3.5 w-3.5" /></Link>}>
                {data.orders.length === 0 ? (
                  <EmptyState icon={<ShoppingBag className="h-6 w-6" />} title="No orders yet" text="New orders from your storefront will appear here." />
                ) : (
                  <div className="table-wrap mt-4">
                    <table className="tbl">
                      <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
                      <tbody>
                        {data.orders.slice(0, 5).map((o) => (
                          <tr key={o.id}>
                            <td><span className="font-mono text-xs font-semibold">{o.order_number}</span><span className="block text-[11px] text-ink-400">{new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></td>
                            <td>{o.profile?.full_name ?? 'Guest'}</td>
                            <td className="font-semibold">{formatPaise(o.total_paise)}</td>
                            <td><Badge tone={orderTone(o.status)}>{cap(o.status)}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              <div className="space-y-6">
                <Card title="Needs restocking" action={<AlertTriangle className="h-4 w-4 text-amber-500" />}>
                  {v.lowStock.length === 0 ? (
                    <p className="text-[13px] text-ink-500">All products are well stocked.</p>
                  ) : (
                    <ul className="space-y-3">
                      {v.lowStock.map((p) => (
                        <li key={p.id} className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {p.image ? <img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <span className="h-10 w-10 rounded-lg bg-canvas" />}
                          <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-semibold">{p.name}</p><p className="text-[11px] text-ink-400">{p.sku}</p></div>
                          <Badge tone={p.stock === 0 ? 'red' : 'amber'}>{p.stock === 0 ? 'Out' : `${p.stock} left`}</Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
                <Card title="Orders by weekday"><BarChart data={v.week} labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']} height={150} /></Card>
              </div>
            </div>
          </>
        )}
      </LoadState>
    </>
  );
}
