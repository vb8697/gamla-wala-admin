'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import { GamlaForm } from '@/components/GamlaForm';
import { fetchGamla, fetchStores, updateGamla } from '@/lib/catalog';
import { errorMessage, useAsync } from '@/lib/useAsync';
import { useToast } from '@/components/ui/Toast';
import { LoadState } from '@/components/ui/LoadState';

export default function EditGamlaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const { data, loading, error } = useAsync(async () => ({ pot: await fetchGamla(id), stores: await fetchStores() }), [id]);
  const pot = data?.pot;

  return (
    <>
      <PageHeader
        title={pot ? `Edit ${pot.name}` : 'Edit gamla'}
        subtitle={pot ? `SKU ${pot.sku}` : undefined}
        breadcrumbs={[{ label: 'Gamlas & Pots', href: '/gamlas' }, { label: 'Edit' }]}
      />
      <LoadState loading={loading} error={error}>
        {data && !pot && <div className="card card-pad text-sm text-ink-500">This gamla could not be found.</div>}
        {data && pot && (
          <GamlaForm
            initial={pot}
            stores={data.stores}
            saving={saving}
            onSave={async (g, storeId) => {
              setSaving(true);
              try {
                await updateGamla(pot, g, storeId);
                toast(`“${g.name}” updated`);
                router.push('/gamlas');
              } catch (e) {
                toast(errorMessage(e), 'error');
                setSaving(false);
              }
            }}
          />
        )}
      </LoadState>
    </>
  );
}
