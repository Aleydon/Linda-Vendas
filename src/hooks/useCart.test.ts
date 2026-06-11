import { act, renderHook } from '@testing-library/react-native';

import { Product } from '@/context/types';

import { useCart } from './useCart';

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Product 1',
    price: 10,
    stock: 5,
    imageUrl: '',
    has_variations: false
  },
  {
    id: '2',
    name: 'Product 2',
    price: 20,
    stock: 10,
    imageUrl: '',
    has_variations: true,
    variations: [
      { id: 'v1', name: 'Var 1', price: 25, stock: 3 },
      { id: 'v2', name: 'Var 2', price: 30, stock: 0 }
    ]
  }
];

describe('useCart', () => {
  it('should initialize with an empty cart', () => {
    const { result } = renderHook(() => useCart(mockProducts));
    expect(result.current.cart).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.totalItemsCount).toBe(0);
  });

  it('should add a product to the cart', () => {
    const { result } = renderHook(() => useCart(mockProducts));

    act(() => {
      result.current.updateQuantity('1', 1);
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0]).toEqual({
      productId: '1',
      variationId: undefined,
      quantity: 1
    });
    expect(result.current.total).toBe(10);
    expect(result.current.totalItemsCount).toBe(1);
  });

  it('should add a product with variation', () => {
    const { result } = renderHook(() => useCart(mockProducts));

    act(() => {
      result.current.updateQuantity('2', 1, 'v1');
    });

    expect(result.current.cart[0]).toEqual({
      productId: '2',
      variationId: 'v1',
      quantity: 1
    });
    expect(result.current.total).toBe(25);
  });

  it('should update quantity of an existing item', () => {
    const { result } = renderHook(() => useCart(mockProducts));

    act(() => {
      result.current.updateQuantity('1', 1);
      result.current.updateQuantity('1', 2);
    });

    expect(result.current.cart[0].quantity).toBe(3);
    expect(result.current.total).toBe(30);
  });

  it('should not exceed stock limit', () => {
    const { result } = renderHook(() => useCart(mockProducts));

    act(() => {
      result.current.updateQuantity('1', 5);
      result.current.updateQuantity('1', 1); // Should stay at 5
    });

    expect(result.current.cart[0].quantity).toBe(5);
  });

  it('should remove item when quantity reaches zero', () => {
    const { result } = renderHook(() => useCart(mockProducts));

    act(() => {
      result.current.updateQuantity('1', 1);
      result.current.updateQuantity('1', -1);
    });

    expect(result.current.cart).toHaveLength(0);
  });

  it('should not add item if stock is zero', () => {
    const { result } = renderHook(() => useCart(mockProducts));

    act(() => {
      result.current.updateQuantity('2', 1, 'v2'); // Var 2 has 0 stock
    });

    expect(result.current.cart).toHaveLength(0);
  });

  it('should clear the cart', () => {
    const { result } = renderHook(() => useCart(mockProducts));

    act(() => {
      result.current.updateQuantity('1', 1);
      result.current.clearCart();
    });

    expect(result.current.cart).toHaveLength(0);
  });
});
