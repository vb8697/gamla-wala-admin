'use client';

import React from 'react';
import { MessageSquareText, Star, Trash2 } from 'lucide-react';
import { deleteReview, fetchReviews } from '@/lib/catalog';
import { errorMessage, useAsync } from '@/lib/useAsync';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadState } from '@/components/ui/LoadState';
import { useToast } from '@/components/ui/Toast';

const Stars = ({ n }: { n: number }) => (
  <span className="flex gap-0.5">{[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`h-4 w-4 ${i <= n ? 'fill-gold-400 text-gold-400' : 'text-ink-300'}`} />)}</span>
);

export default function ReviewsPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(fetchReviews);
  const reviews = data ?? [];
  const avg = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : '—';

  const remove = async (id: string) => {
    try {
      await deleteReview(id);
      toast('Review removed', 'info');
      await reload();
    } catch (e) {
      toast(errorMessage(e), 'error');
    }
  };

  return (
    <>
      <PageHeader title="Reviews" subtitle="What customers say about your plants and gamlas." />
      <LoadState loading={loading} error={error}>
        <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
          <div className="card card-pad text-center">
            <p className="font-heading text-6xl font-semibold">{avg}</p>
            <div className="mt-2 flex justify-center"><Stars n={Math.round(Number(avg) || 0)} /></div>
            <p className="mt-2 text-xs text-ink-500">Based on {reviews.length} reviews</p>
          </div>
          <div className="card card-pad space-y-2.5">
            {[5, 4, 3, 2, 1].map((s) => {
              const n = reviews.filter((r) => r.rating === s).length;
              return (
                <div key={s} className="flex items-center gap-3 text-xs">
                  <span className="flex w-8 items-center gap-1 font-semibold">{s}<Star className="h-3 w-3 fill-gold-400 text-gold-400" /></span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-gold-400" style={{ width: `${reviews.length ? (n / reviews.length) * 100 : 0}%` }} /></div>
                  <span className="w-4 text-right text-ink-500">{n}</span>
                </div>
              );
            })}
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="card"><EmptyState icon={<MessageSquareText className="h-6 w-6" />} title="No reviews yet" text="Customer reviews will show up here." /></div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="card card-pad flex flex-col gap-4 sm:flex-row sm:items-start">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-800">{r.userName[0]}</span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1"><b>{r.userName}</b><Stars n={r.rating} /><span className="text-xs text-ink-400">{new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
                  <p className="text-xs font-semibold text-brand-700">{r.products?.name}</p>
                  {r.title && <p className="mt-2 text-[13.5px] font-semibold">{r.title}</p>}
                  {r.review_text && <p className="mt-1 text-[13.5px] text-ink-700">{r.review_text}</p>}
                </div>
                <button className="btn btn-sm btn-secondary hover:!border-rose-200 hover:!text-rose-600" onClick={() => remove(r.id)}><Trash2 className="h-3.5 w-3.5" />Remove</button>
              </div>
            ))}
          </div>
        )}
      </LoadState>
    </>
  );
}
