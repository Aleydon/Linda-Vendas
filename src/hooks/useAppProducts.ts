import { useState } from 'react';

import { Product } from '@/context/types';
import { api } from '@/services/api';

interface UseAppProductsProps {
  isAdmin: boolean;
  refreshData: () => Promise<void>;
}

export function useAppProducts({ isAdmin, refreshData }: UseAppProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async (): Promise<void> => {
    try {
      const data = await api.fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const addProduct = async (
    product: Omit<Product, 'id' | 'outOfStock' | 'category'>
  ): Promise<void> => {
    if (!isAdmin) throw new Error('Unauthorized');
    try {
      await api.addProduct(product);
      await refreshData();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const updateProduct = async (
    productId: string,
    updates: Partial<Omit<Product, 'id' | 'outOfStock'>>
  ): Promise<void> => {
    if (!isAdmin) throw new Error('Unauthorized');
    try {
      await api.updateProduct(productId, updates);
      await refreshData();
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
    await refreshData();
  };

  const deleteProduct = async (productId: string): Promise<void> => {
    if (!isAdmin) throw new Error('Unauthorized');
    try {
      await api.deleteProduct(productId);
      await refreshData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return {
    products,
    setProducts,
    fetchProducts,
    addProduct,
    updateProduct,
    updateStock,
    resetStock,
    addStock,
    deleteProduct
  };
}
