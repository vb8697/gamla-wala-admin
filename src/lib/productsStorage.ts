import { formatPaise } from '@/types/database';

export type PlantStockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Draft';

export interface AdminProduct {
  id: string;
  name: string;
  slug?: string;
  category: string;
  sku: string;
  pricePaise: number;
  comparePricePaise?: number;
  stock: number;
  status: 'active' | 'draft' | 'archived' | 'in_stock' | 'low_stock' | 'out_of_stock';
  stockStatus?: PlantStockStatus;
  image: string; // Primary image
  images?: string[]; // Multiple photos
  shortDescription?: string;
  description?: string; // Detailed description
  careInstructions?: string; // Care instructions (watering, sunlight, etc.)
  scientificName?: string;
  plantSize?: string;
  placement?: string;
  sunlight?: string;
  watering?: string;
  maintenance?: string;
  petFriendly?: boolean;
  airPurifying?: boolean;
  vastuAuspicious?: boolean;
  flowering?: boolean;
  soilTip?: string;
  pot?: string;
  costPricePaise?: number;
  lowStockThreshold?: number;
  createdAt: string;
  categoryId?: string;
  variantId?: string;
  storeId?: string;
}

export interface GamlaPotProduct {
  id: string;
  name: string;
  material: string;
  diameter: string;
  color: string;
  drainageHole: boolean;
  sku: string;
  pricePaise: number;
  comparePricePaise: number;
  stock: number;
  image: string;
  images?: string[];
  status: 'active' | 'draft' | 'archived';
  shortDescription?: string;
  description?: string;
  style?: string;
  weightKg?: number;
  suitableFor?: string;
  lowStockThreshold?: number;
  createdAt: string;
  categoryId?: string;
  variantId?: string;
  storeId?: string;
}

export const GAMLA_MATERIALS = [
  'Terracotta / Natural Clay',
  'Glazed Ceramic',
  'Cement / Concrete',
  'Fibre / Resin',
  'Metal / Iron',
  'Plastic / Recycled',
  'Wood / Bamboo',
] as const;

export const GAMLA_SIZES = [
  '4-inch (Mini)',
  '6-inch (Small)',
  '8-inch (Standard)',
  '10-inch (Large)',
  '12-inch (XL)',
  '14-inch+ (Statement)',
] as const;

export const GAMLA_STYLES = ['Classic Round', 'Modern Cylinder', 'Hanging Planter', 'Self-watering', 'Tray / Saucer Set', 'Designer / Artisan'] as const;

export const BOTANICAL_CATEGORIES = [
  'Indoor',
  'Outdoor',
  'Air Purifying',
  'Flowering',
  'Succulents & Cacti',
  'Medicinal & Herbs',
  'Bonsai & Exotics',
] as const;

export const PLANT_SIZES = [
  'Tabletop Mini (4 - 6 in)',
  'Small Nursery (6 - 10 in)',
  'Medium Foliage (1 - 2 ft)',
  'Large Statement (2.5 - 4 ft)',
  'Floor Specimen Tree (4+ ft)',
] as const;

export const SUNLIGHT_OPTIONS = [
  { id: 'bright_indirect', label: 'Bright Indirect Light', desc: 'No direct harsh rays, well-lit indoor room' },
  { id: 'direct_sun', label: 'Direct Sunlight (4-6 hrs)', desc: 'Sunny balcony, terrace or open garden' },
  { id: 'morning_sun', label: 'Morning Sun (2-3 hrs)', desc: 'Gentle sunrise light, shaded afternoon' },
  { id: 'low_light', label: 'Low Light Tolerant', desc: 'Can adapt to shady rooms or fluorescent offices' },
  { id: 'filtered_dappled', label: 'Filtered / Dappled Light', desc: 'Partial shade under canopy or sheer curtains' },
] as const;

export const WATERING_OPTIONS = [
  { id: 'weekly', label: 'Once a Week', desc: 'When top 2 inches of soil feel dry to touch' },
  { id: 'alternate', label: 'Alternate Days', desc: 'Keep soil evenly hydrated in warm weather' },
  { id: 'daily', label: 'Daily (Morning)', desc: 'Outdoor herbs, flowering plants, and direct sun' },
  { id: 'biweekly', label: 'Every 2-3 Weeks', desc: 'Drought-tolerant succulents, cacti, and ZZ plants' },
  { id: 'mist_moist', label: 'Keep Moist + Mist', desc: 'Tropical foliage loving high atmospheric humidity' },
] as const;

export const MAINTENANCE_OPTIONS = [
  { id: 'very_low', label: 'Very Low (Hardy Beginner)', badge: 'Hard to kill' },
  { id: 'low', label: 'Low (Forgiving)', badge: 'Easy care' },
  { id: 'moderate', label: 'Moderate Care', badge: 'Standard care' },
  { id: 'high', label: 'Collector Care', badge: 'Delicate routine' },
] as const;

export const PLACEMENT_OPTIONS = [
  'Living Room Corner',
  'Balcony & Terrace',
  'Bedroom & Nightstand',
  'Office Desk & Study',
  'Window Sill',
  'Garden Bed & Patio',
  'Bathroom / High Humidity',
] as const;

export interface BotanicalPreset {
  name: string;
  scientificName: string;
  category: string;
  plantSize: string;
  sunlight: string;
  watering: string;
  maintenance: string;
  petFriendly: boolean;
  airPurifying: boolean;
  vastuAuspicious: boolean;
  flowering: boolean;
  placement: string;
  suggestedPriceInr: number;
  suggestedCompareInr: number;
  url: string;
  description: string;
  soilTip: string;
}

export const BOTANICAL_PRESETS: BotanicalPreset[] = [
  {
    name: 'Monstera Deliciosa (Swiss Cheese)',
    scientificName: 'Monstera deliciosa',
    category: 'Indoor',
    plantSize: 'Large Statement (2.5 - 4 ft)',
    sunlight: 'Bright Indirect Light',
    watering: 'Once a Week',
    maintenance: 'Moderate Care',
    petFriendly: false,
    airPurifying: true,
    vastuAuspicious: false,
    flowering: false,
    placement: 'Living Room Corner',
    suggestedPriceInr: 899,
    suggestedCompareInr: 1199,
    url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
    description: 'Iconic tropical statement plant with fenestrated leaves.',
    soilTip: 'Chunky aroid mix with coco chips and perlite.',
  },
  {
    name: 'Snake Plant Laurentii',
    scientificName: 'Dracaena trifasciata',
    category: 'Air Purifying',
    plantSize: 'Medium Foliage (1 - 2 ft)',
    sunlight: 'Low Light Tolerant',
    watering: 'Every 2-3 Weeks',
    maintenance: 'Very Low (Hardy Beginner)',
    petFriendly: false,
    airPurifying: true,
    vastuAuspicious: true,
    flowering: false,
    placement: 'Bedroom & Nightstand',
    suggestedPriceInr: 549,
    suggestedCompareInr: 699,
    url: 'https://images.unsplash.com/photo-1599598425947-630b91e988cf?auto=format&fit=crop&w=800&q=80',
    description: 'Releases oxygen at night and cleans air.',
    soilTip: 'Fast draining gritty sand mix.',
  },
  {
    name: 'Money Plant Pothos',
    scientificName: 'Epipremnum aureum',
    category: 'Indoor',
    plantSize: 'Medium Foliage (1 - 2 ft)',
    sunlight: 'Bright Indirect Light',
    watering: 'Once a Week',
    maintenance: 'Very Low (Hardy Beginner)',
    petFriendly: false,
    airPurifying: true,
    vastuAuspicious: true,
    flowering: false,
    placement: 'Living Room Corner',
    suggestedPriceInr: 199,
    suggestedCompareInr: 299,
    url: 'https://images.unsplash.com/photo-1596724803273-04ef9647e307?auto=format&fit=crop&w=800&q=80',
    description: 'Fast growing trailing vine.',
    soilTip: 'Well aerated potting soil.',
  },
];

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function computeStockStatus(stock: number): PlantStockStatus {
  if (stock <= 0) return 'Out of Stock';
  if (stock <= 10) return 'Low Stock';
  return 'In Stock';
}

export function generateSuggestedSku(name: string, category: string): string {
  const clean = name.replace(/[^a-zA-Z0-9 ]/g, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  const initials = words.slice(0, 3).map((w) => w.substring(0, 3).toUpperCase()).join('-');
  const num = Math.floor(100 + Math.random() * 900);
  return `GW-PLN-${initials || 'PLN'}-${num}`;
}

export function generateGamlaSku(name: string, material: string, diameter: string): string {
  const n = name.replace(/[^a-zA-Z0-9 ]/g, '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w.substring(0, 3).toUpperCase()).join('-');
  const m = material.substring(0, 4).replace(/[^a-zA-Z]/g, '').toUpperCase();
  const d = (diameter.match(/\d+/) || ['00'])[0].padStart(2, '0');
  return `GW-POT-${m || 'POT'}-${n || 'GML'}-${d}`;
}
