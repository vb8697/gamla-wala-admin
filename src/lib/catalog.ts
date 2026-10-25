import { createClient } from '@/utils/supabase/client';
import {
  AdminProduct,
  GamlaPotProduct,
  computeStockStatus,
  slugify,
} from '@/lib/productsStorage';

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
}
export interface DbStore {
  id: string;
  name: string;
  code: string;
  city: string | null;
  is_active: boolean;
}

export const POTS_CATEGORY_SLUG = 'pots-planters';
const BUCKET = 'product-images';

const sb = () => createClient();
const check = <T,>(r: { data: T | null; error: any }): T => {
  if (r.error) throw r.error;
  return r.data as T;
};

/* ───────── Categories & stores ───────── */

export async function fetchCategories(): Promise<DbCategory[]> {
  return check(await sb().from('categories').select('*').order('sort_order'));
}

export async function fetchStores(): Promise<DbStore[]> {
  return check(await sb().from('stores').select('id,name,code,city,is_active').order('created_at'));
}

/* ───────── Row mapping ───────── */

const PRODUCT_SELECT =
  '*, categories(id,name,slug), product_variants(*, inventory(store_id, quantity_on_hand)), product_images(storage_path, sort_order, is_primary)';

function sortedImages(row: any): string[] {
  return [...(row.product_images ?? [])]
    .sort((a: any, b: any) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.sort_order - b.sort_order)
    .map((i: any) => i.storage_path);
}

function primaryVariant(row: any) {
  return [...(row.product_variants ?? [])].sort((a: any, b: any) => a.created_at.localeCompare(b.created_at))[0];
}

function totalStock(row: any): number {
  return (row.product_variants ?? []).reduce(
    (a: number, v: any) => a + (v.inventory ?? []).reduce((b: number, i: any) => b + (i.quantity_on_hand ?? 0), 0),
    0
  );
}

function storeOf(v: any): string | undefined {
  return v?.inventory?.[0]?.store_id;
}

export function rowToPlant(row: any): AdminProduct {
  const v = primaryVariant(row);
  const c = row.care_instructions ?? {};
  const stock = totalStock(row);
  const images = sortedImages(row);
  const draft = row.status === 'draft';
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.categories?.name ?? 'Uncategorised',
    categoryId: row.category_id ?? undefined,
    variantId: v?.id,
    storeId: storeOf(v),
    sku: v?.sku ?? '',
    pricePaise: v?.price_paise ?? 0,
    comparePricePaise: v?.compare_at_price_paise ?? undefined,
    costPricePaise: c.costPricePaise,
    stock,
    lowStockThreshold: c.lowStockThreshold,
    status: draft ? 'draft' : row.status,
    stockStatus: draft ? 'Draft' : computeStockStatus(stock),
    image: images[0] ?? '',
    images,
    shortDescription: c.shortDescription,
    description: row.description ?? '',
    careInstructions: c.careText,
    scientificName: row.botanical_name ?? undefined,
    plantSize: c.plantSize,
    placement: c.placement,
    sunlight: c.sunlight,
    watering: c.watering,
    maintenance: c.maintenance,
    petFriendly: c.petFriendly,
    airPurifying: c.airPurifying,
    vastuAuspicious: c.vastuAuspicious,
    flowering: c.flowering,
    soilTip: c.soilTip,
    pot: c.pot,
    createdAt: row.created_at,
  };
}

export function rowToGamla(row: any): GamlaPotProduct {
  const v = primaryVariant(row);
  const c = row.care_instructions ?? {};
  const images = sortedImages(row);
  return {
    id: row.id,
    categoryId: row.category_id ?? undefined,
    variantId: v?.id,
    storeId: storeOf(v),
    name: row.name,
    material: c.material ?? row.botanical_name ?? '',
    diameter: v?.pot_size ?? '',
    color: c.color ?? '',
    style: c.style,
    drainageHole: c.drainage !== false,
    weightKg: v?.weight_grams ? v.weight_grams / 1000 : undefined,
    suitableFor: c.suitableFor,
    sku: v?.sku ?? '',
    pricePaise: v?.price_paise ?? 0,
    comparePricePaise: v?.compare_at_price_paise ?? v?.price_paise ?? 0,
    stock: totalStock(row),
    lowStockThreshold: c.lowStockThreshold,
    image: images[0] ?? '',
    images,
    status: row.status === 'draft' ? 'draft' : row.status === 'archived' ? 'archived' : 'active',
    shortDescription: c.shortDescription,
    description: row.description ?? '',
    createdAt: row.created_at,
  };
}

/* ───────── Reads ───────── */

async function fetchCatalog(pots: boolean) {
  const cats = await fetchCategories();
  const potsCat = cats.find((c) => c.slug === POTS_CATEGORY_SLUG);
  let q = sb().from('products').select(PRODUCT_SELECT).order('created_at', { ascending: false });
  if (potsCat) q = pots ? q.eq('category_id', potsCat.id) : q.neq('category_id', potsCat.id);
  else if (pots) return [];
  return check(await q) as any[];
}

export const fetchPlants = async () => (await fetchCatalog(false)).map(rowToPlant);
export const fetchGamlas = async () => (await fetchCatalog(true)).map(rowToGamla);

async function fetchOne(id: string) {
  return check(await sb().from('products').select(PRODUCT_SELECT).eq('id', id).maybeSingle()) as any;
}
export async function fetchPlant(id: string) {
  const r = await fetchOne(id);
  return r ? rowToPlant(r) : null;
}
export async function fetchGamla(id: string) {
  const r = await fetchOne(id);
  return r ? rowToGamla(r) : null;
}

/* ───────── Image upload ───────── */

export async function resolveImages(images: string[]): Promise<string[]> {
  const out: string[] = [];
  for (const src of images) {
    if (!src.startsWith('data:')) {
      out.push(src);
      continue;
    }
    const blob = await (await fetch(src)).blob();
    const ext = blob.type.split('/')[1] || 'jpg';
    const path = `${new Date().getFullYear()}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await sb().storage.from(BUCKET).upload(path, blob, { contentType: blob.type, cacheControl: '31536000' });
    if (error) {
      if (/bucket not found/i.test(error.message)) {
        throw new Error(`Storage bucket “${BUCKET}” does not exist yet. Run supabase/admin-setup.sql in the Supabase SQL editor, or add images by URL.`);
      }
      throw error;
    }
    out.push(sb().storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
  }
  return out;
}

/* ───────── Writes (shared) ───────── */

interface SaveInput {
  categoryId: string;
  name: string;
  slug: string;
  botanicalName?: string | null;
  description: string;
  careInstructions: Record<string, unknown>;
  tags: string[];
  status: 'active' | 'draft' | 'archived';
  variant: {
    sku: string;
    variant_name: string;
    price_paise: number;
    compare_at_price_paise: number | null;
    weight_grams: number | null;
    pot_size: string | null;
  };
  stock: number;
  storeId: string;
  images: string[];
}

async function setInventory(variantId: string, storeId: string, quantity: number) {
  const { data, error } = await sb().from('inventory').select('variant_id').eq('variant_id', variantId).eq('store_id', storeId).limit(1);
  if (error) throw error;
  if (data && data.length > 0) {
    check(await sb().from('inventory').update({ quantity_on_hand: quantity }).eq('variant_id', variantId).eq('store_id', storeId));
  } else {
    check(await sb().from('inventory').insert({ variant_id: variantId, store_id: storeId, quantity_on_hand: quantity }));
  }
}

export async function adjustInventory(variantId: string, storeId: string, quantity: number) {
  await setInventory(variantId, storeId, Math.max(0, quantity));
}

async function replaceImages(productId: string, images: string[], alt: string) {
  check(await sb().from('product_images').delete().eq('product_id', productId));
  if (images.length === 0) return;
  check(
    await sb().from('product_images').insert(
      images.map((storage_path, i) => ({ product_id: productId, storage_path, alt_text: alt, sort_order: i + 1, is_primary: i === 0 }))
    )
  );
}

async function createProduct(input: SaveInput): Promise<string> {
  const images = await resolveImages(input.images);
  let slug = input.slug || slugify(input.name);
  let productId: string | null = null;
  for (let attempt = 0; attempt < 3 && !productId; attempt++) {
    const { data, error } = await sb()
      .from('products')
      .insert({
        category_id: input.categoryId,
        name: input.name,
        slug,
        botanical_name: input.botanicalName ?? null,
        description: input.description,
        care_instructions: input.careInstructions,
        tags: input.tags,
        status: input.status,
      })
      .select('id')
      .single();
    if (error) {
      if (error.code === '23505' && /slug/i.test(error.message + (error.details ?? ''))) {
        slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
        continue;
      }
      throw error;
    }
    productId = data.id;
  }
  if (!productId) throw new Error('Could not generate a unique URL slug.');

  try {
    const variant = check(await sb().from('product_variants').insert({ product_id: productId, is_active: true, ...input.variant }).select('id').single()) as any;
    await setInventory(variant.id, input.storeId, input.stock);
    await replaceImages(productId, images, input.name);
  } catch (e) {
    await sb().from('products').delete().eq('id', productId); // roll back partial create
    throw e;
  }
  return productId;
}

async function updateProduct(id: string, variantId: string | undefined, input: SaveInput) {
  const images = await resolveImages(input.images);
  check(
    await sb().from('products').update({
      category_id: input.categoryId,
      name: input.name,
      slug: input.slug,
      botanical_name: input.botanicalName ?? null,
      description: input.description,
      care_instructions: input.careInstructions,
      tags: input.tags,
      status: input.status,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
  );
  let vid = variantId;
  if (vid) {
    check(await sb().from('product_variants').update({ ...input.variant, updated_at: new Date().toISOString() }).eq('id', vid));
  } else {
    vid = (check(await sb().from('product_variants').insert({ product_id: id, is_active: true, ...input.variant }).select('id').single()) as any).id;
  }
  await setInventory(vid!, input.storeId, input.stock);
  await replaceImages(id, images, input.name);
}

export async function deleteProducts(ids: string[]) {
  check(await sb().from('products').delete().in('id', ids));
}

/* ───────── Plants ───────── */

function plantInput(p: Omit<AdminProduct, 'id' | 'createdAt'>, storeId: string): SaveInput {
  return {
    categoryId: p.categoryId!,
    name: p.name,
    slug: p.slug || slugify(p.name),
    botanicalName: p.scientificName ?? null,
    description: p.description ?? '',
    careInstructions: {
      sunlight: p.sunlight,
      watering: p.watering,
      maintenance: p.maintenance,
      petFriendly: !!p.petFriendly,
      airPurifying: !!p.airPurifying,
      vastuAuspicious: !!p.vastuAuspicious,
      flowering: !!p.flowering,
      plantSize: p.plantSize,
      placement: p.placement,
      soilTip: p.soilTip,
      pot: p.pot,
      careText: p.careInstructions,
      shortDescription: p.shortDescription,
      lowStockThreshold: p.lowStockThreshold,
      costPricePaise: p.costPricePaise,
    },
    tags: [
      ...(p.petFriendly ? ['pet-friendly'] : []),
      ...(p.airPurifying ? ['air-purifying'] : []),
      ...(p.vastuAuspicious ? ['auspicious'] : []),
      ...(p.flowering ? ['flowering'] : []),
    ],
    status: p.stockStatus === 'Draft' ? 'draft' : 'active',
    variant: {
      sku: p.sku,
      variant_name: p.pot || 'Standard',
      price_paise: p.pricePaise,
      compare_at_price_paise: p.comparePricePaise ?? null,
      weight_grams: null,
      pot_size: p.plantSize ?? null,
    },
    stock: p.stock,
    storeId,
    images: p.images ?? [],
  };
}

export const createPlant = (p: Omit<AdminProduct, 'id' | 'createdAt'>, storeId: string) => createProduct(plantInput(p, storeId));
export const updatePlant = (cur: AdminProduct, p: Omit<AdminProduct, 'id' | 'createdAt'>, storeId: string) =>
  updateProduct(cur.id, cur.variantId, plantInput(p, storeId));

/* ───────── Gamlas ───────── */

async function potsCategoryId() {
  const c = (await fetchCategories()).find((x) => x.slug === POTS_CATEGORY_SLUG);
  if (!c) throw new Error('The “Pots & Planters” category is missing in your database.');
  return c.id;
}

function gamlaInput(g: Omit<GamlaPotProduct, 'id' | 'createdAt'>, storeId: string, categoryId: string, slug: string): SaveInput {
  return {
    categoryId,
    name: g.name,
    slug,
    botanicalName: g.material,
    description: g.description ?? '',
    careInstructions: {
      material: g.material,
      color: g.color,
      style: g.style,
      drainage: g.drainageHole,
      suitableFor: g.suitableFor,
      shortDescription: g.shortDescription,
      lowStockThreshold: g.lowStockThreshold,
    },
    tags: ['pots', ...(g.drainageHole ? ['drainage'] : []), slugify(g.material.split(' / ')[0])],
    status: g.status,
    variant: {
      sku: g.sku,
      variant_name: [g.color, g.material.split(' / ')[0]].filter(Boolean).join(' · '),
      price_paise: g.pricePaise,
      compare_at_price_paise: g.comparePricePaise > g.pricePaise ? g.comparePricePaise : null,
      weight_grams: g.weightKg ? Math.round(g.weightKg * 1000) : null,
      pot_size: g.diameter,
    },
    stock: g.stock,
    storeId,
    images: g.images ?? [],
  };
}

export async function createGamla(g: Omit<GamlaPotProduct, 'id' | 'createdAt'>, storeId: string) {
  return createProduct(gamlaInput(g, storeId, await potsCategoryId(), slugify(g.name)));
}
export async function updateGamla(cur: GamlaPotProduct, g: Omit<GamlaPotProduct, 'id' | 'createdAt'>, storeId: string) {
  const row = await fetchOne(cur.id);
  return updateProduct(cur.id, cur.variantId, gamlaInput(g, storeId, await potsCategoryId(), row?.slug ?? slugify(g.name)));
}

/* ───────── Inventory view ───────── */

export interface InventoryRow {
  variantId: string;
  productId: string;
  kind: 'Plant' | 'Gamla';
  name: string;
  variantName: string;
  sku: string;
  image: string;
  pricePaise: number;
  quantity: number; // for the selected store
}

export async function fetchInventory(storeId: string): Promise<InventoryRow[]> {
  const cats = await fetchCategories();
  const potsId = cats.find((c) => c.slug === POTS_CATEGORY_SLUG)?.id;
  const rows = check(await sb().from('products').select(PRODUCT_SELECT).order('name')) as any[];
  return rows.flatMap((p) =>
    (p.product_variants ?? []).map((v: any) => ({
      variantId: v.id,
      productId: p.id,
      kind: p.category_id === potsId ? ('Gamla' as const) : ('Plant' as const),
      name: p.name,
      variantName: v.variant_name,
      sku: v.sku,
      image: sortedImages(p)[0] ?? '',
      pricePaise: v.price_paise,
      quantity: (v.inventory ?? []).find((i: any) => i.store_id === storeId)?.quantity_on_hand ?? 0,
    }))
  );
}

/* ───────── Coupons ───────── */

export interface DbCoupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_cart_paise: number | null;
  max_discount_paise: number | null;
  usage_limit: number | null;
  times_used: number;
  is_active: boolean;
  valid_until: string | null;
}
export async function fetchCoupons(): Promise<DbCoupon[]> {
  return check(await sb().from('coupons').select('*').order('created_at', { ascending: false }));
}
export async function createCoupon(c: Partial<DbCoupon>) {
  check(await sb().from('coupons').insert(c));
}
export async function setCouponActive(id: string, is_active: boolean) {
  check(await sb().from('coupons').update({ is_active }).eq('id', id));
}
export async function deleteCoupon(id: string) {
  check(await sb().from('coupons').delete().eq('id', id));
}

/* ───────── Orders, customers, reviews ───────── */

export async function fetchOrders() {
  const orders = check(await sb().from('orders').select('*, order_items(*)').order('created_at', { ascending: false })) as any[];
  const ids = Array.from(new Set(orders.map((o) => o.user_id).filter(Boolean)));
  const profiles = ids.length ? (check(await sb().from('profiles').select('id,full_name,email,phone').in('id', ids)) as any[]) : [];
  const byId = new Map(profiles.map((p) => [p.id, p]));
  return orders.map((o) => ({ ...o, profile: byId.get(o.user_id) ?? null }));
}
export async function setOrderStatus(id: string, status: string) {
  check(await sb().from('orders').update({ status }).eq('id', id));
}

export async function fetchCustomers() {
  const profiles = check(await sb().from('profiles').select('*').order('created_at', { ascending: false })) as any[];
  const orders = check(await sb().from('orders').select('user_id,total_paise,status')) as any[];
  return profiles.map((p) => {
    const mine = orders.filter((o) => o.user_id === p.id && o.status !== 'cancelled');
    return { ...p, orders: mine.length, spentPaise: mine.reduce((a, o) => a + (o.total_paise ?? 0), 0) };
  });
}

export async function fetchReviews() {
  const rows = check(await sb().from('reviews').select('*, products(name)').order('created_at', { ascending: false })) as any[];
  const ids = Array.from(new Set(rows.map((r) => r.user_id).filter(Boolean)));
  const profiles = ids.length ? (check(await sb().from('profiles').select('id,full_name').in('id', ids)) as any[]) : [];
  const byId = new Map(profiles.map((p) => [p.id, p.full_name]));
  return rows.map((r) => ({ ...r, userName: byId.get(r.user_id) ?? 'Customer' }));
}
export async function deleteReview(id: string) {
  check(await sb().from('reviews').delete().eq('id', id));
}

export async function fetchIsAdmin(): Promise<'admin' | 'staff' | 'none' | 'anon'> {
  const { data } = await sb().auth.getUser();
  if (!data.user) return 'anon';
  const a = await sb().rpc('is_admin');
  if (a.data === true) return 'admin';
  const s = await sb().rpc('is_staff');
  return s.data === true ? 'staff' : 'none';
}
