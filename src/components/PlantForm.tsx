'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Droplets, Heart, Leaf, Save, Sparkles, Sun, Wind, Flower, Wand2 } from 'lucide-react';
import {
  AdminProduct,
  BOTANICAL_PRESETS,
  MAINTENANCE_OPTIONS,
  PLACEMENT_OPTIONS,
  PLANT_SIZES,
  PlantStockStatus,
  SUNLIGHT_OPTIONS,
  WATERING_OPTIONS,
  computeStockStatus,
  generateSuggestedSku,
  slugify,
} from '@/lib/productsStorage';
import { formatPaise } from '@/types/database';
import type { DbCategory, DbStore } from '@/lib/catalog';
import { Card, Field, Toggle } from '@/components/ui/Field';
import { ImageUploader } from '@/components/ui/ImageUploader';

type Payload = Omit<AdminProduct, 'id' | 'createdAt'>;

const toStatus = (s: PlantStockStatus): AdminProduct['status'] =>
  s === 'In Stock' ? 'in_stock' : s === 'Low Stock' ? 'low_stock' : s === 'Out of Stock' ? 'out_of_stock' : 'draft';

export function PlantForm({
  initial,
  categories,
  stores,
  saving,
  onSave,
}: {
  initial?: AdminProduct | null;
  categories: DbCategory[];
  stores: DbStore[];
  saving?: boolean;
  onSave: (p: Payload, storeId: string) => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [scientificName, setScientificName] = useState(initial?.scientificName ?? '');
  const plantCats = categories.filter((c) => c.slug !== 'pots-planters');
  const [categoryId, setCategoryId] = useState<string>(initial?.categoryId ?? plantCats[0]?.id ?? '');
  const [storeId, setStoreId] = useState<string>(initial?.storeId ?? stores[0]?.id ?? '');
  const category = categories.find((c) => c.id === categoryId)?.name ?? '';
  const [images, setImages] = useState<string[]>(initial?.images?.length ? initial.images : initial?.image ? [initial.image] : []);

  const [price, setPrice] = useState(initial ? String(initial.pricePaise / 100) : '');
  const [compare, setCompare] = useState(initial?.comparePricePaise ? String(initial.comparePricePaise / 100) : '');
  const [cost, setCost] = useState(initial?.costPricePaise ? String(initial.costPricePaise / 100) : '');
  const [stock, setStock] = useState(initial ? String(initial.stock) : '25');
  const [threshold, setThreshold] = useState(String(initial?.lowStockThreshold ?? 10));
  const [draft, setDraft] = useState(initial?.stockStatus === 'Draft' || initial?.status === 'draft');

  const [plantSize, setPlantSize] = useState(initial?.plantSize ?? PLANT_SIZES[1]);
  const [placement, setPlacement] = useState(initial?.placement ?? PLACEMENT_OPTIONS[0]);
  const [sunlight, setSunlight] = useState(initial?.sunlight ?? SUNLIGHT_OPTIONS[0].label);
  const [watering, setWatering] = useState(initial?.watering ?? WATERING_OPTIONS[0].label);
  const [maintenance, setMaintenance] = useState(initial?.maintenance ?? MAINTENANCE_OPTIONS[1].label);
  const [petFriendly, setPetFriendly] = useState(!!initial?.petFriendly);
  const [airPurifying, setAirPurifying] = useState(!!initial?.airPurifying);
  const [vastu, setVastu] = useState(!!initial?.vastuAuspicious);
  const [flowering, setFlowering] = useState(!!initial?.flowering);
  const [soilTip, setSoilTip] = useState(initial?.soilTip ?? '');
  const [pot, setPot] = useState(initial?.pot ?? 'Plant Only (Nursery Grow Bag)');

  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [careInstructions, setCareInstructions] = useState(initial?.careInstructions ?? '');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const stockNum = parseInt(stock, 10);
  const stockStatus: PlantStockStatus = draft ? 'Draft' : isNaN(stockNum) ? 'In Stock' : computeStockStatus(stockNum);
  const priceNum = parseFloat(price);
  const compareNum = parseFloat(compare);
  const costNum = parseFloat(cost);
  const margin = !isNaN(priceNum) && !isNaN(costNum) && priceNum > 0 ? Math.round(((priceNum - costNum) / priceNum) * 100) : null;
  const discount = !isNaN(priceNum) && !isNaN(compareNum) && compareNum > priceNum ? Math.round(((compareNum - priceNum) / compareNum) * 100) : null;

  const applyPreset = (idx: number) => {
    const p = BOTANICAL_PRESETS[idx];
    if (!p) return;
    setName(p.name);
    setScientificName(p.scientificName);
    const match = plantCats.find((c) => c.name.toLowerCase().includes(p.category.toLowerCase().split(' ')[0]));
    if (match) setCategoryId(match.id);
    setPlantSize(p.plantSize);
    setSunlight(p.sunlight);
    setWatering(p.watering);
    setMaintenance(p.maintenance);
    setPetFriendly(p.petFriendly);
    setAirPurifying(p.airPurifying);
    setVastu(p.vastuAuspicious);
    setFlowering(p.flowering);
    setPlacement(p.placement);
    setPrice(String(p.suggestedPriceInr));
    setCompare(String(p.suggestedCompareInr));
    setShortDescription(p.description);
    setSoilTip(p.soilTip);
    if (images.length === 0) setImages([p.url]);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Plant name is required';
    if (!categoryId) e.category = 'Choose a category';
    if (!storeId) e.store = 'Choose a store for this stock';
    if (isNaN(priceNum) || priceNum <= 0) e.price = 'Enter a valid selling price';
    if (!isNaN(compareNum) && compare && compareNum < priceNum) e.compare = 'Compare-at price should be higher than the selling price';
    if (isNaN(stockNum) || stockNum < 0) e.stock = 'Enter a valid stock quantity';
    if (!shortDescription.trim()) e.shortDescription = 'A short description is required';
    if (images.length === 0) e.images = 'Upload at least one plant photo';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    onSave({
      categoryId,
      name: name.trim(),
      slug: (initial?.slug || slugify(name)).trim(),
      scientificName: scientificName.trim() || undefined,
      category,
      sku: (initial?.sku || generateSuggestedSku(name, category)).trim(),
      pricePaise: Math.round(priceNum * 100),
      comparePricePaise: !isNaN(compareNum) && compare ? Math.round(compareNum * 100) : undefined,
      costPricePaise: !isNaN(costNum) && cost ? Math.round(costNum * 100) : undefined,
      stock: stockNum || 0,
      lowStockThreshold: parseInt(threshold, 10) || 10,
      status: toStatus(stockStatus),
      stockStatus,
      image: images[0],
      images,
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      careInstructions: careInstructions.trim(),
      plantSize,
      placement,
      sunlight,
      watering,
      maintenance,
      petFriendly,
      airPurifying,
      vastuAuspicious: vastu,
      flowering,
      soilTip: soilTip.trim() || undefined,
      pot,
    }, storeId);
  };

  const statusTone = useMemo(
    () => ({ 'In Stock': 'bg-brand-500', 'Low Stock': 'bg-amber-500', 'Out of Stock': 'bg-rose-500', Draft: 'bg-ink-400' }[stockStatus]),
    [stockStatus]
  );

  const attr = (on: boolean, set: (v: boolean) => void, label: string, Icon: React.ElementType) => (
    <button
      type="button"
      onClick={() => set(!on)}
      aria-pressed={on}
      className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left text-[13px] font-semibold transition-all ${
        on ? 'border-brand-500 bg-brand-50 text-brand-800 ring-2 ring-brand-500/15' : 'border-line bg-white text-ink-600 hover:border-ink-300'
      }`}
    >
      <Icon className={`h-4 w-4 ${on ? 'text-brand-600' : 'text-ink-400'}`} /> {label}
    </button>
  );

  return (
    <form onSubmit={submit} noValidate>
      {Object.keys(errors).length > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-[13px] text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            <b>Please fix the highlighted fields</b>
            <ul className="mt-1 list-disc pl-4 text-xs">{Object.values(errors).map((m) => <li key={m}>{m}</li>)}</ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        {/* ───── Main column ───── */}
        <div className="space-y-6">
          {!initial && (
            <div className="flex flex-col gap-3 rounded-2xl border border-gold-200 bg-gradient-to-r from-gold-50 to-white p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-100 text-gold-600"><Wand2 className="h-5 w-5" /></span>
                <div>
                  <p className="text-[13px] font-semibold">Quick-fill from a botanical template</p>
                  <p className="text-xs text-ink-500">Pre-fills care, pricing and description. You can edit everything.</p>
                </div>
              </div>
              <select className="input sm:ml-auto sm:max-w-[260px]" defaultValue="" onChange={(e) => e.target.value !== '' && applyPreset(Number(e.target.value))}>
                <option value="">Choose a template…</option>
                {BOTANICAL_PRESETS.map((p, i) => <option key={p.name} value={i}>{p.name}</option>)}
              </select>
            </div>
          )}

          <Card title="Photos" subtitle="The first photo is the cover shown in the store. Add up to 8.">
            <ImageUploader images={images} onChange={setImages} error={errors.images} />
          </Card>

          <Card title="Basic information">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Plant name" required error={errors.name} className="sm:col-span-2">
                <input className={`input ${errors.name ? 'input-error' : ''}`} placeholder="e.g. Monstera Deliciosa" value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Scientific name" hint="Shown in italics on the product page">
                <input className="input italic" placeholder="Monstera deliciosa" value={scientificName} onChange={(e) => setScientificName(e.target.value)} />
              </Field>
              <Field label="Category" required>
                <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  {plantCats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
            </div>
          </Card>

          <Card title="Pricing & inventory">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Field label="Selling price (₹)" required error={errors.price}>
                <input type="number" min="0" className={`input ${errors.price ? 'input-error' : ''}`} placeholder="499" value={price} onChange={(e) => setPrice(e.target.value)} />
              </Field>
              <Field label="Compare-at price (₹)" error={errors.compare} hint={discount ? `Shows ${discount}% off` : 'Optional strike-through price'}>
                <input type="number" min="0" className={`input ${errors.compare ? 'input-error' : ''}`} placeholder="699" value={compare} onChange={(e) => setCompare(e.target.value)} />
              </Field>
              <Field label="Cost per plant (₹)" hint={margin !== null ? `Gross margin ${margin}%` : 'Private — used for margin'}>
                <input type="number" min="0" className="input" placeholder="250" value={cost} onChange={(e) => setCost(e.target.value)} />
              </Field>
              <Field label="Store / location" required error={errors.store} hint="Where this stock is held">
                <select className="input" value={storeId} onChange={(e) => setStoreId(e.target.value)}>
                  {stores.map((st) => <option key={st.id} value={st.id}>{st.name}</option>)}
                </select>
              </Field>
              <Field label="Stock quantity" required error={errors.stock}>
                <input type="number" min="0" className={`input ${errors.stock ? 'input-error' : ''}`} value={stock} onChange={(e) => setStock(e.target.value)} />
              </Field>
              <Field label="Low-stock alert at" hint="Alert when stock falls to this">
                <input type="number" min="0" className="input" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
              </Field>
              <Field label="Sold with">
                <select className="input" value={pot} onChange={(e) => setPot(e.target.value)}>
                  <option>Plant Only (Nursery Grow Bag)</option>
                  <option>With Terracotta Gamla</option>
                  <option>With Ceramic Planter</option>
                  <option>With Designer Pot</option>
                </select>
              </Field>
            </div>
          </Card>

          <Card title="Plant care & attributes" subtitle="Helps customers choose the right plant for their space.">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Plant size">
                <select className="input" value={plantSize} onChange={(e) => setPlantSize(e.target.value)}>{PLANT_SIZES.map((s) => <option key={s}>{s}</option>)}</select>
              </Field>
              <Field label="Best placement">
                <select className="input" value={placement} onChange={(e) => setPlacement(e.target.value)}>{PLACEMENT_OPTIONS.map((s) => <option key={s}>{s}</option>)}</select>
              </Field>
              <Field label="Sunlight" hint={SUNLIGHT_OPTIONS.find((o) => o.label === sunlight)?.desc}>
                <select className="input" value={sunlight} onChange={(e) => setSunlight(e.target.value)}>{SUNLIGHT_OPTIONS.map((o) => <option key={o.id}>{o.label}</option>)}</select>
              </Field>
              <Field label="Watering" hint={WATERING_OPTIONS.find((o) => o.label === watering)?.desc}>
                <select className="input" value={watering} onChange={(e) => setWatering(e.target.value)}>{WATERING_OPTIONS.map((o) => <option key={o.id}>{o.label}</option>)}</select>
              </Field>
              <Field label="Maintenance level" className="sm:col-span-2">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {MAINTENANCE_OPTIONS.map((o) => (
                    <button type="button" key={o.id} onClick={() => setMaintenance(o.label)} className={`rounded-xl border px-3 py-2.5 text-left transition-all ${maintenance === o.label ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/15' : 'border-line hover:border-ink-300'}`}>
                      <span className="block text-xs font-bold text-ink-800">{o.badge}</span>
                      <span className="block text-[11px] text-ink-500">{o.label.split(' (')[0]}</span>
                    </button>
                  ))}
                </div>
              </Field>
              <div className="sm:col-span-2">
                <span className="label">Highlights</span>
                <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                  {attr(petFriendly, setPetFriendly, 'Pet friendly', Heart)}
                  {attr(airPurifying, setAirPurifying, 'Air purifying', Wind)}
                  {attr(vastu, setVastu, 'Vastu auspicious', Sparkles)}
                  {attr(flowering, setFlowering, 'Flowering', Flower)}
                </div>
              </div>
              <Field label="Soil tip" className="sm:col-span-2">
                <input className="input" placeholder="Chunky aroid mix with coco chips and perlite" value={soilTip} onChange={(e) => setSoilTip(e.target.value)} />
              </Field>
            </div>
          </Card>

          <Card title="Description">
            <div className="space-y-5">
              <Field label="Short description" required error={errors.shortDescription} hint={`${shortDescription.length}/160 characters`}>
                <textarea rows={2} maxLength={160} className={`input ${errors.shortDescription ? 'input-error' : ''}`} placeholder="One or two lines shown on listing cards" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
              </Field>
              <Field label="Detailed description">
                <textarea rows={6} className="input" placeholder="Tell the full story of this plant…" value={description} onChange={(e) => setDescription(e.target.value)} />
              </Field>
              <Field label="Care instructions">
                <textarea rows={3} className="input" placeholder="Watering schedule, light, feeding, repotting…" value={careInstructions} onChange={(e) => setCareInstructions(e.target.value)} />
              </Field>
            </div>
          </Card>
        </div>

        {/* ───── Side column ───── */}
        <aside className="space-y-6 xl:sticky xl:top-[92px] xl:self-start">
          <Card title="Publish">
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-canvas px-4 py-3">
                <span className="text-xs font-semibold text-ink-500">Status</span>
                <span className="flex items-center gap-2 text-[13px] font-bold"><span className={`h-2 w-2 rounded-full ${statusTone}`} />{stockStatus}</span>
              </div>
              <Toggle checked={draft} onChange={setDraft} label="Save as draft" desc="Hidden from the storefront" />
              <button type="submit" disabled={saving} className="btn btn-primary w-full !h-11"><Save className="h-4 w-4" />{saving ? 'Saving…' : initial ? 'Save changes' : 'Publish plant'}</button>
              <Link href="/products" className="btn btn-secondary w-full">Cancel</Link>
            </div>
          </Card>

          <Card title="Live preview" subtitle="How the card appears in your store">
            <div className="overflow-hidden rounded-2xl border border-line">
              <div className="relative aspect-[4/3] bg-brand-50">
                {images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={images[0]} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-brand-300"><Leaf className="h-10 w-10" /></div>
                )}
                {discount && <span className="absolute left-3 top-3 rounded-full bg-gold-400 px-2.5 py-1 text-[11px] font-bold text-brand-950">{discount}% OFF</span>}
              </div>
              <div className="p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">{category}</p>
                <h4 className="mt-1 font-heading text-base font-semibold leading-snug">{name || 'Plant name'}</h4>
                <p className="mt-1 line-clamp-2 text-xs text-ink-500">{shortDescription || 'Your short description appears here.'}</p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-lg font-bold">{!isNaN(priceNum) && priceNum > 0 ? formatPaise(Math.round(priceNum * 100)) : '₹0'}</span>
                  {discount && <span className="text-xs text-ink-400 line-through">{formatPaise(Math.round(compareNum * 100))}</span>}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {petFriendly && <span className="chip border-brand-200 bg-brand-50 text-brand-700"><Heart className="h-3 w-3" />Pet safe</span>}
                  {airPurifying && <span className="chip border-sky-200 bg-sky-50 text-sky-700"><Wind className="h-3 w-3" />Purifies</span>}
                  {vastu && <span className="chip border-gold-200 bg-gold-50 text-gold-600"><Sparkles className="h-3 w-3" />Vastu</span>}
                  <span className="chip border-line bg-canvas text-ink-600"><Sun className="h-3 w-3" />{sunlight.split(' (')[0]}</span>
                  <span className="chip border-line bg-canvas text-ink-600"><Droplets className="h-3 w-3" />{watering}</span>
                </div>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </form>
  );
}
