import { useMemo, useState } from 'react';

import { Product } from '@/context/types';

export interface CartItem {
  productId: string;
  variationId?: string;
  quantity: number;
}

export function useCart(products: Product[]) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const total = useMemo(() => {
    return cart.reduce((acc, item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return acc;

      if (item.variationId && product.variations) {
        const variation = product.variations.find(
          v => v.id === item.variationId
        );
        return acc + (variation?.price || 0) * item.quantity;
      }

      return acc + (product.price || 0) * item.quantity;
    }, 0);
  }, [cart, products]);

  const updateQuantity = (
    productId: string,
    delta: number,
    variationId?: string
  ) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.productId === productId && item.variationId === variationId
      );
      const product = products.find(p => p.id === productId);

      if (!product) return prev;

      let maxStock = product.stock;
      if (variationId && product.variations) {
        const v = product.variations.find(
          varItem => varItem.id === variationId
        );
        if (v) maxStock = v.stock;
      }

      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const newQuantity = existing.quantity + delta;

        if (newQuantity <= 0) {
          return prev.filter((_, i) => i !== existingIndex);
        }

        if (newQuantity > maxStock) {
          return prev;
        }

        const newCart = [...prev];
        newCart[existingIndex] = { ...existing, quantity: newQuantity };
        return newCart;
      } else if (delta > 0) {
        if (maxStock <= 0) return prev;
        const initialQuantity = Math.min(delta, maxStock);
        return [...prev, { productId, variationId, quantity: initialQuantity }];
      }
      return prev;
    });
  };

  const clearCart = () => setCart([]);

  const totalItemsCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  return {
    cart,
    total,
    totalItemsCount,
    updateQuantity,
    clearCart
  };
}
export default useCart;
