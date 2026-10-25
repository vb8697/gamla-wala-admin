'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, ChevronDown, Container, ExternalLink, LogOut, Menu, Plus, Search, Sprout } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { GoogleSignInButton } from './GoogleSignInButton';
import type { User } from '@supabase/supabase-js';

function useOutside(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && cb();
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [ref, cb]);
}

const notifications = [
  { id: 1, title: 'New order GW-IND-948102', time: '5 min ago', tone: 'bg-brand-500' },
  { id: 2, title: 'Snake Plant is running low (6 left)', time: '1 hr ago', tone: 'bg-amber-500' },
  { id: 3, title: 'New 5★ review on Monstera Deliciosa', time: '3 hr ago', tone: 'bg-gold-400' },
];

export function AdminHeader({ onMenu }: { onMenu: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [menu, setMenu] = useState<'user' | 'add' | 'bell' | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  useOutside(wrap, () => setMenu(null));

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await createClient().auth.signOut();
    setUser(null);
    setMenu(null);
  };

  const avatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Admin';
  const toggle = (m: 'user' | 'add' | 'bell') => setMenu((c) => (c === m ? null : m));

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur-xl">
      <div className="flex h-[68px] items-center gap-3 px-4 sm:px-6 lg:px-9">
        <button className="icon-btn lg:hidden" onClick={onMenu} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative hidden max-w-md flex-1 sm:block">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input className="input !h-10 !bg-white pl-10 pr-14" placeholder="Search plants, orders, customers…" />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-line bg-canvas px-1.5 py-0.5 text-[10px] font-semibold text-ink-500">⌘K</kbd>
        </div>

        <div ref={wrap} className="ml-auto flex items-center gap-2">
          {/* Quick add */}
          <div className="relative">
            <button className="btn btn-primary !h-10" onClick={() => toggle('add')}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add new</span>
              <ChevronDown className="hidden h-3.5 w-3.5 opacity-70 sm:block" />
            </button>
            {menu === 'add' && (
              <div className="absolute right-0 mt-2 w-64 animate-slideUp rounded-2xl border border-line bg-white p-2 shadow-lift">
                <Link href="/products/new" onClick={() => setMenu(null)} className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-brand-50">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><Sprout className="h-4 w-4" /></span>
                  <span><b className="block text-[13px]">Add Plant</b><span className="text-xs text-ink-500">List a new plant</span></span>
                </Link>
                <Link href="/gamlas/new" onClick={() => setMenu(null)} className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-gold-50">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-50 text-gold-600"><Container className="h-4 w-4" /></span>
                  <span><b className="block text-[13px]">Add Gamla / Pot</b><span className="text-xs text-ink-500">List a new planter</span></span>
                </Link>
              </div>
            )}
          </div>

          <a href="http://localhost:3000" target="_blank" rel="noreferrer" className="btn btn-secondary !h-10 hidden md:inline-flex">
            Live store <ExternalLink className="h-3.5 w-3.5 text-ink-400" />
          </a>

          {/* Notifications */}
          <div className="relative">
            <button className="icon-btn relative border border-line bg-white" onClick={() => toggle('bell')} aria-label="Notifications">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
            {menu === 'bell' && (
              <div className="absolute right-0 mt-2 w-80 animate-slideUp rounded-2xl border border-line bg-white p-2 shadow-lift">
                <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-ink-500">Notifications</p>
                {notifications.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 rounded-xl p-3 hover:bg-canvas">
                    <span className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${n.tone}`} />
                    <div>
                      <p className="text-[13px] font-medium">{n.title}</p>
                      <p className="text-[11.5px] text-ink-400">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User */}
          <div className="relative">
            {user ? (
              <>
                <button onClick={() => toggle('user')} className="flex items-center gap-2 rounded-xl border border-line bg-white p-1 pr-2.5 transition-colors hover:border-ink-300">
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatar} alt={name} className="h-8 w-8 rounded-lg object-cover" />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-800 text-xs font-bold text-white">{name[0]?.toUpperCase()}</span>
                  )}
                  <span className="hidden max-w-[110px] truncate text-[13px] font-semibold md:block">{name}</span>
                  <ChevronDown className="hidden h-3.5 w-3.5 text-ink-400 md:block" />
                </button>
                {menu === 'user' && (
                  <div className="absolute right-0 mt-2 w-60 animate-slideUp rounded-2xl border border-line bg-white p-2 shadow-lift">
                    <div className="border-b border-line px-3 pb-2.5 pt-2">
                      <p className="truncate text-[13px] font-semibold">{name}</p>
                      <p className="truncate text-xs text-ink-500">{user.email}</p>
                    </div>
                    <Link href="/settings" onClick={() => setMenu(null)} className="mt-1 block rounded-xl px-3 py-2 text-[13px] font-medium hover:bg-canvas">Settings</Link>
                    <button onClick={signOut} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold text-rose-600 hover:bg-rose-50">
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <GoogleSignInButton variant="compact" label="Sign in" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
