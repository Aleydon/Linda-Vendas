import React, { createContext, useContext, useEffect, useState } from 'react';

import { api } from '@/services/api';

import { AppContextType, Category, Product, Sale } from './types';

export * from './types';

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({
  children
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true);
      const [categoriesData, productsData, salesData] = await Promise.all([
        api.fetchCategories(),
        api.fetchProducts(),
        api.fetchSales()
      ]);

      setCategories(categoriesData);
      setProducts(productsData);
      setSales(salesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const addProduct = async (
    product: Omit<Product, 'id' | 'outOfStock' | 'category'>
  ): Promise<void> => {
    try {
      await api.addProduct(product);
      await fetchData();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const updateProduct = async (
    productId: string,
    updates: Partial<Omit<Product, 'id' | 'outOfStock'>>
  ): Promise<void> => {
    try {
      await api.updateProduct(productId, updates);
      await fetchData();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const updateStock = async (
    productId: string,
    delta: number
  ): Promise<void> => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newStock = Math.max(0, product.stock + delta);
    await updateProduct(productId, { stock: newStock });
  };

  const resetStock = async (productId: string): Promise<void> => {
    await updateProduct(productId, { stock: 0 });
  };

  const addStock = async (productId: string, amount: number): Promise<void> => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    await api.updateProduct(productId, { stock: product.stock + amount });
    await fetchData();
  };

  const deleteProduct = async (productId: string): Promise<void> => {
    try {
      await api.deleteProduct(productId);
      await fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const addSale = async (
    items: { product_id: string; quantity: number; unit_price: number }[],
    total: number
  ): Promise<void> => {
    try {
      setLoading(true);
      await api.addSale(items, total);
      await fetchData();
    } catch (error) {
      console.error('Error adding sale:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (name: string): Promise<void> => {
    try {
      await api.addCategory(name);
      await fetchData();
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    try {
      await api.deleteCategory(id);
      await fetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  return (
    <AppContext.Provider
      value={{
        products,
        sales,
        categories,
        loading,
        updateStock,
        resetStock,
        addStock,
        updateProduct,
        addProduct,
        deleteProduct,
        addSale,
        addCategory,
        deleteCategory,
        refreshData: fetchData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
