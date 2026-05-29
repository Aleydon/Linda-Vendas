import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { Product } from '@/context/AppContext';
import { formatCurrency } from '@/utils/formatters';

interface SaleProductItemProps {
  item: Product;
  quantity: number;
  onUpdateQuantity: (productId: string, delta: number) => void;
}

export function SaleProductItem({
  item,
  quantity,
  onUpdateQuantity
}: SaleProductItemProps) {
  return (
    <View className="border-secondary bg-white flex-row items-center rounded-2xl border p-4 mb-4">
      <View className="bg-secondary h-16 w-16 items-center justify-center overflow-hidden rounded-xl">
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <MaterialCommunityIcons
            name="image-outline"
            size={24}
            color="#BDB2B2"
          />
        )}
      </View>

      <View className="ml-4 flex-1">
        <Text
          className="text-text-primary font-semibold text-base"
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text className="text-primary font-bold text-lg">
          {formatCurrency(item.price)}
        </Text>
        <Text className="text-text-secondary text-xs">
          Estoque: {item.stock}
        </Text>
      </View>

      <View className="flex-row items-center rounded-xl bg-secondary px-2 py-1">
        <TouchableOpacity
          onPress={() => onUpdateQuantity(item.id, -1)}
          className="p-1"
        >
          <MaterialCommunityIcons name="minus" size={24} color="#A34211" />
        </TouchableOpacity>
        <Text className="text-text-primary mx-3 font-bold text-base">
          {quantity}
        </Text>
        <TouchableOpacity
          onPress={() => onUpdateQuantity(item.id, 1)}
          className="p-1"
        >
          <MaterialCommunityIcons name="plus" size={24} color="#A34211" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
