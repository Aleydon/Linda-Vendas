import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { FormField } from '@/components/FormField';
import { CategoryPicker } from '@/components/product/CategoryPicker';
import { ProductImagePicker } from '@/components/product/ProductImagePicker';
import { VariationSection } from '@/components/product/VariationSection';
import { Product, useAppContext } from '@/context/AppContext';
import { useProductForm } from '@/hooks/useProductForm';

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
  const {
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
  } = useProductForm({ initialData, onSubmit });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View className="bg-background flex-1">
        {/* Header */}
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
          contentContainerStyle={{ paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-6 py-4">
            <ProductImagePicker
              imageUrl={imageUrl}
              isUploading={isUploading}
              onPickImage={pickImage}
              isStocked={initialData ? initialData.stock > 0 : undefined}
            />

            <View className="mt-8">
              <View className="mb-4">
                <FormField
                  label="Nome do Produto"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <CategoryPicker
                categories={categories}
                selectedCategoryId={categoryId}
                onSelectCategory={setCategoryId}
                showDropdown={showCategoryDropdown}
                setShowDropdown={setShowCategoryDropdown}
              />

              {!hasVariations && (
                <View>
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
                </View>
              )}

              <VariationSection
                hasVariations={hasVariations}
                onToggleVariations={setHasVariations}
                variations={variations}
                onAddVariation={addVariation}
                onRemoveVariation={removeVariation}
                onUpdateVariation={updateVariation}
                onVariationPriceChange={handleVariationPriceChange}
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer Button */}
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
