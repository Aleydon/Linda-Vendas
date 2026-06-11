import { act, renderHook } from '@testing-library/react-native';

import { Product } from '@/context/types';
import { api } from '@/services/api';

import { useAppProducts } from './useAppProducts';

// Mocking API
jest.mock('@/services/api', () => ({
  api: {
    fetchProducts: jest.fn(),
    addProduct: jest.fn(),
    updateProduct: jest.fn(),
    deleteProduct: jest.fn()
  }
}));

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Product 1',
    price: 10,
    stock: 5,
    imageUrl: '',
    has_variations: false
  }
];

describe('useAppProducts', () => {
  const mockRefreshData = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch products', async () => {
    (api.fetchProducts as jest.Mock).mockResolvedValue(mockProducts);

    const { result } = renderHook(() =>
      useAppProducts({ isAdmin: false, refreshData: mockRefreshData })
    );

    await act(async () => {
      await result.current.fetchProducts();
    });

    expect(api.fetchProducts).toHaveBeenCalled();
    expect(result.current.products).toEqual(mockProducts);
  });

  it('should allow adding product if admin', async () => {
    const { result } = renderHook(() =>
      useAppProducts({ isAdmin: true, refreshData: mockRefreshData })
    );

    const newProduct = {
      name: 'New',
      price: 15,
      stock: 10,
      imageUrl: '',
      has_variations: false
    };

    await act(async () => {
      await result.current.addProduct(newProduct);
    });

    expect(api.addProduct).toHaveBeenCalledWith(newProduct);
    expect(mockRefreshData).toHaveBeenCalled();
  });

  it('should throw error if non-admin tries to add product', async () => {
    const { result } = renderHook(() =>
      useAppProducts({ isAdmin: false, refreshData: mockRefreshData })
    );

    await expect(result.current.addProduct({} as Product)).rejects.toThrow(
      'Unauthorized'
    );
  });

  it('should update stock correctly', async () => {
    (api.fetchProducts as jest.Mock).mockResolvedValue(mockProducts);

    const { result } = renderHook(() =>
      useAppProducts({ isAdmin: true, refreshData: mockRefreshData })
    );

    // First fetch to populate state
    await act(async () => {
      await result.current.fetchProducts();
    });

    await act(async () => {
      await result.current.updateStock('1', 2);
    });

    expect(api.updateProduct).toHaveBeenCalledWith('1', { stock: 7 });
  });

  it('should reset stock to zero', async () => {
    (api.fetchProducts as jest.Mock).mockResolvedValue(mockProducts);

    const { result } = renderHook(() =>
      useAppProducts({ isAdmin: true, refreshData: mockRefreshData })
    );

    await act(async () => {
      await result.current.resetStock('1');
    });

    expect(api.updateProduct).toHaveBeenCalledWith('1', { stock: 0 });
  });

  it('should allow deleting product if admin', async () => {
    const { result } = renderHook(() =>
      useAppProducts({ isAdmin: true, refreshData: mockRefreshData })
    );

    await act(async () => {
      await result.current.deleteProduct('1');
    });

    expect(api.deleteProduct).toHaveBeenCalledWith('1');
    expect(mockRefreshData).toHaveBeenCalled();
  });
});
