import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, View } from 'react-native';

interface ProductCardProps {
  name: string;
  price: string;
  stock: number;
  imageUrl?: string;
  outOfStock?: boolean;
}

export function ProductCard({
  name,
  price,
  stock,
  imageUrl,
  outOfStock
}: ProductCardProps) {
  return (
    <View className="border-secondary bg-surface flex-row items-center rounded-2xl border p-4 mb-2">
      <View className="bg-secondary h-20 w-20 items-center justify-center overflow-hidden rounded-xl">
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
        <Text
          className="text-text-primary font-semibold text-base"
          numberOfLines={1}
        >
          {name}
        </Text>
        <View className="mt-1 flex-row items-center">
          <Text className="text-primary font-bold text-lg">R$ {price}</Text>
          <View
            className={`ml-3 rounded-full px-2 py-0.5 ${
              outOfStock ? 'bg-secondary' : 'bg-badge-success'
            }`}
          >
            <Text className="text-text-secondary font-medium text-[10px]">
              Estoque: {stock.toString().padStart(2, '0')} un
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
