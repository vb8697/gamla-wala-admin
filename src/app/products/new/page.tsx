'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import { PlantForm } from '@/components/PlantForm';
import { createPlant, fetchCategories, fetchStores } from '@/lib/catalog';
import { errorMessage, useAsync } from '@/lib/useAsync';
import { useToast } from '@/components/ui/Toast';
import { LoadState } from '@/components/ui/LoadState';

export default function NewPlantPage() {
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const { data, loading, error } = useAsync(async () => ({ categories: await fetchCategories(), stores: await fetchStores() }));

  return (
    <>
      <PageHeader
        title="Add new plant"
        subtitle="Create a listing for your nursery. Everything can be edited later."
        breadcrumbs={[{ label: 'Plants', href: '/products' }, { label: 'Add plant' }]}
      />
      <LoadState loading={loading} error={error}>
        {data && (
          <PlantForm
            categories={data.categories}
            stores={data.stores}
            saving={saving}
            onSave={async (p, storeId) => {
              setSaving(true);
              try {
                await createPlant(p, storeId);
                toast(`“${p.name}” published to your store`);
                router.push('/products');
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
