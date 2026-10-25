'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Boxes,
  Container,
  Grid2x2,
  LayoutDashboard,
  ListChecks,
  Plus,
  Settings,
  ShoppingBag,
  Sprout,
  Star,
  TicketPercent,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

const groups: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/', icon: LayoutDashboard },
      { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { label: 'Plants', href: '/products', icon: Sprout },
      { label: 'Gamlas & Pots', href: '/gamlas', icon: Container },
      { label: 'Categories', href: '/categories', icon: Grid2x2 },
      { label: 'Inventory', href: '/inventory', icon: Boxes },
    ],
  },
  {
    title: 'Sales',
    items: [
      { label: 'Orders', href: '/orders', icon: ShoppingBag, badge: '12' },
      { label: 'Customers', href: '/customers', icon: Users },
      { label: 'Delivery', href: '/delivery', icon: Truck },
      { label: 'Coupons', href: '/coupons', icon: TicketPercent },
      { label: 'Reviews', href: '/reviews', icon: Star },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { label: 'Tasks', href: '/todos', icon: ListChecks },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/'));

  return (
    <aside className="bg-sidebar relative flex h-full w-full flex-col overflow-hidden text-white">
      <div className="bg-dots pointer-events-none absolute inset-0 opacity-40" />

      {/* Brand */}
      <div className="relative px-6 pb-5 pt-7">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 shadow-[0_8px_20px_-6px_rgba(79,181,133,0.7)]">
            <Sprout className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="block font-heading text-[21px] font-semibold leading-none tracking-tight">
              Gamla<span className="text-gold-300">Wala</span>
            </span>
            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-300/80">Admin Studio</span>
          </div>
        </Link>
      </div>

      {/* Quick add */}
      <div className="relative grid grid-cols-2 gap-2 px-4 pb-4">
        <Link href="/products/new" className="flex items-center justify-center gap-1.5 rounded-xl bg-gold-400 py-2.5 text-xs font-bold text-brand-950 transition-colors hover:bg-gold-300">
          <Plus className="h-3.5 w-3.5" /> Plant
        </Link>
        <Link href="/gamlas/new" className="flex items-center justify-center gap-1.5 rounded-xl bg-white/10 py-2.5 text-xs font-bold text-white ring-1 ring-white/10 transition-colors hover:bg-white/15">
          <Plus className="h-3.5 w-3.5" /> Gamla
        </Link>
      </div>

      {/* Nav */}
      <nav className="no-scrollbar relative flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-300/50">{g.title}</p>
            <div className="space-y-0.5">
              {g.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all ${
                      active ? 'bg-white/10 text-white ring-1 ring-white/10' : 'text-brand-100/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {active && <span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gold-300" />}
                    <span className="flex items-center gap-3">
                      <Icon className={`h-[18px] w-[18px] ${active ? 'text-gold-300' : 'text-brand-300/70 group-hover:text-brand-200'}`} />
                      {item.label}
                    </span>
                    {item.badge && <span className="rounded-full bg-gold-400 px-2 py-0.5 text-[10px] font-bold text-brand-950">{item.badge}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer card */}
      <div className="relative p-4">
        <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" />
            </span>
            <span className="text-xs font-semibold">Store is live</span>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-brand-100/60">Har Ghar Hariyali — New Delhi Primary Nursery</p>
        </div>
      </div>
    </aside>
  );
}
