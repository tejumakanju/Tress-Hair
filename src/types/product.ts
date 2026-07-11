export type ProductBadge = "new" | "sale" | "bestseller" | "trending";

export type ProductSpecs = {
  hairType: string;
  hairOrigin: string;
  texture: string;
  material: string;
  brand: string;
  laceType?: string;
  laceSize?: string;
  capConstruction?: string;
  bleachedKnots?: boolean;
  prePlucked?: boolean;
  glueless: boolean;
  beginnerFriendly: boolean;
  readyToWear: boolean;
  babyHair?: boolean;
  elasticBand?: boolean;
  adjustableStrap?: boolean;
  processingTime: string;
};

export type ProductVariant = {
  id: string;
  length: string;
  density: string;
  color: string;
  capSize?: string;
  laceColor?: string;
  price: number;
  sku: string;
  inStock: boolean;
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  verified: boolean;
  helpful: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  hoverImage?: string;
  images: string[];
  videoUrl?: string;
  category: string;
  subcategory?: string;
  badge?: ProductBadge;
  rating: number;
  reviewCount: number;
  sku: string;
  description: string;
  inStock: boolean;
  specs: ProductSpecs;
  variants: ProductVariant[];
  lengths: string[];
  densities: string[];
  colors: string[];
  capSizes: string[];
  laceColors: string[];
  careInstructions: string;
  returnPolicy: string;
  reviews: Review[];
  relatedSlugs: string[];
  createdAt: string;
  salesCount: number;
  popularity: number;
};

export type CartItem = {
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  length: string;
  density: string;
  color: string;
  capSize?: string;
  sku: string;
};

export type SortOption =
  | "featured"
  | "newest"
  | "best-selling"
  | "highest-rated"
  | "lowest-price"
  | "highest-price"
  | "most-popular"
  | "trending";

export type ShopFilters = {
  priceMin?: number;
  priceMax?: number;
  hairType?: string[];
  hairOrigin?: string[];
  texture?: string[];
  length?: string[];
  density?: string[];
  capSize?: string[];
  laceType?: string[];
  laceColor?: string[];
  color?: string[];
  availability?: "in-stock" | "out-of-stock";
  brand?: string[];
  rating?: number;
  material?: string[];
  beginnerFriendly?: boolean;
  glueless?: boolean;
  readyToWear?: boolean;
  category?: string;
  subcategory?: string;
  query?: string;
};

export type Order = {
  id: string;
  date: string;
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  shipping: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    method: string;
  };
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  notes?: string;
  /** Fulfillment — set in admin when dispatching */
  courier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
};
