'use client';

import React, { useMemo, useState } from 'react';
import { IndianRupee, Repeat, ShoppingBag, Users } from 'lucide-react';
import { formatPaise } from '@/types/database';
import { fetchCustomers, fetchOrders } from '@/lib/catalog';
import { OrderRow, addressCity, counted, dailyRevenue, dayLabels, pctChange, sum, weekdayCounts } from '@/lib/stats';
import { useAsync } from '@/lib/useAsync';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Field';
import { AreaChart, BarChart, Donut } from '@/components/ui/Charts';
import { LoadState } from '@/components/ui/LoadState';

const RANGES: Record<string, number> = { '7D': 7, '14D': 14, '30D': 30 };
const colors = ['#1e7b54', '#d3a843', '#3b7ea1', '#e4849a', '#b6c0b9'];

export default function AnalyticsPage() {
  const [range, setRange] = useState('14D');
  const { data, loading, error } = useAsync(async () => ({ orders: (await fetchOrders()) as OrderRow[], customers: await fetchCustomers() }));
  const days = RANGES[range];

  const v = useMemo(() => {
    if (!data) return null;
    const live = data.orders.filter(counted);
    const cur = dailyRevenue(data.orders, days);
    const prev = dailyRevenue(data.orders, days, days);
    const since = Date.now() - days * 86400000;
    const inRange = live.filter((o) => new Date(o.created_at).getTime() >= since);
    const prods: Record<string, number> = {};
    inRange.forEach((o) => o.order_items.forEach((i) => (prods[i.product_name] = (prods[i.product_name] || 0) + i.quantity)));
    const top = Object.entries(prods).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const cities: Record<string, number> = {};
    inRange.forEach((o) => { const c = addressCity(o.shipping_address); cities[c] = (cities[c] || 0) + 1; });
    const cityList = Object.entries(cities).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const buyers = new Set(live.map((o) => o.user_id)).size;
    const repeat = data.customers.filter((c) => c.orders > 1).length;
    return { cur, prev, revenue: sum(cur), delta: pctChange(sum(cur), sum(prev)), orders: inRange.length, top, cityList, week: weekdayCounts(inRange), buyers, repeat };
  }, [data, days]);

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Understand what is growing your nursery."
        actions={<div className="flex rounded-xl bg-white p-1 shadow-card">{Object.keys(RANGES).map((r) => <button key={r} className={`tab !h-8 ${range === r ? '!bg-brand-800 !text-white' : ''}`} onClick={() => setRange(r)}>{r}</button>)}</div>}
      />
      <LoadState loading={loading} error={error}>
        {data && v && (
          <>
            <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
              <StatCard label="Revenue" value={formatPaise(Math.round(v.revenue * 100))} delta={v.delta} icon={<IndianRupee className="h-5 w-5" />} spark={v.cur} />
              <StatCard label="Orders" value={v.orders} icon={<ShoppingBag className="h-5 w-5" />} tone="blue" spark={v.week} />
              <StatCard label="Buyers" value={v.buyers} icon={<Users className="h-5 w-5" />} tone="gold" />
              <StatCard label="Repeat customers" value={v.repeat} icon={<Repeat className="h-5 w-5" />} tone="amber" />
            </div>
            <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
              <Card className="xl:col-span-2" title="Revenue trend" subtitle={`Last ${days} days vs previous ${days}`}><AreaChart data={v.cur} secondary={v.prev} labels={dayLabels(days)} format={(n) => (n >= 1000 ? `${Math.round(n / 1000)}k` : String(n))} /></Card>
              <Card title="Orders by city">
                {v.cityList.length === 0 ? <p className="py-10 text-center text-[13px] text-ink-500">No orders in this period.</p> : (
                  <div className="flex flex-col items-center gap-5">
                    <Donut segments={v.cityList.map(([label, value], i) => ({ label, value, color: colors[i] }))} center={<><span className="font-heading text-2xl font-semibold">{v.orders}</span><span className="text-[11px] text-ink-500">orders</span></>} />
                    <ul className="w-full space-y-2 text-[13px]">{v.cityList.map(([c, n], i) => <li key={c} className="flex justify-between"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full" style={{ background: colors[i] }} />{c}</span><b>{n}</b></li>)}</ul>
                  </div>
                )}
              </Card>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card title="Top selling products">
                {v.top.length === 0 ? <p className="py-10 text-center text-[13px] text-ink-500">No sales in this period.</p> : (
                  <ul className="space-y-4">{v.top.map(([name, sold]) => (
                    <li key={name}><div className="mb-1.5 flex justify-between text-[13px]"><b>{name}</b><span className="text-ink-500">{sold} sold</span></div><div className="h-2 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400" style={{ width: `${(sold / v.top[0][1]) * 100}%` }} /></div></li>
                  ))}</ul>
                )}
              </Card>
              <Card title="Orders by weekday"><BarChart data={v.week} labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']} height={220} /></Card>
            </div>
          </>
        )}
      </LoadState>
    </>
  );
}
