import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { Product, Variation } from '@/context/types';
import { supabase } from '@/lib/supabase';
import {
  formatInputCurrency,
  parseFormattedCurrency
} from '@/utils/formatters';

export interface ProductFormState {
  id: string;
  name: string;
  category_id: string;
  price: string;
  stock: string;
  imageUrl: string;
  has_variations: boolean;
  variations: Variation[];
  isExpanded: boolean;
}

interface UseMultipleProductsFormProps {
  onSubmit: (
    products: Omit<Product, 'id' | 'outOfStock' | 'category'>[]
  ) => Promise<void> | void;
}

export function useMultipleProductsForm({
  onSubmit
}: UseMultipleProductsFormProps) {
  const router = useRouter();

  const createEmptyProduct = (): ProductFormState => ({
    id: Math.random().toString(36).substring(2, 9),
    name: '',
    category_id: '',
    price: '',
    stock: '',
    imageUrl: '',
    has_variations: false,
    variations: [],
    isExpanded: true
  });

  const [productsList, setProductsList] = useState<ProductFormState[]>([
    createEmptyProduct()
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [activeCategoryDropdownId, setActiveCategoryDropdownId] = useState<
    string | null
  >(null);

  const addProductForm = (): void => {
    setProductsList(prev => [
      ...prev.map(p => ({ ...p, isExpanded: false })), // collapse others
      createEmptyProduct()
    ]);
  };

  const removeProductForm = (id: string): void => {
    if (productsList.length === 1) {
      Alert.alert('Aviso', 'Você precisa cadastrar pelo menos um produto.');
      return;
    }
    setProductsList(prev => prev.filter(p => p.id !== id));
  };

  const toggleProductExpand = (id: string): void => {
    setProductsList(prev =>
      prev.map(p => (p.id === id ? { ...p, isExpanded: !p.isExpanded } : p))
    );
  };

  const updateProductField = <K extends keyof ProductFormState>(
    id: string,
    field: K,
    value: ProductFormState[K]
  ): void => {
    setProductsList(prev =>
      prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const pickImage = async (productId: string): Promise<void> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7
      });

      if (!result.canceled && result.assets[0].uri) {
        await uploadImage(productId, result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const uploadImage = async (productId: string, uri: string): Promise<void> => {
    try {
      setUploadingId(productId);
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64
      });

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, Buffer.from(base64, 'base64'), {
          contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('media').getPublicUrl(filePath);
      updateProductField(productId, 'imageUrl', data.publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Erro', 'Falha ao fazer upload da imagem.');
    } finally {
      setUploadingId(null);
    }
  };

  const addVariation = (productId: string): void => {
    const product = productsList.find(p => p.id === productId);
    if (!product) return;

    const newVariationList = [
      ...product.variations,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: '',
        price: 0,
        stock: 0
      }
    ];
    updateProductField(productId, 'variations', newVariationList);
  };

  const removeVariation = (productId: string, variationId: string): void => {
    const product = productsList.find(p => p.id === productId);
    if (!product) return;

    const newVariationList = product.variations.filter(
      v => v.id !== variationId
    );
    updateProductField(productId, 'variations', newVariationList);
  };

  const updateVariationField = (
    productId: string,
    variationId: string,
    field: keyof Variation,
    value: string | number
  ): void => {
    const product = productsList.find(p => p.id === productId);
    if (!product) return;

    const newVariationList = product.variations.map(v =>
      v.id === variationId ? { ...v, [field]: value } : v
    );
    updateProductField(productId, 'variations', newVariationList);
  };

  const handlePriceChange = (productId: string, text: string): void => {
    updateProductField(productId, 'price', formatInputCurrency(text));
  };

  const handleVariationPriceChange = (
    productId: string,
    variationId: string,
    text: string
  ): void => {
    const formatted = formatInputCurrency(text);
    const numericValue = parseFormattedCurrency(formatted);
    updateVariationField(productId, variationId, 'price', numericValue);
  };

  const handleSave = async (): Promise<void> => {
    // Validations
    for (let i = 0; i < productsList.length; i++) {
      const p = productsList[i];
      const prodIndexStr = productsList.length > 1 ? ` (Produto ${i + 1})` : '';

      if (!p.name || !p.category_id) {
        Alert.alert('Erro', `Preencha o nome e a categoria${prodIndexStr}.`);
        return;
      }

      if (!p.has_variations && (!p.price || !p.stock)) {
        Alert.alert('Erro', `Preencha o preço e o estoque${prodIndexStr}.`);
        return;
      }

      if (p.has_variations && p.variations.length === 0) {
        Alert.alert('Erro', `Adicione pelo menos uma variação${prodIndexStr}.`);
        return;
      }

      if (p.has_variations) {
        const invalidVariation = p.variations.find(
          v => !v.name || v.price <= 0
        );
        if (invalidVariation) {
          Alert.alert(
            'Erro',
            `Preencha corretamente todas as variações${prodIndexStr}.`
          );
          return;
        }
      }
    }

    try {
      setIsSaving(true);
      const parsedProducts = productsList.map(p => {
        const numericPrice = p.has_variations
          ? 0
          : parseFormattedCurrency(p.price);
        const numericStock = p.has_variations ? 0 : parseInt(p.stock, 10) || 0;

        return {
          name: p.name,
          category_id: p.category_id || undefined,
          price: numericPrice,
          stock: numericStock,
          imageUrl: p.imageUrl,
          has_variations: p.has_variations,
          variations: p.has_variations ? p.variations : []
        };
      });

      await onSubmit(parsedProducts);
      router.replace('/(tabs)/stock');
    } catch (error) {
      console.error('Error saving products:', error);
      Alert.alert('Erro', 'Não foi possível salvar os produtos.');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    productsList,
    addProductForm,
    removeProductForm,
    toggleProductExpand,
    updateProductField,
    pickImage,
    uploadingId,
    activeCategoryDropdownId,
    setActiveCategoryDropdownId,
    addVariation,
    removeVariation,
    updateVariationField,
    handlePriceChange,
    handleVariationPriceChange,
    isSaving,
    handleSave
  };
}
export default useMultipleProductsForm;
