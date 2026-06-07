import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { useAlert } from '@/context/AlertContext';
import { Product, Variation } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import {
  formatInputCurrency,
  parseFormattedCurrency
} from '@/utils/formatters';

interface UseProductFormProps {
  initialData?: Product;
  onSubmit: (
    data: Omit<Product, 'id' | 'outOfStock' | 'category'>
  ) => Promise<void> | void;
}

export function useProductForm({ initialData, onSubmit }: UseProductFormProps) {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [name, setName] = useState(initialData?.name ?? '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? '');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [price, setPrice] = useState(
    initialData ? formatInputCurrency((initialData.price * 100).toFixed(0)) : ''
  );
  const [stock, setStock] = useState(
    initialData ? String(initialData.stock) : ''
  );
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? '');
  const [hasVariations, setHasVariations] = useState(
    initialData?.has_variations ?? false
  );
  const [variations, setVariations] = useState<Variation[]>(
    initialData?.variations ?? []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async (): Promise<void> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7
      });

      if (!result.canceled && result.assets[0].uri) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showAlert({
        title: 'Erro',
        description: 'Não foi possível selecionar a imagem.',
        type: 'error'
      });
    }
  };

  const uploadImage = async (uri: string): Promise<void> => {
    try {
      setIsUploading(true);
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
      setImageUrl(data.publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      showAlert({
        title: 'Erro',
        description: 'Falha ao fazer upload da imagem.',
        type: 'error'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const addVariation = (): void => {
    setVariations([
      ...variations,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: '',
        price: 0,
        stock: 0
      }
    ]);
  };

  const removeVariation = (id: string): void => {
    setVariations(variations.filter(v => v.id !== id));
  };

  const updateVariation = (
    id: string,
    field: keyof Variation,
    value: string | number
  ): void => {
    setVariations(
      variations.map(v => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handlePriceChange = (text: string): void => {
    setPrice(formatInputCurrency(text));
  };

  const handleVariationPriceChange = (id: string, text: string): void => {
    const formatted = formatInputCurrency(text);
    const numericValue = parseFormattedCurrency(formatted);
    updateVariation(id, 'price', numericValue);
  };

  const handleSave = async (): Promise<void> => {
    if (!name || !categoryId) {
      showAlert({
        title: 'Erro',
        description: 'Preencha o nome e a categoria.',
        type: 'error'
      });
      return;
    }

    if (!hasVariations && (!price || !stock)) {
      showAlert({
        title: 'Erro',
        description: 'Preencha o preço e o estoque.',
        type: 'error'
      });
      return;
    }

    if (hasVariations && variations.length === 0) {
      showAlert({
        title: 'Erro',
        description: 'Adicione pelo menos uma variação.',
        type: 'error'
      });
      return;
    }

    if (hasVariations) {
      const invalidVariation = variations.find(v => !v.name || v.price <= 0);
      if (invalidVariation) {
        showAlert({
          title: 'Erro',
          description: 'Preencha corretamente todas as variações.',
          type: 'error'
        });
        return;
      }
    }

    try {
      setIsSaving(true);
      const numericPrice = hasVariations ? 0 : parseFormattedCurrency(price);
      const numericStock = hasVariations ? 0 : parseInt(stock, 10) || 0;

      await onSubmit({
        name,
        category_id: categoryId || undefined,
        price: numericPrice,
        stock: numericStock,
        imageUrl,
        has_variations: hasVariations,
        variations: hasVariations ? variations : []
      });

      router.replace('/(tabs)/stock');
    } catch (error) {
      console.error('Error saving product:', error);
      showAlert({
        title: 'Erro',
        description: 'Não foi possível salvar o produto.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    name,
    setName,
    categoryId,
    setCategoryId,
    showCategoryDropdown,
    setShowCategoryDropdown,
    price,
    handlePriceChange,
    stock,
    setStock,
    imageUrl,
    hasVariations,
    setHasVariations,
    variations,
    addVariation,
    removeVariation,
    updateVariation,
    handleVariationPriceChange,
    isSaving,
    isUploading,
    pickImage,
    handleSave
  };
}
