import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { FormField } from '@/components/FormField';
import { Product, useAppContext } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (
    data: Omit<Product, 'id' | 'outOfStock' | 'category'>
  ) => Promise<void> | void;
  title: string;
}

export function ProductForm({
  initialData,
  onSubmit,
  title
}: ProductFormProps): React.JSX.Element {
  const router = useRouter();
  const { categories } = useAppContext();

  const [name, setName] = useState(initialData?.name ?? '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? '');
  const [price, setPrice] = useState(
    initialData ? initialData.price.toFixed(2) : ''
  );
  const [stock, setStock] = useState(
    initialData ? String(initialData.stock) : ''
  );
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? '');
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

  const handleSave = async (): Promise<void> => {
    if (!name || !categoryId || !price || !stock) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setIsSaving(true);
      const numericPrice = parseFloat(price.replace(',', '.')) || 0;
      const numericStock = parseInt(stock, 10) || 0;

      await onSubmit({
        name,
        category_id: categoryId || undefined,
        price: numericPrice,
        stock: numericStock,
        imageUrl
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
                <View className="flex-row flex-wrap gap-2">
                  {categories.map(cat => (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setCategoryId(cat.id)}
                      className={`rounded-xl border px-4 py-2 ${
                        categoryId === cat.id
                          ? 'bg-primary border-primary'
                          : 'bg-white border-secondary'
                      }`}
                    >
                      <Text
                        className={`font-medium ${
                          categoryId === cat.id
                            ? 'text-white'
                            : 'text-text-primary'
                        }`}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <FormField
                label="Preço de Venda (R$)"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />
              <FormField
                label="Estoque Inicial"
                value={stock}
                onChangeText={setStock}
                keyboardType="numeric"
              />
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
