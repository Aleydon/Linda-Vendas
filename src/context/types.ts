export interface Category {
  id: string;
  name: string;
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
}

export interface SaleItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: {
    name: string;
    categories?: {
      name: string;
    } | null;
  } | null;
}

export interface Sale {
  id: string;
  total: number;
  created_at: string;
  sale_items?: SaleItem[];
}

export interface AppContextType {
  products: Product[];
  sales: Sale[];
  loading: boolean;
  categories: Category[];
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
    items: { product_id: string; quantity: number; unit_price: number }[],
    total: number
  ) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

// Types for Supabase DB
export interface DBProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string;
  category_id: string | null;
  categories?: { name: string } | null;
}
