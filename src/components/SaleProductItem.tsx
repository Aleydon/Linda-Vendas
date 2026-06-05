import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { Product } from '@/context/AppContext';
import { formatCurrency } from '@/utils/formatters';

interface SaleProductItemProps {
  item: Product;
  cart: { productId: string; variationId?: string; quantity: number }[];
  onUpdateQuantity: (
    productId: string,
    delta: number,
    variationId?: string
  ) => void;
  searchQuery?: string;
}

export function SaleProductItem({
  item,
  cart,
  onUpdateQuantity,
  searchQuery = ''
}: SaleProductItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-expand if search matches a variation
  useEffect(() => {
    if (searchQuery.length >= 2 && item.has_variations) {
      const lowerQuery = searchQuery.toLowerCase();
      const hasMatch = item.variations?.some(v =>
        v.name.toLowerCase().includes(lowerQuery)
      );
      if (hasMatch) {
        setIsExpanded(true);
      }
    }
  }, [searchQuery, item]);

  const getQuantity = (variationId?: string) => {
    const found = cart.find(
      c => c.productId === item.id && c.variationId === variationId
    );
    return found?.quantity || 0;
  };

  return (
    <View className="mb-4">
      <TouchableOpacity
        activeOpacity={item.has_variations ? 0.7 : 1}
        onPress={() => item.has_variations && setIsExpanded(!isExpanded)}
        className="border-secondary bg-white flex-row items-center rounded-2xl border p-4 shadow-sm"
      >
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
          {!item.has_variations ? (
            <>
              <Text className="text-primary font-bold text-lg">
                {formatCurrency(item.price)}
              </Text>
              <Text className="text-text-secondary text-xs">
                Estoque: {item.stock} un
              </Text>
            </>
          ) : (
            <View className="flex-row items-center mt-1">
              <Text className="text-primary text-[10px] font-bold uppercase mr-1">
                {item.variations?.length || 0} Variações
              </Text>
              <MaterialCommunityIcons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={14}
                color="#A34211"
              />
            </View>
          )}
        </View>

        {!item.has_variations && (
          <View className="flex-row items-center rounded-xl bg-secondary px-2 py-1">
            <TouchableOpacity
              onPress={() => onUpdateQuantity(item.id, -1)}
              className="p-1"
            >
              <MaterialCommunityIcons name="minus" size={20} color="#A34211" />
            </TouchableOpacity>
            <Text className="text-text-primary mx-2 font-bold text-base">
              {getQuantity()}
            </Text>
            <TouchableOpacity
              onPress={() => onUpdateQuantity(item.id, 1)}
              className="p-1"
            >
              <MaterialCommunityIcons name="plus" size={20} color="#A34211" />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>

      {item.has_variations && isExpanded && item.variations && (
        <View className="bg-secondary/10 mx-2 -mt-2 rounded-b-2xl px-4 pb-4 pt-4 border-x border-b border-secondary/20">
          {item.variations.map(v => (
            <View
              key={v.id}
              className="flex-row items-center justify-between py-3 border-b border-secondary/10 last:border-b-0"
            >
              <View className="flex-1 mr-4">
                <Text className="text-text-primary font-medium text-base">
                  {v.name}
                </Text>
                <Text className="text-primary font-bold text-base">
                  {formatCurrency(v.price)}
                </Text>
                <Text className="text-text-muted text-sm">
                  Estoque: {v.stock} un
                </Text>
              </View>

              <View
                className={`flex-row items-center rounded-xl bg-white border border-secondary/30 px-2 py-1 ${
                  v.stock <= 0 ? 'opacity-50' : ''
                }`}
              >
                <TouchableOpacity
                  onPress={() => onUpdateQuantity(item.id, -1, v.id)}
                  disabled={v.stock <= 0}
                  className="p-1"
                >
                  <MaterialCommunityIcons
                    name="minus"
                    size={18}
                    color="#A34211"
                  />
                </TouchableOpacity>
                <Text className="text-text-primary mx-2 font-bold text-sm">
                  {getQuantity(v.id)}
                </Text>
                <TouchableOpacity
                  onPress={() => onUpdateQuantity(item.id, 1, v.id)}
                  disabled={v.stock <= 0 || getQuantity(v.id) >= v.stock}
                  className="p-1"
                >
                  <MaterialCommunityIcons
                    name="plus"
                    size={18}
                    color={
                      v.stock <= 0 || getQuantity(v.id) >= v.stock
                        ? '#BDB2B2'
                        : '#A34211'
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
