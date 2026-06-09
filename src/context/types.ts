import { User } from '@supabase/supabase-js';

export interface Category {
  id: string;
  name: string;
  display_order?: number;
}

export type UserRole = 'admin' | 'user';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  pix_key?: string;
  pix_name?: string;
  pix_city?: string;
  expo_push_token?: string;
  notifications_enabled?: boolean;
  low_stock_notifications?: boolean;
  sales_notifications?: boolean;
  allow_fiado?: boolean;
}

export interface Variation {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  category_id?: string;
  category?: string; // For display/legacy compatibility
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  outOfStock?: boolean;
  has_variations: boolean;
  variations?: Variation[];
}

export interface SaleItem {
  id: string;
  product_id: string;
  variation_id?: string;
  quantity: number;
  unit_price: number;
  product?: {
    name: string;
    categories?: {
      name: string;
    } | null;
  } | null;
  variation?: {
    name: string;
  } | null;
}

export type SaleStatus = 'paid' | 'pending';

export interface Sale {
  id: string;
  total: number;
  created_at: string;
  user_id?: string;
  status: SaleStatus;
  customer_name?: string;
  seller?: {
    email: string;
    pix_name?: string;
  } | null;
  sale_items?: SaleItem[];
}

export interface AppContextType {
  products: Product[];
  sales: Sale[];
  loading: boolean;
  initialLoading: boolean;
  categories: Category[];
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  addProduct: (
    product: Omit<Product, 'id' | 'outOfStock' | 'category'>
  ) => Promise<void>;
  updateStock: (productId: string, delta: number) => Promise<void>;
  resetStock: (productId: string) => Promise<void>;
  addStock: (productId: string, amount: number) => Promise<void>;
  updateProduct: (
    productId: string,
    updates: Partial<Omit<Product, 'id' | 'outOfStock'>>
  ) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addSale: (
    items: {
      product_id: string;
      variation_id?: string;
      quantity: number;
      unit_price: number;
    }[],
    total: number,
    userId?: string,
    status?: SaleStatus,
    customerName?: string
  ) => Promise<void>;
  confirmPayment: (saleId: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (newCategories: Category[]) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  fetchSalesByUser: (userId: string) => Promise<Sale[]>;
  fetchAllProfiles: () => Promise<Profile[]>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  updateUserFiado: (userId: string, allowFiado: boolean) => Promise<void>;
  refreshData: () => Promise<void>;
  colorScheme: 'light' | 'dark';
  toggleColorScheme: () => void;
}

// Types for Supabase DB
export interface DBVariation {
  id: string;
  product_id: string;
  name: string;
  price: number;
  stock: number;
}

export interface DBProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string;
  category_id: string | null;
  categories?: { name: string } | null;
  product_variations?: DBVariation[];
}
