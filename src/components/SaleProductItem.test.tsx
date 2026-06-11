import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { useAppContext } from '@/context/AppContext';

import { SaleProductItem } from './SaleProductItem';

// Mocking AppContext
jest.mock('@/context/AppContext', () => ({
  useAppContext: jest.fn()
}));

const mockProduct = {
  id: '1',
  name: 'Test Product',
  price: 10,
  stock: 5,
  imageUrl: '',
  has_variations: false
};

const mockProductWithVariations = {
  id: '2',
  name: 'Var Product',
  price: 0,
  stock: 0,
  imageUrl: '',
  has_variations: true,
  variations: [
    { id: 'v1', name: 'V1', price: 15, stock: 3 },
    { id: 'v2', name: 'V2', price: 20, stock: 0 }
  ]
};

describe('SaleProductItem', () => {
  const mockOnUpdateQuantity = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppContext as jest.Mock).mockReturnValue({
      colorScheme: 'light'
    });
  });

  it('renders simple product correctly', () => {
    render(
      <SaleProductItem
        item={mockProduct}
        cart={[]}
        onUpdateQuantity={mockOnUpdateQuantity}
      />
    );

    expect(screen.getByText('Test Product')).toBeTruthy();
    expect(screen.getByText(/R\$\s*10,00/)).toBeTruthy();
    expect(screen.getByText('Estoque: 5 un')).toBeTruthy();
  });

  it('calls onUpdateQuantity when plus/minus buttons are pressed', () => {
    render(
      <SaleProductItem
        item={mockProduct}
        cart={[{ productId: '1', quantity: 2 }]}
        onUpdateQuantity={mockOnUpdateQuantity}
      />
    );

    expect(screen.getByText('2')).toBeTruthy();

    fireEvent.press(screen.getByTestId('plus-button'));
    expect(mockOnUpdateQuantity).toHaveBeenCalledWith('1', 1);

    fireEvent.press(screen.getByTestId('minus-button'));
    expect(mockOnUpdateQuantity).toHaveBeenCalledWith('1', -1);
  });

  it('shows variation list when expanded', () => {
    render(
      <SaleProductItem
        item={mockProductWithVariations}
        cart={[]}
        onUpdateQuantity={mockOnUpdateQuantity}
      />
    );

    // Initial state: variations not visible
    expect(screen.queryByText('V1')).toBeNull();

    // Expand
    fireEvent.press(screen.getByText('Var Product'));

    expect(screen.getByText('V1')).toBeTruthy();
    expect(screen.getByText('V2')).toBeTruthy();
  });

  it('disables plus button for variations when stock is reached', () => {
    render(
      <SaleProductItem
        item={mockProductWithVariations}
        cart={[{ productId: '2', variationId: 'v1', quantity: 3 }]}
        onUpdateQuantity={mockOnUpdateQuantity}
      />
    );

    fireEvent.press(screen.getByText('Var Product')); // Expand

    // Find the V1 variation block and its buttons
    fireEvent.press(screen.getByTestId('plus-button-v1'));
    expect(mockOnUpdateQuantity).not.toHaveBeenCalled();
  });
});
