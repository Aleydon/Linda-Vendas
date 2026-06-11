import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { useAppContext } from '@/context/AppContext';
import { useProductForm } from '@/hooks/useProductForm';

import { ProductForm } from './ProductForm';

// Mocking dependencies
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn() })
}));

jest.mock('@/context/AppContext', () => ({
  useAppContext: jest.fn()
}));

jest.mock('@/hooks/useProductForm', () => ({
  useProductForm: jest.fn()
}));

describe('ProductForm', () => {
  const mockOnSubmit = jest.fn();
  const mockHandleSave = jest.fn();

  const defaultHookValues = {
    name: '',
    setName: jest.fn(),
    categoryId: '',
    setCategoryId: jest.fn(),
    showCategoryDropdown: false,
    setShowCategoryDropdown: jest.fn(),
    price: '',
    handlePriceChange: jest.fn(),
    stock: '',
    setStock: jest.fn(),
    imageUrl: '',
    hasVariations: false,
    setHasVariations: jest.fn(),
    variations: [],
    addVariation: jest.fn(),
    removeVariation: jest.fn(),
    updateVariation: jest.fn(),
    handleVariationPriceChange: jest.fn(),
    isSaving: false,
    isUploading: false,
    pickImage: jest.fn(),
    handleSave: mockHandleSave
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppContext as jest.Mock).mockReturnValue({
      categories: [],
      colorScheme: 'light'
    });
    (useProductForm as jest.Mock).mockReturnValue(defaultHookValues);
  });

  it('renders correctly for new product', () => {
    render(<ProductForm onSubmit={mockOnSubmit} title="Novo Produto" />);

    expect(screen.getByText('Novo Produto')).toBeTruthy();
    expect(screen.getByText('Criar Produto')).toBeTruthy();
    expect(screen.getByText('Nome do Produto')).toBeTruthy();
  });

  it('renders correctly for editing product', () => {
    const initialData = {
      id: '1',
      name: 'Existing',
      price: 10,
      stock: 5,
      imageUrl: '',
      has_variations: false
    } as const;

    (useProductForm as jest.Mock).mockReturnValue({
      ...defaultHookValues,
      name: 'Existing',
      price: '10,00',
      stock: '5'
    });

    render(
      <ProductForm
        initialData={initialData}
        onSubmit={mockOnSubmit}
        title="Editar Produto"
      />
    );

    expect(screen.getByText('Editar Produto')).toBeTruthy();
    expect(screen.getByText('Salvar Alterações')).toBeTruthy();
    expect(screen.getByDisplayValue('Existing')).toBeTruthy();
  });

  it('calls handleSave when submit button is pressed', () => {
    render(<ProductForm onSubmit={mockOnSubmit} title="Novo Produto" />);

    fireEvent.press(screen.getByText('Criar Produto'));
    expect(mockHandleSave).toHaveBeenCalled();
  });

  it('shows loading indicator when saving', () => {
    (useProductForm as jest.Mock).mockReturnValue({
      ...defaultHookValues,
      isSaving: true
    });

    render(<ProductForm onSubmit={mockOnSubmit} title="Novo Produto" />);

    // ActivityIndicator doesn't have text, but we can check if the button text is NOT there
    expect(screen.queryByText('Criar Produto')).toBeNull();
  });
});
