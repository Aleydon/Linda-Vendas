import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { FormField } from '@/components/FormField';
import { Product, useAppContext, Variation } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (
    data: Omit<Product, 'id' | 'outOfStock' | 'category'>
  ) => Promise<void> | void;
  title: string;
}

const formatCurrency = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  if (!cleanValue) return '';

  const amount = parseInt(cleanValue, 10) / 100;
  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export function ProductForm({
  initialData,
  onSubmit,
  title
}: ProductFormProps): React.JSX.Element {
  const router = useRouter();
  const { categories } = useAppContext();

  const [name, setName] = useState(initialData?.name ?? '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? '');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [price, setPrice] = useState(
    initialData ? formatCurrency((initialData.price * 100).toFixed(0)) : ''
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
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
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
      Alert.alert('Erro', 'Falha ao fazer upload da imagem.');
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
    setPrice(formatCurrency(text));
  };

  const handleVariationPriceChange = (id: string, text: string): void => {
    const formatted = formatCurrency(text);
    const numericValue =
      parseFloat(formatted.replace('.', '').replace(',', '.')) || 0;
    updateVariation(id, 'price', numericValue);
  };

  const handleSave = async (): Promise<void> => {
    if (!name || !categoryId) {
      Alert.alert('Erro', 'Preencha o nome e a categoria.');
      return;
    }

    if (!hasVariations && (!price || !stock)) {
      Alert.alert('Erro', 'Preencha o preço e o estoque.');
      return;
    }

    if (hasVariations && variations.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos uma variação.');
      return;
    }

    if (hasVariations) {
      const invalidVariation = variations.find(v => !v.name || v.price <= 0);
      if (invalidVariation) {
        Alert.alert('Erro', 'Preencha corretamente todas as variações.');
        return;
      }
    }

    try {
      setIsSaving(true);
      const numericPrice = hasVariations
        ? 0
        : parseFloat(price.replace('.', '').replace(',', '.')) || 0;
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

      router.back();
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Erro', 'Não foi possível salvar o produto.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View className="bg-background flex-1">
        <View className="flex-row items-center justify-between px-6 pb-4 pt-12">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <MaterialCommunityIcons
              name="arrow-left"
              size={28}
              color="#3C2F2F"
            />
          </TouchableOpacity>
          <Text className="text-text-primary font-bold text-xl">{title}</Text>
          <View className="border-secondary bg-secondary h-10 w-10 items-center justify-center overflow-hidden rounded-full border">
            <MaterialCommunityIcons
              name={initialData ? 'pencil' : 'plus'}
              size={22}
              color="#A34211"
            />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-6 py-4">
            <TouchableOpacity
              onPress={pickImage}
              disabled={isUploading}
              activeOpacity={0.7}
              className="border-secondary overflow-hidden rounded-3xl border bg-white shadow-sm"
            >
              <View className="relative h-64 w-full">
                {imageUrl ? (
                  <Image
                    source={{ uri: imageUrl }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="h-full w-full items-center justify-center bg-gray-100">
                    {isUploading ? (
                      <ActivityIndicator color="#A34211" />
                    ) : (
                      <>
                        <MaterialCommunityIcons
                          name="camera-plus-outline"
                          size={48}
                          color="#9CA3AF"
                        />
                        <Text className="text-text-secondary mt-2">
                          Toque para adicionar imagem
                        </Text>
                      </>
                    )}
                  </View>
                )}
                {isUploading && (
                  <View className="absolute inset-0 items-center justify-center bg-black/20">
                    <ActivityIndicator color="white" />
                  </View>
                )}
                {initialData && (
                  <View className="absolute right-4 top-4 rounded-lg bg-primary px-3 py-1">
                    <Text className="font-bold text-white text-[10px] uppercase">
                      {initialData.stock > 0 ? 'Em estoque' : 'Esgotado'}
                    </Text>
                  </View>
                )}
              </View>

              <View className="p-6">
                <Text className="text-text-primary font-bold text-3xl">
                  {name || 'Novo Produto'}
                </Text>
              </View>
            </TouchableOpacity>

            <View className="mt-8 space-y-4">
              <FormField label="Nome" value={name} onChangeText={setName} />

              <View className="mb-4">
                <Text className="mb-2 text-text-secondary font-medium text-sm uppercase tracking-wider">
                  Categoria
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCategoryDropdown(true)}
                  activeOpacity={0.7}
                  className="flex-row items-center justify-between rounded-2xl border border-secondary bg-white px-4 py-4"
                >
                  <Text
                    className={
                      categoryId
                        ? 'text-text-primary font-medium'
                        : 'text-text-muted'
                    }
                  >
                    {categoryId
                      ? categories.find(c => c.id === categoryId)?.name
                      : 'Selecione uma categoria'}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={24}
                    color="#8C7E7E"
                  />
                </TouchableOpacity>

                <Modal
                  visible={showCategoryDropdown}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setShowCategoryDropdown(false)}
                >
                  <Pressable
                    className="flex-1 bg-black/40 justify-center px-6"
                    onPress={() => setShowCategoryDropdown(false)}
                  >
                    <View className="bg-white rounded-3xl overflow-hidden max-h-[60%] shadow-2xl">
                      <View className="p-4 border-b border-secondary flex-row justify-between items-center bg-gray-50">
                        <Text className="text-text-primary font-bold text-lg">
                          Escolher Categoria
                        </Text>
                        <TouchableOpacity
                          onPress={() => setShowCategoryDropdown(false)}
                        >
                          <MaterialCommunityIcons
                            name="close"
                            size={24}
                            color="#3C2F2F"
                          />
                        </TouchableOpacity>
                      </View>
                      <FlatList
                        data={categories}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            onPress={() => {
                              setCategoryId(item.id);
                              setShowCategoryDropdown(false);
                            }}
                            className={`px-6 py-4 border-b border-gray-50 flex-row items-center justify-between ${
                              categoryId === item.id ? 'bg-primary/5' : ''
                            }`}
                          >
                            <Text
                              className={`text-base ${
                                categoryId === item.id
                                  ? 'text-primary font-bold'
                                  : 'text-text-primary'
                              }`}
                            >
                              {item.name}
                            </Text>
                            {categoryId === item.id && (
                              <MaterialCommunityIcons
                                name="check"
                                size={20}
                                color="#A34211"
                              />
                            )}
                          </TouchableOpacity>
                        )}
                        ListEmptyComponent={() => (
                          <View className="p-10 items-center">
                            <Text className="text-text-secondary text-center">
                              Nenhuma categoria encontrada.
                            </Text>
                          </View>
                        )}
                      />
                    </View>
                  </Pressable>
                </Modal>
              </View>

              <View className="flex-row items-center justify-between py-2">
                <View>
                  <Text className="text-text-primary font-bold text-base">
                    Variações
                  </Text>
                  <Text className="text-text-secondary text-xs">
                    O produto possui tamanhos ou cores diferentes
                  </Text>
                </View>
                <Switch
                  value={hasVariations}
                  onValueChange={setHasVariations}
                  trackColor={{ false: '#E5E7EB', true: '#A34211' }}
                  thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
                />
              </View>

              {!hasVariations ? (
                <>
                  <FormField
                    label="Preço de Venda (R$)"
                    value={price}
                    onChangeText={handlePriceChange}
                    keyboardType="numeric"
                    placeholder="0,00"
                  />
                  <FormField
                    label="Estoque Inicial"
                    value={stock}
                    onChangeText={setStock}
                    keyboardType="numeric"
                  />
                </>
              ) : (
                <View className="mt-4">
                  <Text className="mb-4 text-text-secondary font-medium text-sm uppercase tracking-wider">
                    Lista de Variações
                  </Text>
                  {variations.map((variation, index) => (
                    <View
                      key={variation.id}
                      className="border-secondary mb-4 rounded-2xl border bg-white p-4 shadow-sm"
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-text-primary font-bold">
                          Variação #{index + 1}
                        </Text>
                        <TouchableOpacity
                          onPress={() => removeVariation(variation.id)}
                        >
                          <MaterialCommunityIcons
                            name="delete-outline"
                            size={20}
                            color="#EF4444"
                          />
                        </TouchableOpacity>
                      </View>

                      <FormField
                        label="Nome da Variação"
                        value={variation.name}
                        onChangeText={text =>
                          updateVariation(variation.id, 'name', text)
                        }
                        placeholder="Ex: P, M, G ou Azul, Preto"
                      />

                      <View className="flex-row gap-4">
                        <View className="flex-1">
                          <FormField
                            label="Preço"
                            value={
                              variation.price
                                ? variation.price.toLocaleString('pt-BR', {
                                    minimumFractionDigits: 2
                                  })
                                : ''
                            }
                            onChangeText={text =>
                              handleVariationPriceChange(variation.id, text)
                            }
                            keyboardType="numeric"
                            placeholder="0,00"
                          />
                        </View>
                        <View className="flex-1">
                          <FormField
                            label="Estoque"
                            value={
                              variation.stock ? variation.stock.toString() : ''
                            }
                            onChangeText={text =>
                              updateVariation(
                                variation.id,
                                'stock',
                                parseInt(text, 10) || 0
                              )
                            }
                            keyboardType="numeric"
                          />
                        </View>
                      </View>
                    </View>
                  ))}

                  <TouchableOpacity
                    onPress={addVariation}
                    className="border-primary flex-row items-center justify-center rounded-2xl border border-dashed py-4"
                  >
                    <MaterialCommunityIcons
                      name="plus"
                      size={24}
                      color="#A34211"
                    />
                    <Text className="text-primary ml-2 font-bold">
                      Adicionar nova variação
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <View className="px-6 pb-10 bg-background">
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving || isUploading}
            className="bg-primary flex-row items-center justify-center rounded-2xl py-5 shadow-lg shadow-orange-500/40"
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="content-save-outline"
                  size={24}
                  color="white"
                />
                <Text className="ml-2 font-bold text-white text-lg">
                  {initialData ? 'Salvar Alterações' : 'Criar Produto'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
