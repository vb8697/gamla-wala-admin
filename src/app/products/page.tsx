'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Box, Download, LayoutGrid, List, Pencil, Plus, Search, Sprout, Trash2, PackageX } from 'lucide-react';
import { formatPaise } from '@/types/database';
import { AdminProduct, PlantStockStatus, computeStockStatus } from '@/lib/productsStorage';
import { deleteProducts, fetchCategories, fetchPlants } from '@/lib/catalog';
import { errorMessage, useAsync } from '@/lib/useAsync';
import { LoadState } from '@/components/ui/LoadState';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Badge, stockTone } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';

const FALLBACK = 'https://images.unsplash.com/photo-1596724803273-04ef9647e307?auto=format&fit=crop&w=300&q=80';
const statusOf = (p: AdminProduct): PlantStockStatus => (p.stockStatus === 'Draft' ? 'Draft' : computeStockStatus(p.stock));

export default function PlantsPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(async () => ({ products: await fetchPlants(), categories: await fetchCategories() }));
  const products: AdminProduct[] = data?.products ?? [];
  const categoryNames = (data?.categories ?? []).filter((c) => c.slug !== 'pots-planters').map((c) => c.name);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<AdminProduct[] | null>(null);
  const pageSize = view === 'grid' ? 12 : 8;

  useEffect(() => setPage(1), [q, cat, status, view]);

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const t = q.toLowerCase();
        return (
          (!t || p.name.toLowerCase().includes(t) || p.sku.toLowerCase().includes(t) || p.category.toLowerCase().includes(t)) &&
          (cat === 'ALL' || p.category === cat) &&
          (status === 'ALL' || statusOf(p) === status)
        );
      }),
    [products, q, cat, status]
  );
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const counts = {
    total: products.length,
    inStock: products.filter((p) => statusOf(p) === 'In Stock').length,
    low: products.filter((p) => statusOf(p) === 'Low Stock').length,
    out: products.filter((p) => statusOf(p) === 'Out of Stock').length,
  };
  const stockValue = products.reduce((a, p) => a + p.pricePaise * p.stock, 0);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteProducts(toDelete.map((p) => p.id));
      toast(toDelete.length === 1 ? `Removed “${toDelete[0].name}”` : `Removed ${toDelete.length} plants`, 'info');
      setSelected([]);
      await reload();
    } catch (e) {
      toast(errorMessage(e), 'error');
    }
    setToDelete(null);
  };

  const exportCsv = () => {
    const head = 'Name,SKU,Category,Price,Stock,Status';
    const body = filtered.map((p) => [p.name, p.sku, p.category, p.pricePaise / 100, p.stock, statusOf(p)].map((v) => `"${v}"`).join(','));
    const url = URL.createObjectURL(new Blob([[head, ...body].join('\n')], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plants.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const allOnPage = rows.length > 0 && rows.every((r) => selected.includes(r.id));

  return (
    <>
      <PageHeader
        title="Plants"
        subtitle="Manage your plant catalogue, pricing and stock levels."
        actions={
          <>
            <button className="btn btn-secondary" onClick={exportCsv}><Download className="h-4 w-4" />Export</button>
            <Link href="/products/new" className="btn btn-primary"><Plus className="h-4 w-4" />Add plant</Link>
          </>
        }
      />

      <LoadState loading={loading} error={error}>
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total plants" value={counts.total} delta={12} icon={<Sprout className="h-5 w-5" />} spark={[4, 6, 5, 8, 9, 12, 14]} />
        <StatCard label="In stock" value={counts.inStock} delta={8} icon={<Box className="h-5 w-5" />} tone="blue" spark={[3, 4, 6, 5, 8, 9, 10]} />
        <StatCard label="Low stock" value={counts.low} delta={-3} icon={<AlertTriangle className="h-5 w-5" />} tone="amber" spark={[6, 5, 7, 4, 5, 3, 3]} />
        <StatCard label="Out of stock" value={counts.out} delta={0} deltaLabel="no change" icon={<PackageX className="h-5 w-5" />} tone="red" spark={[1, 1, 2, 1, 1, 1, 1]} />
      </div>

      <div className="card overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1 lg:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input className="input pl-10" placeholder="Search by name, SKU or category…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex flex-wrap items-center gap-2.5 lg:ml-auto">
            <select className="input !w-auto" value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="ALL">All categories</option>
              {categoryNames.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="ALL">All status</option>
              <option>In Stock</option><option>Low Stock</option><option>Out of Stock</option><option>Draft</option>
            </select>
            <div className="flex rounded-xl bg-canvas p-1">
              <button className={`tab !h-8 !px-2.5 ${view === 'table' ? 'tab-active' : ''}`} onClick={() => setView('table')} aria-label="Table view"><List className="h-4 w-4" /></button>
              <button className={`tab !h-8 !px-2.5 ${view === 'grid' ? 'tab-active' : ''}`} onClick={() => setView('grid')} aria-label="Grid view"><LayoutGrid className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        {selected.length > 0 && (
          <div className="flex items-center justify-between bg-brand-800 px-5 py-2.5 text-[13px] text-white">
            <span><b>{selected.length}</b> selected</span>
            <div className="flex gap-2">
              <button className="btn btn-sm bg-white/10 text-white hover:bg-white/20" onClick={() => setSelected([])}>Clear</button>
              <button className="btn btn-sm bg-rose-500 text-white hover:bg-rose-600" onClick={() => setToDelete(products.filter((p) => selected.includes(p.id)))}><Trash2 className="h-3.5 w-3.5" />Delete</button>
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState icon={<Sprout className="h-6 w-6" />} title="No plants found" text="Try adjusting your search or filters, or add a new plant to your catalogue." action={<Link href="/products/new" className="btn btn-primary"><Plus className="h-4 w-4" />Add plant</Link>} />
        ) : view === 'table' ? (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th className="w-10"><input type="checkbox" checked={allOnPage} onChange={(e) => setSelected(e.target.checked ? Array.from(new Set([...selected, ...rows.map((r) => r.id)])) : selected.filter((id) => !rows.some((r) => r.id === id)))} aria-label="Select all" /></th>
                  <th>Plant</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td><input type="checkbox" checked={selected.includes(p.id)} onChange={() => setSelected((s) => (s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id]))} aria-label={`Select ${p.name}`} /></td>
                    <td>
                      <Link href={`/products/${p.id}/edit`} className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image} alt="" className="h-12 w-12 rounded-xl border border-line bg-canvas object-cover" onError={(e) => ((e.target as HTMLImageElement).src = FALLBACK)} />
                        <span>
                          <span className="block font-semibold text-ink-900">{p.name}</span>
                          <span className="block font-mono text-[11px] text-ink-400">{p.sku}</span>
                        </span>
                      </Link>
                    </td>
                    <td><span className="text-ink-600">{p.category}</span></td>
                    <td>
                      <span className="font-semibold">{formatPaise(p.pricePaise)}</span>
                      {p.comparePricePaise && p.comparePricePaise > p.pricePaise && <span className="ml-1.5 text-xs text-ink-400 line-through">{formatPaise(p.comparePricePaise)}</span>}
                    </td>
                    <td>
                      <div className="w-24">
                        <span className="text-[13px] font-semibold">{p.stock}</span>
                        <div className="mt-1 h-1 overflow-hidden rounded-full bg-line"><div className={`h-full rounded-full ${p.stock <= 0 ? 'bg-rose-500' : p.stock <= 10 ? 'bg-amber-500' : 'bg-brand-500'}`} style={{ width: `${Math.min(p.stock, 50) * 2}%` }} /></div>
                      </div>
                    </td>
                    <td><Badge tone={stockTone(statusOf(p))}>{statusOf(p)}</Badge></td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <Link href={`/products/${p.id}/edit`} className="icon-btn !h-8 !w-8" title="Edit"><Pencil className="h-4 w-4" /></Link>
                        <button className="icon-btn !h-8 !w-8 hover:!bg-rose-50 hover:!text-rose-600" title="Delete" onClick={() => setToDelete([p])}><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {rows.map((p) => (
              <div key={p.id} className="group overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-lift">
                <Link href={`/products/${p.id}/edit`} className="relative block aspect-[4/3] overflow-hidden bg-brand-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => ((e.target as HTMLImageElement).src = FALLBACK)} />
                  <span className="absolute left-3 top-3"><Badge tone={stockTone(statusOf(p))}>{statusOf(p)}</Badge></span>
                </Link>
                <div className="p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">{p.category}</p>
                  <h3 className="mt-1 truncate font-heading text-[15px] font-semibold">{p.name}</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-bold">{formatPaise(p.pricePaise)}</span>
                    <span className="text-xs text-ink-500">{p.stock} in stock</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Link href={`/products/${p.id}/edit`} className="btn btn-secondary btn-sm flex-1"><Pencil className="h-3.5 w-3.5" />Edit</Link>
                    <button className="btn btn-secondary btn-sm hover:!border-rose-200 hover:!text-rose-600" onClick={() => setToDelete([p])} aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Pagination page={page} pageSize={pageSize} total={filtered.length} noun="plants" onChange={setPage} />
      </div>

      </LoadState>
      <p className="mt-4 text-xs text-ink-400">Total inventory value at selling price: <b className="text-ink-600">{formatPaise(stockValue)}</b></p>

      <ConfirmDialog
        open={!!toDelete}
        title={toDelete && toDelete.length > 1 ? `Delete ${toDelete.length} plants?` : 'Delete this plant?'}
        message={toDelete && toDelete.length === 1 ? <>“<b>{toDelete[0].name}</b>” will be removed from your store listings. This can’t be undone.</> : 'The selected plants will be removed from your store listings. This can’t be undone.'}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
