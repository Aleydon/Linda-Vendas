import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Variation } from '@/context/types';
import { formatCurrency } from '@/utils/formatters';

interface ProductCardProps {
  name: string;
  description?: string;
  price: string;
  stock: number;
  imageUrl?: string;
  outOfStock?: boolean;
  has_variations?: boolean;
  variations?: Variation[];
}

export function ProductCard({
  name,
  description,
  price,
  stock,
  imageUrl,
  outOfStock,
  has_variations,
  variations
}: ProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalStock =
    has_variations && variations
      ? variations.reduce((acc, v) => acc + v.stock, 0)
      : stock;

  const displayPrice =
    has_variations && variations && variations.length > 0
      ? formatCurrency(Math.min(...variations.map(v => v.price)))
      : `R$ ${price}`;

  return (
    <View className="mb-2">
      <TouchableOpacity
        activeOpacity={has_variations ? 0.7 : 1}
        onPress={() => has_variations && setIsExpanded(!isExpanded)}
        className="border-secondary dark:border-zinc-800 bg-surface dark:bg-zinc-900 flex-row items-center rounded-2xl border p-2"
      >
        <View className="bg-secondary dark:bg-zinc-800 h-20 w-20 items-center justify-center overflow-hidden rounded-xl">
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <MaterialCommunityIcons
              name="image-outline"
              size={32}
              color="#BDB2B2"
            />
          )}
          {outOfStock && (
            <View className="absolute inset-0 items-center justify-center bg-black/40">
              <Text className="px-1 text-center font-bold text-[8px] uppercase text-white">
                Fora de Estoque
              </Text>
            </View>
          )}
        </View>

        <View className="ml-4 flex-1">
          <Text className="text-text-primary dark:text-zinc-100 font-semibold text-base">
            {name}
          </Text>

          {description && (
            <Text
              className="text-text-secondary dark:text-zinc-400 text-xs mt-0.5"
              numberOfLines={2}
            >
              {description}
            </Text>
          )}

          <View className="mt-1 flex-row items-center justify-between">
            <View>
              {has_variations && (
                <Text className="text-text-secondary dark:text-zinc-400 text-[10px] font-medium uppercase">
                  A partir de
                </Text>
              )}
              <Text className="text-primary dark:text-orange-400 font-bold text-lg">
                {displayPrice}
              </Text>
            </View>

            {has_variations ? (
              <View className="items-center">
                <View className="bg-secondary dark:bg-zinc-800 rounded-full px-2 py-0.5 mb-1">
                  <Text className="text-text-secondary dark:text-zinc-400 font-medium text-[10px]">
                    Estoque: {totalStock.toString().padStart(2, '0')} un
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#A34211"
                />
              </View>
            ) : (
              <View
                className={`rounded-full px-2 py-0.5 ${
                  outOfStock
                    ? 'bg-secondary dark:bg-zinc-800'
                    : 'bg-badge-success dark:bg-emerald-900/30'
                }`}
              >
                <Text className="text-text-secondary dark:text-zinc-400 font-medium text-[10px]">
                  Estoque: {totalStock.toString().padStart(2, '0')} un
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {has_variations && isExpanded && variations && (
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          className="bg-secondary/30 dark:bg-zinc-800/20 -mt-[1.5px] rounded-b-2xl rounded-t-xl px-4 pb-4 pt-4 border-x border-b border-secondary dark:border-zinc-800"
        >
          {variations.map((v, index) => (
            <View
              key={v.id || index}
              className="flex-row items-center justify-between py-2 border-b border-secondary/50 dark:border-zinc-800/50 last:border-b-0"
            >
              <Text className="text-text-primary dark:text-zinc-100 font-medium flex-1">
                {v.name}
              </Text>
              <View className="flex-row items-center">
                <Text className="text-primary dark:text-orange-400 font-bold mr-4">
                  {formatCurrency(v.price)}
                </Text>
                <View className="bg-white dark:bg-zinc-900 rounded-full px-2 py-0.5 border border-secondary dark:border-zinc-800">
                  <Text className="text-text-secondary dark:text-zinc-400 text-[10px]">
                    {v.stock} un
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </Animated.View>
      )}
    </View>
  );
}
