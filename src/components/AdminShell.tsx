'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminHeader } from '@/components/AdminHeader';
import { AccessBanner } from '@/components/AccessBanner';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => setDrawerOpen(false), [pathname]);

  if (pathname === '/login') return <main className="min-h-screen">{children}</main>;

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop sidebar */}
      <div className="sticky top-0 hidden h-screen w-[272px] flex-shrink-0 lg:block">
        <AdminSidebar />
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 animate-fadeIn bg-brand-950/50 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[272px] animate-drawerIn">
            <AdminSidebar />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader onMenu={() => setDrawerOpen(true)} />
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-7 sm:px-6 lg:px-9 lg:py-9">
          <AccessBanner />
          {children}
        </main>
      </div>
    </div>
  );
}
