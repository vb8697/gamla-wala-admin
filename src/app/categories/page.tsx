'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Container, Sprout } from 'lucide-react';
import { fetchCategories, fetchGamlas, fetchPlants } from '@/lib/catalog';
import { useAsync } from '@/lib/useAsync';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadState } from '@/components/ui/LoadState';

const palette = ['#2c9a69', '#4fb585', '#e4849a', '#3b7ea1', '#bf8c2e', '#bf8c2e', '#6a994e'];

export default function CategoriesPage() {
  const { data, loading, error } = useAsync(async () => {
    const [cats, plants, pots] = await Promise.all([fetchCategories(), fetchPlants(), fetchGamlas()]);
    const counts: Record<string, number> = {};
    [...plants, ...pots].forEach((p) => p.categoryId && (counts[p.categoryId] = (counts[p.categoryId] || 0) + 1));
    return { cats, counts };
  });

  return (
    <>
      <PageHeader title="Categories" subtitle="How your catalogue is organised in the storefront." />
      <LoadState loading={loading} error={error}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {data?.cats.map((c, i) => {
            const isPots = c.slug === 'pots-planters';
            const color = palette[i % palette.length];
            return (
              <Link key={c.id} href={isPots ? '/gamlas' : '/products'} className="card group relative overflow-hidden p-6 transition-shadow hover:shadow-lift">
                <span className="absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-15 transition-transform duration-500 group-hover:scale-125" style={{ background: color }} />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ background: color }}>{isPots ? <Container className="h-5 w-5" /> : <Sprout className="h-5 w-5" />}</span>
                <h3 className="relative mt-5 text-lg font-semibold">{c.name}</h3>
                <p className="relative mt-1 line-clamp-2 text-[13px] text-ink-500">{c.description ?? '—'}</p>
                <div className="relative mt-5 flex items-center justify-between text-[13px]">
                  <b>{data.counts[c.id] || 0} products</b>
                  <span className="flex items-center gap-1 font-semibold text-brand-700 opacity-0 transition-opacity group-hover:opacity-100">Manage <ArrowRight className="h-3.5 w-3.5" /></span>
                </div>
              </Link>
            );
          })}
        </div>
      </LoadState>
    </>
  );
}
