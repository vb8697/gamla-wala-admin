'use client';

import React, { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { fetchIsAdmin } from '@/lib/catalog';
import { createClient } from '@/utils/supabase/client';

export function AccessBanner() {
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    const check = () => fetchIsAdmin().then(setRole).catch(() => setRole(null));
    check();
    const { data } = createClient().auth.onAuthStateChange(() => check());
    return () => data.subscription.unsubscribe();
  }, []);

  if (!role || role === 'admin' || role === 'staff') return null;
  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
      <Lock className="h-4 w-4 flex-shrink-0" />
      {role === 'anon'
        ? 'You are not signed in. You can view live data, but saving changes needs an admin sign-in (top right).'
        : 'Your account is signed in but is not an admin or staff member, so changes will be rejected by the database.'}
    </div>
  );
}
