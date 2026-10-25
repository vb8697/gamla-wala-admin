'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import { PlantForm } from '@/components/PlantForm';
import { fetchCategories, fetchPlant, fetchStores, updatePlant } from '@/lib/catalog';
import { errorMessage, useAsync } from '@/lib/useAsync';
import { useToast } from '@/components/ui/Toast';
import { LoadState } from '@/components/ui/LoadState';

export default function EditPlantPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const { data, loading, error } = useAsync(async () => ({
    plant: await fetchPlant(id),
    categories: await fetchCategories(),
    stores: await fetchStores(),
  }), [id]);
  const plant = data?.plant;

  return (
    <>
      <PageHeader
        title={plant ? `Edit ${plant.name}` : 'Edit plant'}
        subtitle={plant ? `SKU ${plant.sku}` : undefined}
        breadcrumbs={[{ label: 'Plants', href: '/products' }, { label: 'Edit' }]}
      />
      <LoadState loading={loading} error={error}>
        {data && !plant && <div className="card card-pad text-sm text-ink-500">This plant could not be found.</div>}
        {data && plant && (
          <PlantForm
            initial={plant}
            categories={data.categories}
            stores={data.stores}
            saving={saving}
            onSave={async (p, storeId) => {
              setSaving(true);
              try {
                await updatePlant(plant, p, storeId);
                toast(`“${p.name}” updated`);
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
