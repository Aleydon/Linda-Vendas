import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Product } from '@/context/types';

interface StockProductItemProps {
  product: Product;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isAdmin: boolean;
  colorScheme: 'light' | 'dark';
  onEdit: () => void;
  onDelete: () => void;
}

export function StockProductItem({
  product,
  isExpanded,
  onToggleExpand,
  isAdmin,
  colorScheme,
  onEdit,
  onDelete
}: StockProductItemProps) {
  const totalStock = product.stock;

  return (
    <View className="border-secondary dark:border-zinc-800 rounded-2xl border bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
      <TouchableOpacity
        activeOpacity={product.has_variations ? 0.7 : 1}
        onPress={() => product.has_variations && onToggleExpand()}
        className="flex-row items-center justify-between p-5"
      >
        <View className="flex-1">
          <Text className="text-text-primary dark:text-zinc-100 font-bold text-lg">
            {product.name}
          </Text>
          <Text className="text-text-secondary dark:text-zinc-400 text-sm">
            {product.category || 'Sem Categoria'}
          </Text>
          {product.has_variations && (
            <View className="flex-row items-center mt-1">
              <Text className="text-primary dark:text-orange-400 text-[10px] font-bold uppercase mr-1">
                {product.variations?.length || 0} Variações
              </Text>
              <MaterialCommunityIcons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={colorScheme === 'dark' ? '#fb923c' : '#A34211'}
              />
            </View>
          )}
        </View>

        <View className="items-end">
          <View
            className={`rounded-full px-3 py-1 ${
              totalStock > 10
                ? 'bg-teal-50 dark:bg-teal-900/20'
                : totalStock > 0
                  ? 'bg-orange-50 dark:bg-orange-900/20'
                  : 'bg-red-50 dark:bg-red-900/20'
            }`}
          >
            <Text
              className={`font-bold text-sm ${
                totalStock > 10
                  ? 'text-teal-700 dark:text-teal-400'
                  : totalStock > 0
                    ? 'text-orange-700 dark:text-orange-400'
                    : 'text-red-700 dark:text-red-400'
              }`}
            >
              {totalStock} un
            </Text>
          </View>
          <Text className="text-text-muted dark:text-zinc-500 mt-1 text-[10px] uppercase">
            {totalStock === 0 ? 'Esgotado' : 'Disponível'}
          </Text>
        </View>

        {isAdmin && (
          <View className="ml-4 flex-row">
            <TouchableOpacity
              className="mr-2 rounded-full bg-gray-100 dark:bg-zinc-800 p-2"
              onPress={onEdit}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={20}
                color={colorScheme === 'dark' ? '#fb923c' : '#4B5563'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              className="rounded-full bg-red-50 dark:bg-red-900/30 p-2"
              onPress={onDelete}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={20}
                color="#EF4444"
              />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>

      {product.has_variations &&
        isExpanded &&
        product.variations &&
        product.variations.length > 0 && (
          <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
            className="bg-secondary/10 dark:bg-zinc-800/50 px-5 pb-4 border-t border-secondary/20 dark:border-zinc-800"
          >
            {product.variations.map(v => (
              <View
                key={v.id}
                className="flex-row justify-between py-3 border-b border-secondary/10 dark:border-zinc-700/50 last:border-b-0"
              >
                <Text className="text-text-secondary dark:text-zinc-400 text-sm">
                  {v.name}
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-text-primary dark:text-zinc-100 font-bold text-sm mr-2">
                    {v.stock} un
                  </Text>
                  <View
                    className={`w-2 h-2 rounded-full ${
                      v.stock > 0 ? 'bg-teal-500' : 'bg-red-500'
                    }`}
                  />
                </View>
              </View>
            ))}
          </Animated.View>
        )}
    </View>
  );
}
export default StockProductItem;
