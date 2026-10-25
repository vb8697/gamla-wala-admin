'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import { GamlaForm } from '@/components/GamlaForm';
import { createGamla, fetchStores } from '@/lib/catalog';
import { errorMessage, useAsync } from '@/lib/useAsync';
import { useToast } from '@/components/ui/Toast';
import { LoadState } from '@/components/ui/LoadState';

export default function NewGamlaPage() {
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const { data: stores, loading, error } = useAsync(fetchStores);

  return (
    <>
      <PageHeader
        title="Add new gamla"
        subtitle="List a pot, planter or gamla for your customers."
        breadcrumbs={[{ label: 'Gamlas & Pots', href: '/gamlas' }, { label: 'Add gamla' }]}
      />
      <LoadState loading={loading} error={error}>
        {stores && (
          <GamlaForm
            stores={stores}
            saving={saving}
            onSave={async (g, storeId) => {
              setSaving(true);
              try {
                await createGamla(g, storeId);
                toast(`“${g.name}” published to your store`);
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
