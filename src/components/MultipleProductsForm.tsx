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
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { FormField } from '@/components/FormField';
import { CategoryPicker } from '@/components/product/CategoryPicker';
import { ProductImagePicker } from '@/components/product/ProductImagePicker';
import { VariationSection } from '@/components/product/VariationSection';
import { Product, useAppContext } from '@/context/AppContext';
import { useMultipleProductsForm } from '@/hooks/useMultipleProductsForm';

interface MultipleProductsFormProps {
  onSubmit: (
    data: Omit<Product, 'id' | 'outOfStock' | 'category'>[]
  ) => Promise<void> | void;
  title: string;
}

export function MultipleProductsForm({
  onSubmit,
  title
}: MultipleProductsFormProps): React.JSX.Element {
  const router = useRouter();
  const { categories, colorScheme } = useAppContext();
  const {
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
  } = useMultipleProductsForm({ onSubmit });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <View className="bg-background dark:bg-zinc-950 flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pb-4 pt-12">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <MaterialCommunityIcons
              name="arrow-left"
              size={28}
              color={colorScheme === 'dark' ? '#F5EBE0' : '#3C2F2F'}
            />
          </TouchableOpacity>
          <Text className="text-text-primary dark:text-zinc-100 font-bold text-xl">
            {title}
          </Text>
          <View className="border-secondary dark:border-zinc-800 bg-secondary dark:bg-zinc-800 h-10 w-10 items-center justify-center overflow-hidden rounded-full border">
            <MaterialCommunityIcons
              name="plus"
              size={22}
              color={colorScheme === 'dark' ? '#fb923c' : '#A34211'}
            />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-6 py-4">
            {productsList.map((product, index) => {
              const isUploading = uploadingId === product.id;

              return (
                <View
                  key={product.id}
                  className="mb-6 border border-secondary dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900 overflow-hidden shadow-sm"
                >
                  {/* Collapsible Header */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => toggleProductExpand(product.id)}
                    className="flex-row items-center justify-between bg-secondary/10 dark:bg-zinc-800/40 px-5 py-4 border-b border-secondary/10 dark:border-zinc-800"
                  >
                    <View className="flex-row items-center flex-1">
                      <View className="bg-primary/10 dark:bg-orange-500/10 rounded-full h-7 w-7 items-center justify-center mr-3">
                        <Text className="text-primary dark:text-orange-400 font-bold text-xs">
                          {index + 1}
                        </Text>
                      </View>
                      <Text
                        className="text-text-primary dark:text-zinc-100 font-bold text-base flex-1 mr-2"
                        numberOfLines={1}
                      >
                        {product.name || `Produto ${index + 1}`}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      {productsList.length > 1 && (
                        <TouchableOpacity
                          onPress={() => removeProductForm(product.id)}
                          className="mr-3 p-1"
                        >
                          <MaterialCommunityIcons
                            name="trash-can-outline"
                            size={20}
                            color="#EF4444"
                          />
                        </TouchableOpacity>
                      )}
                      <MaterialCommunityIcons
                        name={
                          product.isExpanded ? 'chevron-up' : 'chevron-down'
                        }
                        size={22}
                        color={colorScheme === 'dark' ? '#fb923c' : '#A34211'}
                      />
                    </View>
                  </TouchableOpacity>

                  {/* Fields Section */}
                  {product.isExpanded && (
                    <Animated.View
                      entering={FadeIn.duration(200)}
                      exiting={FadeOut.duration(150)}
                      className="p-5"
                    >
                      <ProductImagePicker
                        imageUrl={product.imageUrl}
                        isUploading={isUploading}
                        onPickImage={() => pickImage(product.id)}
                      />

                      <View className="mt-6">
                        <View className="mb-4">
                          <FormField
                            label="Nome do Produto"
                            value={product.name}
                            onChangeText={val =>
                              updateProductField(product.id, 'name', val)
                            }
                          />
                        </View>

                        <CategoryPicker
                          categories={categories}
                          selectedCategoryId={product.category_id}
                          onSelectCategory={val =>
                            updateProductField(product.id, 'category_id', val)
                          }
                          showDropdown={activeCategoryDropdownId === product.id}
                          setShowDropdown={show =>
                            setActiveCategoryDropdownId(
                              show ? product.id : null
                            )
                          }
                        />

                        {!product.has_variations && (
                          <View className="mt-4">
                            <FormField
                              label="Preço de Venda (R$)"
                              value={product.price}
                              onChangeText={val =>
                                handlePriceChange(product.id, val)
                              }
                              keyboardType="numeric"
                              placeholder="0,00"
                            />
                            <FormField
                              label="Estoque Inicial"
                              value={product.stock}
                              onChangeText={val =>
                                updateProductField(product.id, 'stock', val)
                              }
                              keyboardType="numeric"
                            />
                          </View>
                        )}

                        <VariationSection
                          hasVariations={product.has_variations}
                          onToggleVariations={val =>
                            updateProductField(
                              product.id,
                              'has_variations',
                              val
                            )
                          }
                          variations={product.variations}
                          onAddVariation={() => addVariation(product.id)}
                          onRemoveVariation={varId =>
                            removeVariation(product.id, varId)
                          }
                          onUpdateVariation={(varId, field, val) =>
                            updateVariationField(product.id, varId, field, val)
                          }
                          onVariationPriceChange={(varId, val) =>
                            handleVariationPriceChange(product.id, varId, val)
                          }
                        />
                      </View>
                    </Animated.View>
                  )}
                </View>
              );
            })}

            {/* Add More Button */}
            <TouchableOpacity
              onPress={addProductForm}
              className="border-2 border-dashed border-primary/40 dark:border-orange-500/40 bg-secondary/5 dark:bg-zinc-900 rounded-3xl py-4 flex-row items-center justify-center mb-8"
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="plus-circle-outline"
                size={22}
                color={colorScheme === 'dark' ? '#fb923c' : '#A34211'}
              />
              <Text className="text-primary dark:text-orange-400 font-bold ml-2 text-base">
                Adicionar mais produtos
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Footer Save Button */}
        <View className="px-6 pb-10 bg-background dark:bg-zinc-950">
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving}
            className="bg-primary dark:bg-orange-600 flex-row items-center justify-center rounded-2xl py-5 shadow-lg shadow-orange-500/40"
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="content-save-all-outline"
                  size={24}
                  color="white"
                />
                <Text className="ml-2 font-bold text-white text-lg">
                  {productsList.length > 1
                    ? `Salvar todos os ${productsList.length} produtos`
                    : 'Salvar Produto'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
export default MultipleProductsForm;
