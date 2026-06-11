import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  const defaultProps = {
    name: 'Test Product',
    price: '10.00',
    stock: 5,
    has_variations: false
  };

  it('renders product information correctly', () => {
    render(<ProductCard {...defaultProps} />);

    expect(screen.getByText('Test Product')).toBeTruthy();
    expect(screen.getByText('R$ 10.00')).toBeTruthy();
    expect(screen.getByText('Estoque: 05 un')).toBeTruthy();
  });

  it('shows "Fora de Estoque" when outOfStock is true', () => {
    render(<ProductCard {...defaultProps} outOfStock={true} />);
    expect(screen.getByText('Fora de Estoque')).toBeTruthy();
  });

  it('shows "A partir de" and lowest price for variations', () => {
    const variations = [
      { id: '1', name: 'Size S', price: 15, stock: 2 },
      { id: '2', name: 'Size M', price: 12, stock: 3 }
    ];

    render(
      <ProductCard
        {...defaultProps}
        has_variations={true}
        variations={variations}
      />
    );

    expect(screen.getByText('A partir de')).toBeTruthy();
    // Lowest price is 12
    expect(screen.getByText(/R\$\s*12,00/)).toBeTruthy();
    // Total stock is 2 + 3 = 5
    expect(screen.getByText('Estoque: 05 un')).toBeTruthy();
  });

  it('expands variations when pressed', () => {
    const variations = [{ id: '1', name: 'Size S', price: 15, stock: 2 }];

    render(
      <ProductCard
        {...defaultProps}
        has_variations={true}
        variations={variations}
      />
    );

    // Variations should not be visible initially (FadeIn might make it tricky,
    // but usually in tests we check if elements exist)
    expect(screen.queryByText('Size S')).toBeNull();

    // Press to expand
    fireEvent.press(screen.getByText('Test Product'));

    expect(screen.getByText('Size S')).toBeTruthy();
  });
});
