'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Boxes, Minus, Plus, Search, TriangleAlert } from 'lucide-react';
import { formatPaise } from '@/types/database';
import { computeStockStatus } from '@/lib/productsStorage';
import { InventoryRow, adjustInventory, fetchInventory, fetchStores } from '@/lib/catalog';
import { errorMessage, useAsync } from '@/lib/useAsync';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Badge, stockTone } from '@/components/ui/Badge';
import { LoadState } from '@/components/ui/LoadState';
import { useToast } from '@/components/ui/Toast';

export default function InventoryPage() {
  const toast = useToast();
  const stores = useAsync(fetchStores);
  const [storeId, setStoreId] = useState('');
  useEffect(() => { if (!storeId && stores.data?.[0]) setStoreId(stores.data[0].id); }, [stores.data, storeId]);

  const inv = useAsync(() => (storeId ? fetchInventory(storeId) : Promise.resolve([] as InventoryRow[])), [storeId]);
  const all = inv.data ?? [];
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<'All' | 'Plant' | 'Gamla'>('All');
  const [view, setView] = useState<'all' | 'low'>('all');
  const [busy, setBusy] = useState<string | null>(null);

  const rows = useMemo(
    () => all.filter((r) => (kind === 'All' || r.kind === kind) && (view === 'all' || r.quantity <= 10) && (!q || (r.name + r.sku).toLowerCase().includes(q.toLowerCase()))),
    [all, kind, view, q]
  );

  const adjust = async (r: InventoryRow, delta: number) => {
    const next = Math.max(0, r.quantity + delta);
    setBusy(r.variantId);
    try {
      await adjustInventory(r.variantId, storeId, next);
      inv.setData(all.map((x) => (x.variantId === r.variantId ? { ...x, quantity: next } : x)));
    } catch (e) {
      toast(errorMessage(e), 'error');
    }
    setBusy(null);
  };

  const units = all.reduce((a, r) => a + r.quantity, 0);
  const value = all.reduce((a, r) => a + r.quantity * r.pricePaise, 0);
  const low = all.filter((r) => r.quantity > 0 && r.quantity <= 10).length;
  const out = all.filter((r) => r.quantity === 0).length;

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle="Adjust stock per store for plants and gamlas."
        actions={
          <select className="input !w-auto min-w-[240px]" value={storeId} onChange={(e) => setStoreId(e.target.value)}>
            {(stores.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        }
      />
      <LoadState loading={stores.loading || inv.loading} error={stores.error || inv.error}>
        <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard label="Total units" value={units.toLocaleString('en-IN')} icon={<Boxes className="h-5 w-5" />} />
          <StatCard label="Stock value" value={formatPaise(value)} icon={<Boxes className="h-5 w-5" />} tone="gold" />
          <StatCard label="Low stock" value={low} icon={<TriangleAlert className="h-5 w-5" />} tone="amber" />
          <StatCard label="Out of stock" value={out} icon={<TriangleAlert className="h-5 w-5" />} tone="red" />
        </div>

        <div className="card overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center">
            <div className="relative flex-1 lg:max-w-sm">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input className="input pl-10" placeholder="Search name or SKU…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2.5 lg:ml-auto">
              <div className="flex rounded-xl bg-canvas p-1">
                {(['All', 'Plant', 'Gamla'] as const).map((k) => <button key={k} className={`tab !h-8 ${kind === k ? 'tab-active' : ''}`} onClick={() => setKind(k)}>{k === 'All' ? 'All' : k + 's'}</button>)}
              </div>
              <div className="flex rounded-xl bg-canvas p-1">
                <button className={`tab !h-8 ${view === 'all' ? 'tab-active' : ''}`} onClick={() => setView('all')}>All items</button>
                <button className={`tab !h-8 ${view === 'low' ? 'tab-active' : ''}`} onClick={() => setView('low')}>Needs attention</button>
              </div>
            </div>
          </div>
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Item</th><th>Type</th><th>Value</th><th>Status</th><th className="text-center">Adjust stock</th></tr></thead>
              <tbody>
                {rows.map((r) => {
                  const st = computeStockStatus(r.quantity);
                  return (
                    <tr key={r.variantId}>
                      <td>
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {r.image ? <img src={r.image} alt="" className="h-11 w-11 rounded-xl border border-line object-cover" /> : <span className="h-11 w-11 rounded-xl bg-canvas" />}
                          <span><b className="block">{r.name}</b><span className="text-[11px] text-ink-400">{r.variantName} · <span className="font-mono">{r.sku}</span></span></span>
                        </div>
                      </td>
                      <td><Badge tone={r.kind === 'Plant' ? 'green' : 'gold'} dot={false}>{r.kind}</Badge></td>
                      <td className="font-semibold">{formatPaise(r.quantity * r.pricePaise)}</td>
                      <td><Badge tone={stockTone(st)}>{st}</Badge></td>
                      <td>
                        <div className="mx-auto flex w-fit items-center rounded-xl border border-line">
                          <button disabled={busy === r.variantId} className="icon-btn !h-9 !w-9" onClick={() => adjust(r, -1)} aria-label="Decrease"><Minus className="h-3.5 w-3.5" /></button>
                          <span className="w-12 text-center text-[13px] font-bold">{r.quantity}</span>
                          <button disabled={busy === r.variantId} className="icon-btn !h-9 !w-9" onClick={() => adjust(r, 1)} aria-label="Increase"><Plus className="h-3.5 w-3.5" /></button>
                          <button disabled={busy === r.variantId} className="h-9 border-l border-line px-3 text-xs font-bold text-brand-700 hover:bg-brand-50" onClick={() => adjust(r, 10)}>+10</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </LoadState>
    </>
  );
}
