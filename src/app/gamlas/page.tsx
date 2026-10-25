'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Container, Layers, PackageX, Pencil, Plus, Search, Trash2, Droplet } from 'lucide-react';
import { formatPaise } from '@/types/database';
import { GAMLA_MATERIALS, GamlaPotProduct, computeStockStatus } from '@/lib/productsStorage';
import { deleteProducts, fetchGamlas } from '@/lib/catalog';
import { errorMessage, useAsync } from '@/lib/useAsync';
import { LoadState } from '@/components/ui/LoadState';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Badge, stockTone } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';

const FALLBACK = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=300&q=80';
const pageSize = 9;

export default function GamlasPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(fetchGamlas);
  const pots: GamlaPotProduct[] = data ?? [];
  const [q, setQ] = useState('');
  const [material, setMaterial] = useState('ALL');
  const [state, setState] = useState<'ALL' | 'active' | 'draft'>('ALL');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<GamlaPotProduct | null>(null);

  useEffect(() => setPage(1), [q, material, state]);

  const filtered = useMemo(
    () =>
      pots.filter((p) => {
        const t = q.toLowerCase();
        return (
          (!t || p.name.toLowerCase().includes(t) || p.sku.toLowerCase().includes(t) || p.color.toLowerCase().includes(t)) &&
          (material === 'ALL' || p.material === material) &&
          (state === 'ALL' || p.status === state)
        );
      }),
    [pots, q, material, state]
  );
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <PageHeader
        title="Gamlas & Pots"
        subtitle="Planters, gamlas and pots to pair with your plants."
        actions={<Link href="/gamlas/new" className="btn btn-primary"><Plus className="h-4 w-4" />Add gamla</Link>}
      />

      <LoadState loading={loading} error={error}>
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total gamlas" value={pots.length} delta={9} icon={<Container className="h-5 w-5" />} tone="gold" spark={[2, 3, 3, 5, 6, 6, 8]} />
        <StatCard label="Active" value={pots.filter((p) => p.status === 'active').length} icon={<Layers className="h-5 w-5" />} spark={[2, 3, 4, 4, 5, 6, 7]} />
        <StatCard label="Low stock" value={pots.filter((p) => computeStockStatus(p.stock) === 'Low Stock').length} icon={<AlertTriangle className="h-5 w-5" />} tone="amber" spark={[3, 2, 3, 2, 2, 1, 2]} />
        <StatCard label="Out of stock" value={pots.filter((p) => p.stock === 0).length} icon={<PackageX className="h-5 w-5" />} tone="red" spark={[0, 1, 0, 1, 1, 0, 0]} />
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1 lg:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input className="input pl-10" placeholder="Search by name, SKU or colour…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2.5 lg:ml-auto">
            <select className="input !w-auto" value={material} onChange={(e) => setMaterial(e.target.value)}>
              <option value="ALL">All materials</option>
              {GAMLA_MATERIALS.map((m) => <option key={m}>{m}</option>)}
            </select>
            <select className="input !w-auto" value={state} onChange={(e) => setState(e.target.value as typeof state)}>
              <option value="ALL">All status</option><option value="active">Active</option><option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<Container className="h-6 w-6" />} title="No gamlas found" text="Add your first gamla or adjust the filters." action={<Link href="/gamlas/new" className="btn btn-primary"><Plus className="h-4 w-4" />Add gamla</Link>} />
        ) : (
          <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((p) => {
              const st = p.status === 'draft' ? 'Draft' : computeStockStatus(p.stock);
              return (
                <div key={p.id} className="group overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-lift">
                  <Link href={`/gamlas/${p.id}/edit`} className="relative block aspect-[4/3] overflow-hidden bg-gold-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => ((e.target as HTMLImageElement).src = FALLBACK)} />
                    <span className="absolute left-3 top-3"><Badge tone={stockTone(st)}>{st}</Badge></span>
                    {p.drainageHole && <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-sky-600 shadow" title="Drainage hole"><Droplet className="h-3.5 w-3.5" /></span>}
                  </Link>
                  <div className="p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gold-600">{p.material}</p>
                    <h3 className="mt-1 truncate font-heading text-[15px] font-semibold">{p.name}</h3>
                    <p className="mt-0.5 text-xs text-ink-500">{p.diameter} · {p.color}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span><b>{formatPaise(p.pricePaise)}</b>{p.comparePricePaise > p.pricePaise && <span className="ml-1.5 text-xs text-ink-400 line-through">{formatPaise(p.comparePricePaise)}</span>}</span>
                      <span className="text-xs text-ink-500">{p.stock} in stock</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Link href={`/gamlas/${p.id}/edit`} className="btn btn-secondary btn-sm flex-1"><Pencil className="h-3.5 w-3.5" />Edit</Link>
                      <button className="btn btn-secondary btn-sm hover:!border-rose-200 hover:!text-rose-600" onClick={() => setToDelete(p)} aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <Pagination page={page} pageSize={pageSize} total={filtered.length} noun="gamlas" onChange={setPage} />
      </div>

      </LoadState>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this gamla?"
        message={toDelete && <>“<b>{toDelete.name}</b>” will be removed from your store listings.</>}
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await deleteProducts([toDelete.id]);
            toast(`Removed “${toDelete.name}”`, 'info');
            await reload();
          } catch (e) {
            toast(errorMessage(e), 'error');
          }
          setToDelete(null);
        }}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
