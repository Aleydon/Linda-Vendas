import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

import { Sale } from '@/context/AppContext';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { getCategoryIcon } from '@/utils/icons';

interface HistoryItemProps {
  sale: Sale;
}

export function HistoryItem({ sale }: HistoryItemProps) {
  const timeStr = formatDateTime(sale.created_at);

  return (
    <View className="border-secondary overflow-hidden rounded-3xl border bg-white shadow-sm">
      <View className="border-secondary flex-row items-center justify-between border-b bg-gray-50/50 px-5 py-3">
        <View className="flex-row items-center">
          <MaterialCommunityIcons
            name="clock-outline"
            size={16}
            color="#8C7E7E"
          />
          <Text className="text-text-secondary ml-2 font-bold text-xs uppercase tracking-widest">
            {timeStr}
          </Text>
        </View>
        <View className="flex-row items-baseline">
          <Text className="text-primary font-bold text-base">
            {formatCurrency(sale.total)}
          </Text>
        </View>
      </View>

      <View className="p-5">
        {sale.sale_items?.map((item, index) => {
          const categoryName = item.product?.categories?.name || '';
          const icon = getCategoryIcon(categoryName);

          return (
            <View
              key={item.id}
              className={`flex-row items-center ${
                index !== (sale.sale_items?.length || 0) - 1 ? 'mb-4' : ''
              }`}
            >
              <View className="bg-secondary h-10 w-10 items-center justify-center rounded-xl">
                <MaterialCommunityIcons name={icon} size={20} color="#A34211" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-text-primary font-semibold text-base">
                  {item.product?.name || 'Produto'}
                </Text>
                <View className="flex-row items-center">
                  {categoryName ? (
                    <>
                      <Text className="text-text-secondary text-xs">
                        {categoryName}
                      </Text>
                      <View className="bg-text-secondary/20 mx-1.5 h-1 w-1 rounded-full" />
                    </>
                  ) : null}
                  <Text className="text-text-secondary text-xs">
                    {item.quantity} un × {formatCurrency(item.unit_price)}
                  </Text>
                </View>
              </View>
              <Text className="text-text-primary font-bold text-base">
                {formatCurrency(item.quantity * Number(item.unit_price))}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
