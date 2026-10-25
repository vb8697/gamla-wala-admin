'use client';

import React, { useMemo, useState } from 'react';
import { Mail, Phone, Search, Users } from 'lucide-react';
import { formatPaise } from '@/types/database';
import { fetchCustomers } from '@/lib/catalog';
import { useAsync } from '@/lib/useAsync';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadState } from '@/components/ui/LoadState';

const avatarBg = ['bg-brand-700', 'bg-gold-500', 'bg-sky-600', 'bg-violet-600', 'bg-rose-500'];

export default function CustomersPage() {
  const { data, loading, error } = useAsync(fetchCustomers);
  const customers = data ?? [];
  const [q, setQ] = useState('');
  const rows = useMemo(() => customers.filter((c) => !q || ((c.full_name ?? '') + (c.email ?? '')).toLowerCase().includes(q.toLowerCase())), [customers, q]);
  const buyers = customers.filter((c) => c.orders > 0);
  const repeat = buyers.length ? Math.round((buyers.filter((c) => c.orders > 1).length / buyers.length) * 100) : 0;
  const ltv = buyers.length ? Math.round(buyers.reduce((a, c) => a + c.spentPaise, 0) / buyers.length) : 0;

  return (
    <>
      <PageHeader title="Customers" subtitle="Everyone who has signed up with GamlaWala." />
      <LoadState loading={loading} error={error}>
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total customers" value={customers.length} icon={<Users className="h-5 w-5" />} />
          <StatCard label="Repeat buyers" value={`${repeat}%`} icon={<Users className="h-5 w-5" />} tone="gold" />
          <StatCard label="Avg. lifetime value" value={formatPaise(ltv)} icon={<Users className="h-5 w-5" />} tone="blue" />
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-line p-4">
            <div className="relative sm:max-w-sm">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input className="input pl-10" placeholder="Search customers…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>
          {rows.length === 0 ? (
            <EmptyState icon={<Users className="h-6 w-6" />} title="No customers yet" text="Customers appear here after they sign up on your storefront." />
          ) : (
            <div className="table-wrap">
              <table className="tbl">
                <thead><tr><th>Customer</th><th>Contact</th><th>Orders</th><th>Total spent</th></tr></thead>
                <tbody>
                  {rows.map((c, i) => (
                    <tr key={c.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${avatarBg[i % avatarBg.length]}`}>{(c.full_name ?? c.email ?? '?')[0]?.toUpperCase()}</span>
                          <span><b className="block">{c.full_name ?? 'Unnamed'}</b><span className="text-[11px] text-ink-400">Joined {new Date(c.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span></span>
                        </div>
                      </td>
                      <td className="text-[13px] text-ink-600">
                        {c.email && <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-ink-400" />{c.email}</span>}
                        {c.phone && <span className="mt-0.5 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-ink-400" />{c.phone}</span>}
                      </td>
                      <td className="font-semibold">{c.orders}</td>
                      <td className="font-semibold">{formatPaise(c.spentPaise)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </LoadState>
    </>
  );
}
