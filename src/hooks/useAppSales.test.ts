import { User } from '@supabase/supabase-js';
import { act, renderHook } from '@testing-library/react-native';

import { api } from '@/services/api';

import { useAppSales } from './useAppSales';

// Mocking API
jest.mock('@/services/api', () => ({
  api: {
    fetchSales: jest.fn(),
    addSale: jest.fn(),
    confirmSalePayment: jest.fn(),
    fetchSalesByUser: jest.fn(),
    fetchAllProfiles: jest.fn(),
    updateUserRole: jest.fn(),
    updateUserFiado: jest.fn()
  }
}));

describe('useAppSales', () => {
  const mockUser = { id: 'seller-1' };
  const mockRefreshData = jest.fn();
  const mockSetLoading = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch sales', async () => {
    const mockSales = [{ id: 'sale-1', total: 100 }];
    (api.fetchSales as jest.Mock).mockResolvedValue(mockSales);

    const { result } = renderHook(() =>
      useAppSales({
        isAdmin: true,
        user: mockUser as unknown as User,
        refreshData: mockRefreshData,
        setLoading: mockSetLoading
      })
    );

    await act(async () => {
      await result.current.fetchSales();
    });

    expect(api.fetchSales).toHaveBeenCalled();
    expect(result.current.sales).toEqual(mockSales);
  });

  it('should add a sale', async () => {
    const { result } = renderHook(() =>
      useAppSales({
        isAdmin: false,
        user: mockUser as unknown as User,
        refreshData: mockRefreshData,
        setLoading: mockSetLoading
      })
    );

    const saleItems = [{ product_id: '1', quantity: 2, unit_price: 10 }];
    await act(async () => {
      await result.current.addSale(saleItems, 20);
    });

    expect(api.addSale).toHaveBeenCalledWith(
      saleItems,
      20,
      'seller-1',
      'paid',
      undefined
    );
    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
    expect(mockRefreshData).toHaveBeenCalled();
  });

  it('should confirm payment if admin', async () => {
    const { result } = renderHook(() =>
      useAppSales({
        isAdmin: true,
        user: mockUser as unknown as User,
        refreshData: mockRefreshData,
        setLoading: mockSetLoading
      })
    );

    await act(async () => {
      await result.current.confirmPayment('sale-123');
    });

    expect(api.confirmSalePayment).toHaveBeenCalledWith('sale-123');
    expect(mockRefreshData).toHaveBeenCalled();
  });

  it('should throw error if non-admin tries to confirm payment', async () => {
    const { result } = renderHook(() =>
      useAppSales({
        isAdmin: false,
        user: mockUser as unknown as User,
        refreshData: mockRefreshData,
        setLoading: mockSetLoading
      })
    );

    await expect(result.current.confirmPayment('sale-1')).rejects.toThrow(
      'Unauthorized'
    );
  });

  it('should fetch all profiles if admin', async () => {
    const mockProfiles = [{ id: 'u1', email: 'u1@test.com' }];
    (api.fetchAllProfiles as jest.Mock).mockResolvedValue(mockProfiles);

    const { result } = renderHook(() =>
      useAppSales({
        isAdmin: true,
        user: mockUser as unknown as User,
        refreshData: mockRefreshData,
        setLoading: mockSetLoading
      })
    );

    const profiles = await result.current.fetchAllProfiles();
    expect(profiles).toEqual(mockProfiles);
  });

  it('should throw error when admin tries to change own role', async () => {
    const { result } = renderHook(() =>
      useAppSales({
        isAdmin: true,
        user: mockUser as unknown as User,
        refreshData: mockRefreshData,
        setLoading: mockSetLoading
      })
    );

    await expect(
      result.current.updateUserRole('seller-1', 'user')
    ).rejects.toThrow('Você não pode alterar sua própria role.');
  });
});
