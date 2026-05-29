import { Category, DBProduct, Product, Sale } from '@/context/types';
import { supabase } from '@/lib/supabase';

export const api = {
  async fetchCategories(): Promise<Category[]> {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    return (data as Category[]) || [];
  },

  async fetchProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)');

    if (error) throw error;

    return ((data as DBProduct[]) || []).map(p => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      stock: p.stock,
      imageUrl: p.image_url,
      category_id: p.category_id ?? undefined,
      category: p.categories?.name || 'Sem Categoria',
      outOfStock: p.stock === 0
    }));
  },

  async fetchSales(): Promise<Sale[]> {
    const { data, error } = await supabase
      .from('sales')
      .select('*, sale_items(*, product:products(name, categories(name)))')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as Sale[]) || [];
  },

  async addCategory(name: string): Promise<void> {
    const { error } = await supabase.from('categories').insert([{ name }]);
    if (error) throw error;
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  },

  async addProduct(
    product: Omit<Product, 'id' | 'outOfStock' | 'category'>
  ): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name: product.name,
          price: product.price,
          stock: product.stock,
          image_url: product.imageUrl,
          category_id: product.category_id
        }
      ])
      .select()
      .single();

    if (error) throw error;

    const p = data as DBProduct;
    return {
      id: p.id,
      name: p.name,
      price: Number(p.price),
      stock: p.stock,
      imageUrl: p.image_url,
      category_id: p.category_id ?? undefined,
      outOfStock: p.stock === 0
    };
  },

  async updateProduct(
    productId: string,
    updates: Partial<Omit<Product, 'id' | 'outOfStock'>>
  ): Promise<void> {
    const payload: Record<string, string | number | null | undefined> = {};

    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.price !== undefined) payload.price = updates.price;
    if (updates.stock !== undefined) payload.stock = updates.stock;
    if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
    if (updates.category_id !== undefined)
      payload.category_id = updates.category_id;

    const { error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', productId);

    if (error) throw error;
  },

  async deleteProduct(productId: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    if (error) throw error;
  },

  async addSale(
    items: { product_id: string; quantity: number; unit_price: number }[],
    total: number
  ): Promise<void> {
    // 1. Create Sale
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert([{ total }])
      .select()
      .single();

    if (saleError) throw saleError;

    // 2. Create Sale Items
    const saleItems = items.map(item => ({
      sale_id: saleData.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price
    }));

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems);

    if (itemsError) throw itemsError;

    // 3. Update Stocks
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .single();

      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity);
        await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.product_id);
      }
    }
  }
};
