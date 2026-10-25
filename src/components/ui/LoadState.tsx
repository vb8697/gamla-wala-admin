import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

export function LoadState({ loading, error, children }: { loading: boolean; error: string | null; children: React.ReactNode }) {
  if (loading)
    return (
      <div className="card flex items-center justify-center gap-3 py-20 text-[13px] text-ink-500">
        <Loader2 className="h-5 w-5 animate-spin text-brand-600" /> Loading…
      </div>
    );
  if (error)
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-[13px] text-rose-700">
        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <div><b>Couldn’t load data</b><p className="mt-0.5 text-xs">{error}</p></div>
      </div>
    );
  return <>{children}</>;
}
