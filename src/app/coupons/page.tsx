'use client';

import React, { useState } from 'react';
import { Copy, Plus, TicketPercent, Trash2 } from 'lucide-react';
import { formatPaise } from '@/types/database';
import { createCoupon, deleteCoupon, fetchCoupons, setCouponActive } from '@/lib/catalog';
import { errorMessage, useAsync } from '@/lib/useAsync';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { LoadState } from '@/components/ui/LoadState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';

const blank = { code: '', description: '', type: 'percent', value: '', min: '', limit: '' };

export default function CouponsPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(fetchCoupons);
  const coupons = data ?? [];
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);

  const run = async (fn: () => Promise<void>, ok?: string) => {
    try { await fn(); if (ok) toast(ok); await reload(); } catch (e) { toast(errorMessage(e), 'error'); }
  };

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.value) return;
    run(async () => {
      await createCoupon({
        code: form.code.trim().toUpperCase(),
        description: form.description || null,
        discount_type: form.type,
        discount_value: Number(form.value),
        min_cart_paise: form.min ? Math.round(Number(form.min) * 100) : 0,
        usage_limit: form.limit ? Number(form.limit) : null,
        is_active: true,
      });
      setForm(blank);
      setOpen(false);
    }, 'Coupon created');
  };

  const label = (c: (typeof coupons)[number]) => (c.discount_type === 'percent' || c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`);

  return (
    <>
      <PageHeader title="Coupons" subtitle="Discount codes and promotions." actions={<button className="btn btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" />New coupon</button>} />
      <LoadState loading={loading} error={error}>
        {coupons.length === 0 ? (
          <div className="card"><EmptyState icon={<TicketPercent className="h-6 w-6" />} title="No coupons yet" text="Create your first discount code." /></div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {coupons.map((c) => (
              <div key={c.id} className={`card overflow-hidden ${c.is_active ? '' : 'opacity-70'}`}>
                <div className="bg-hero relative flex items-center justify-between p-5 text-white">
                  <div className="bg-dots pointer-events-none absolute inset-0" />
                  <div className="relative">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-gold-300">{c.discount_type}</p>
                    <p className="font-heading text-3xl font-semibold">{label(c)} <span className="text-base font-normal text-brand-100">off</span></p>
                  </div>
                  <TicketPercent className="relative h-9 w-9 text-white/30" />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <button onClick={() => { navigator.clipboard?.writeText(c.code); toast(`Copied ${c.code}`, 'info'); }} className="flex items-center gap-2 rounded-lg border border-dashed border-ink-300 bg-canvas px-3 py-1.5 font-mono text-[13px] font-bold">
                      {c.code}<Copy className="h-3.5 w-3.5 text-ink-400" />
                    </button>
                    <button onClick={() => run(() => setCouponActive(c.id, !c.is_active))}><Badge tone={c.is_active ? 'green' : 'gray'}>{c.is_active ? 'Active' : 'Inactive'}</Badge></button>
                  </div>
                  <p className="mt-3 text-[13px] text-ink-600">{c.description ?? '—'}</p>
                  {c.min_cart_paise ? <p className="mt-1 text-xs text-ink-400">Min. cart {formatPaise(c.min_cart_paise)}</p> : null}
                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-xs"><span className="text-ink-500">Redeemed</span><b>{c.times_used}{c.usage_limit ? ` / ${c.usage_limit}` : ''}</b></div>
                    {c.usage_limit ? <div className="h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min((c.times_used / c.usage_limit) * 100, 100)}%` }} /></div> : null}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-[11.5px] text-ink-400">{c.valid_until ? `Expires ${new Date(c.valid_until).toLocaleDateString('en-IN')}` : 'No expiry'}</p>
                    <button className="icon-btn !h-8 !w-8 hover:!bg-rose-50 hover:!text-rose-600" onClick={() => run(() => deleteCoupon(c.id), 'Coupon deleted')} aria-label="Delete coupon"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </LoadState>

      <Modal open={open} onClose={() => setOpen(false)}>
        <form onSubmit={create} className="space-y-4 p-6">
          <h3 className="text-lg font-semibold">New coupon</h3>
          <Field label="Code" required><input className="input font-mono uppercase" placeholder="SUMMER20" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></Field>
          <Field label="Description"><input className="input" placeholder="20% off all plants" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type"><select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="percent">Percent</option><option value="flat">Flat (₹)</option></select></Field>
            <Field label={form.type === 'percent' ? 'Percent (%)' : 'Amount (₹)'} required><input type="number" min="1" className="input" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></Field>
            <Field label="Min. cart (₹)"><input type="number" min="0" className="input" value={form.min} onChange={(e) => setForm({ ...form, min: e.target.value })} /></Field>
            <Field label="Usage limit"><input type="number" min="1" className="input" placeholder="Unlimited" value={form.limit} onChange={(e) => setForm({ ...form, limit: e.target.value })} /></Field>
          </div>
          <div className="flex justify-end gap-2.5 pt-2"><button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn btn-primary">Create coupon</button></div>
        </form>
      </Modal>
    </>
  );
}
