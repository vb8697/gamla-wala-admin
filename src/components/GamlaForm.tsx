'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Container, Droplet, Save } from 'lucide-react';
import {
  GAMLA_MATERIALS,
  GAMLA_SIZES,
  GAMLA_STYLES,
  GamlaPotProduct,
  PLACEMENT_OPTIONS,
  generateGamlaSku,
} from '@/lib/productsStorage';
import { formatPaise } from '@/types/database';
import type { DbStore } from '@/lib/catalog';
import { Card, Field, Toggle } from '@/components/ui/Field';
import { ImageUploader } from '@/components/ui/ImageUploader';

type Payload = Omit<GamlaPotProduct, 'id' | 'createdAt'>;

const COLORS = [
  { name: 'Earthen Red', hex: '#b5532f' },
  { name: 'Matte Sage Green', hex: '#8fb39b' },
  { name: 'Ivory White', hex: '#f1ede2' },
  { name: 'Charcoal Black', hex: '#2b2f2c' },
  { name: 'Ocean Blue', hex: '#3b7ea1' },
  { name: 'Mustard Gold', hex: '#d3a843' },
  { name: 'Blush Pink', hex: '#e4b4b0' },
];

export function GamlaForm({
  initial,
  stores,
  saving,
  onSave,
}: {
  initial?: GamlaPotProduct | null;
  stores: DbStore[];
  saving?: boolean;
  onSave: (p: Payload, storeId: string) => void;
}) {
  const [storeId, setStoreId] = useState<string>(initial?.storeId ?? stores[0]?.id ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [material, setMaterial] = useState<string>(initial?.material ?? GAMLA_MATERIALS[0]);
  const [diameter, setDiameter] = useState<string>(initial?.diameter ?? GAMLA_SIZES[2]);
  const [style, setStyle] = useState<string>(initial?.style ?? GAMLA_STYLES[0]);
  const [color, setColor] = useState(initial?.color ?? COLORS[0].name);
  const [drainage, setDrainage] = useState(initial?.drainageHole ?? true);
  const [weight, setWeight] = useState(initial?.weightKg ? String(initial.weightKg) : '');
  const [suitableFor, setSuitableFor] = useState(initial?.suitableFor ?? PLACEMENT_OPTIONS[0]);
  const [sku, setSku] = useState(initial?.sku ?? '');
  const [images, setImages] = useState<string[]>(initial?.images?.length ? initial.images : initial?.image ? [initial.image] : []);

  const [price, setPrice] = useState(initial ? String(initial.pricePaise / 100) : '');
  const [compare, setCompare] = useState(initial?.comparePricePaise ? String(initial.comparePricePaise / 100) : '');
  const [stock, setStock] = useState(initial ? String(initial.stock) : '30');
  const [threshold, setThreshold] = useState(String(initial?.lowStockThreshold ?? 10));
  const [active, setActive] = useState(initial ? initial.status === 'active' : true);

  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const priceNum = parseFloat(price);
  const compareNum = parseFloat(compare);
  const discount = !isNaN(priceNum) && !isNaN(compareNum) && compareNum > priceNum ? Math.round(((compareNum - priceNum) / compareNum) * 100) : null;
  const colorHex = COLORS.find((c) => c.name === color)?.hex ?? '#ccc';

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Gamla name is required';
    if (isNaN(priceNum) || priceNum <= 0) e.price = 'Enter a valid selling price';
    if (compare && compareNum < priceNum) e.compare = 'Compare-at price should be higher than selling price';
    const s = parseInt(stock, 10);
    if (isNaN(s) || s < 0) e.stock = 'Enter a valid stock quantity';
    if (!storeId) e.store = 'Choose a store for this stock';
    if (images.length === 0) e.images = 'Upload at least one photo';
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
      name: name.trim(),
      material,
      diameter,
      style,
      color,
      drainageHole: drainage,
      weightKg: parseFloat(weight) || undefined,
      suitableFor,
      sku: sku.trim() || generateGamlaSku(name, material, diameter),
      pricePaise: Math.round(priceNum * 100),
      comparePricePaise: compare ? Math.round(compareNum * 100) : Math.round(priceNum * 100),
      stock: parseInt(stock, 10) || 0,
      lowStockThreshold: parseInt(threshold, 10) || 10,
      image: images[0],
      images,
      status: active ? 'active' : 'draft',
      shortDescription: shortDescription.trim(),
      description: description.trim(),
    }, storeId);
  };

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
        <div className="space-y-6">
          <Card title="Photos" subtitle="Show the gamla from multiple angles. The first photo is the cover.">
            <ImageUploader images={images} onChange={setImages} error={errors.images} />
          </Card>

          <Card title="Basic information">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Gamla / pot name" required error={errors.name} className="sm:col-span-2">
                <input className={`input ${errors.name ? 'input-error' : ''}`} placeholder="e.g. Handcrafted Terracotta Gamla" value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Material">
                <select className="input" value={material} onChange={(e) => setMaterial(e.target.value)}>{GAMLA_MATERIALS.map((m) => <option key={m}>{m}</option>)}</select>
              </Field>
              <Field label="Style">
                <select className="input" value={style} onChange={(e) => setStyle(e.target.value)}>{GAMLA_STYLES.map((m) => <option key={m}>{m}</option>)}</select>
              </Field>
              <Field label="Diameter / size">
                <select className="input" value={diameter} onChange={(e) => setDiameter(e.target.value)}>{GAMLA_SIZES.map((m) => <option key={m}>{m}</option>)}</select>
              </Field>
              <Field label="Weight (kg)">
                <input type="number" min="0" step="0.1" className="input" placeholder="1.2" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </Field>
              <Field label="Colour" className="sm:col-span-2">
                <div className="flex flex-wrap gap-2.5">
                  {COLORS.map((c) => (
                    <button type="button" key={c.name} onClick={() => setColor(c.name)} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${color === c.name ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/15' : 'border-line hover:border-ink-300'}`}>
                      <span className="h-4 w-4 rounded-full border border-black/10" style={{ background: c.hex }} />
                      {c.name}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Best suited for">
                <select className="input" value={suitableFor} onChange={(e) => setSuitableFor(e.target.value)}>{PLACEMENT_OPTIONS.map((m) => <option key={m}>{m}</option>)}</select>
              </Field>
              <Field label="SKU" hint="Leave blank to auto-generate">
                <input className="input font-mono text-xs" placeholder="GW-POT-TERR-HAN-10" value={sku} onChange={(e) => setSku(e.target.value)} />
              </Field>
              <div className="sm:col-span-2">
                <Toggle checked={drainage} onChange={setDrainage} label="Has drainage hole" desc="Prevents root rot — recommended for most plants" />
              </div>
            </div>
          </Card>

          <Card title="Pricing & inventory">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Selling price (₹)" required error={errors.price}>
                <input type="number" min="0" className={`input ${errors.price ? 'input-error' : ''}`} placeholder="349" value={price} onChange={(e) => setPrice(e.target.value)} />
              </Field>
              <Field label="Compare-at price (₹)" error={errors.compare} hint={discount ? `Shows ${discount}% off` : 'Optional strike-through price'}>
                <input type="number" min="0" className={`input ${errors.compare ? 'input-error' : ''}`} placeholder="449" value={compare} onChange={(e) => setCompare(e.target.value)} />
              </Field>
              <Field label="Store / location" required error={errors.store} hint="Where this stock is held">
                <select className="input" value={storeId} onChange={(e) => setStoreId(e.target.value)}>
                  {stores.map((st) => <option key={st.id} value={st.id}>{st.name}</option>)}
                </select>
              </Field>
              <Field label="Stock quantity" required error={errors.stock}>
                <input type="number" min="0" className={`input ${errors.stock ? 'input-error' : ''}`} value={stock} onChange={(e) => setStock(e.target.value)} />
              </Field>
              <Field label="Low-stock alert at">
                <input type="number" min="0" className="input" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
              </Field>
            </div>
          </Card>

          <Card title="Description">
            <div className="space-y-5">
              <Field label="Short description" hint={`${shortDescription.length}/160 characters`}>
                <textarea rows={2} maxLength={160} className="input" placeholder="One or two lines shown on listing cards" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
              </Field>
              <Field label="Detailed description">
                <textarea rows={5} className="input" placeholder="Craftsmanship, finish, care and usage tips…" value={description} onChange={(e) => setDescription(e.target.value)} />
              </Field>
            </div>
          </Card>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-[92px] xl:self-start">
          <Card title="Publish">
            <div className="space-y-4">
              <Toggle checked={active} onChange={setActive} label="Active on storefront" desc={active ? 'Visible to customers' : 'Saved as draft'} />
              <button type="submit" disabled={saving} className="btn btn-primary w-full !h-11"><Save className="h-4 w-4" />{saving ? 'Saving…' : initial ? 'Save changes' : 'Publish gamla'}</button>
              <Link href="/gamlas" className="btn btn-secondary w-full">Cancel</Link>
            </div>
          </Card>

          <Card title="Live preview" subtitle="How the card appears in your store">
            <div className="overflow-hidden rounded-2xl border border-line">
              <div className="relative aspect-[4/3] bg-gold-50">
                {images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={images[0]} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-gold-300"><Container className="h-10 w-10" /></div>
                )}
                {discount && <span className="absolute left-3 top-3 rounded-full bg-gold-400 px-2.5 py-1 text-[11px] font-bold text-brand-950">{discount}% OFF</span>}
              </div>
              <div className="p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gold-600">{material.split(' / ')[0]}</p>
                <h4 className="mt-1 font-heading text-base font-semibold leading-snug">{name || 'Gamla name'}</h4>
                <p className="mt-1 text-xs text-ink-500">{diameter} · {style}</p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-lg font-bold">{!isNaN(priceNum) && priceNum > 0 ? formatPaise(Math.round(priceNum * 100)) : '₹0'}</span>
                  {discount && <span className="text-xs text-ink-400 line-through">{formatPaise(Math.round(compareNum * 100))}</span>}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="chip border-line bg-canvas text-ink-600"><span className="h-2.5 w-2.5 rounded-full border border-black/10" style={{ background: colorHex }} />{color}</span>
                  {drainage && <span className="chip border-sky-200 bg-sky-50 text-sky-700"><Droplet className="h-3 w-3" />Drainage</span>}
                </div>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </form>
  );
}
