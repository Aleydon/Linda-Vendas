import { renderHook } from '@testing-library/react-native';

import { Product, Sale } from '@/context/types';

import { useDashboardMetrics } from './useDashboardMetrics';

describe('useDashboardMetrics', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2023, 0, 15, 12, 0, 0)); // Jan 15, 2023
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  const mockProducts: Product[] = [
    {
      id: 'p1',
      name: 'Product 1',
      price: 10,
      stock: 5,
      imageUrl: '',
      has_variations: false
    },
    {
      id: 'p2',
      name: 'Product 2',
      price: 20,
      stock: 20,
      imageUrl: '',
      has_variations: false
    }
  ];

  const mockSales: Sale[] = [
    {
      id: 's1',
      total: 100,
      created_at: new Date(2023, 0, 15, 10, 0).toISOString(), // Today
      status: 'paid',
      sale_items: [
        {
          id: 'si1',
          product_id: 'p1',
          quantity: 10,
          unit_price: 10,
          product: { name: 'Product 1', categories: { name: 'Cat 1' } }
        }
      ]
    },
    {
      id: 's2',
      total: 50,
      created_at: new Date(2023, 0, 14, 10, 0).toISOString(), // Yesterday
      status: 'paid',
      sale_items: [
        {
          id: 'si2',
          product_id: 'p2',
          quantity: 2,
          unit_price: 25,
          product: { name: 'Product 2', categories: { name: 'Cat 2' } }
        }
      ]
    }
  ];

  it('calculates total sales for today and yesterday correctly', () => {
    const { result } = renderHook(() =>
      useDashboardMetrics(mockSales, mockProducts)
    );

    expect(result.current.todaySales).toBe(100);
    expect(result.current.percentageChange).toBe(100); // (100 - 50) / 50 * 100 = 100%
  });

  it('identifies top products and categories', () => {
    const { result } = renderHook(() =>
      useDashboardMetrics(mockSales, mockProducts)
    );

    expect(result.current.topProducts[0].name).toBe('Product 1');
    expect(result.current.topProducts[0].quantity).toBe(10);
    expect(result.current.topCategories[0].name).toBe('Cat 1');
  });

  it('identifies low stock items', () => {
    const { result } = renderHook(() =>
      useDashboardMetrics(mockSales, mockProducts)
    );

    // Product 1 has stock 5 (<= 10)
    expect(result.current.lowStockItems).toHaveLength(1);
    expect(result.current.lowStockItems[0].name).toBe('Product 1');
  });

  it('generates chart data for the last 7 days', () => {
    const { result } = renderHook(() =>
      useDashboardMetrics(mockSales, mockProducts)
    );

    expect(result.current.salesChartData).toHaveLength(7);
    // Last item should be today (Jan 15)
    expect(result.current.salesChartData[6].total).toBe(100);
    // Penultimate item should be yesterday (Jan 14)
    expect(result.current.salesChartData[5].total).toBe(50);
  });
});
