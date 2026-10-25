export type AppRole = 'customer' | 'staff' | 'admin';
export type ProductStatus = 'draft' | 'active' | 'archived';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  variant_name: string;
  price_paise: number;
  compare_at_price_paise: number | null;
  weight_grams: number | null;
  is_active: boolean;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
}

export interface CareInstructions {
  sunlight?: string;
  watering?: string;
  maintenance?: string;
  petFriendly?: boolean;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  care_instructions: CareInstructions;
  status: ProductStatus;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  categories?: {
    name: string;
    slug: string;
  } | null;
  product_variants?: ProductVariant[];
  product_images?: ProductImage[];
}

export interface Store {
  id: string;
  name: string;
  code: string;
  address: {
    line1?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    phone?: string;
  };
  is_active: boolean;
}

export function formatPaise(paise: number, showDecimals = false): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rupees);
}
