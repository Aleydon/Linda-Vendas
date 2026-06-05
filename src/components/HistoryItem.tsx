import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Sale } from '@/context/AppContext';
import { formatCurrency, formatDateTime } from '@/utils/formatters';

interface HistoryItemProps {
  sale: Sale;
  isInitiallyExpanded?: boolean;
}

export function HistoryItem({
  sale,
  isInitiallyExpanded = false
}: HistoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);

  // Calculate total from items if sale.total is missing or 0
  const calculatedTotal = useMemo(() => {
    if (sale.total && sale.total > 0) return Number(sale.total);

    return (
      sale.sale_items?.reduce((acc, item) => {
        return acc + item.quantity * Number(item.unit_price);
      }, 0) || 0
    );
  }, [sale.total, sale.sale_items]);

  // Format date and time for the header
  const dateObj = new Date(sale.created_at);
  const timeStr = formatDateTime(sale.created_at);
  const dateStr = dateObj
    .toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    })
    .replace('.', '');

  return (
    <View className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-secondary/20">
      <Pressable onPress={() => setIsExpanded(!isExpanded)} className="p-4">
        {/* Header: Status, Total, and Date/Icon */}
        <View className="flex-row items-center justify-between">
          <View className="rounded-2xl flex-row items-center">
            <MaterialCommunityIcons
              name="cart-outline"
              size={25}
              color="#A34211"
            />
            <View className="flex-row items-center pl-2">
              <View className="items-start">
                <Text className="text-text-secondary font-bold text-[10px] uppercase tracking-wider">
                  {timeStr}
                </Text>
                <Text className="text-text-muted text-[10px] uppercase font-medium">
                  {dateStr}
                </Text>
              </View>
            </View>
          </View>

          <View className="items-end">
            <Text className="text-green-500 font-bold text-[10px] uppercase mb-0.5">
              Concluída
            </Text>
            <Text className="text-primary font-bold text-2xl">
              {formatCurrency(calculatedTotal)}
            </Text>
          </View>
        </View>

        {/* Expansion indicator (Optional, keeping it subtle) */}
        <View className="absolute bottom-1 left-1/2 -ml-3">
          <MaterialCommunityIcons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#BDB2B2"
          />
        </View>
      </Pressable>

      {/* Expandable Content */}
      {isExpanded && (
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          className="px-6 pb-4"
        >
          <View className="h-[1px] bg-secondary/10 w-full mb-2" />

          {/* Sale Items */}
          <View className="gap-y-3">
            {sale.sale_items?.map(item => {
              const variationName = item.variation?.name;
              const displayName = variationName
                ? `• ${variationName}`
                : item.product?.name || 'Produto';

              const itemTotal = item.quantity * Number(item.unit_price);

              return (
                <View
                  key={item.id}
                  className="flex-row items-center justify-between"
                >
                  <View className="flex-1 mr-4">
                    <Text
                      className="text-text-primary font-bold text-base"
                      numberOfLines={1}
                    >
                      {displayName}
                    </Text>

                    <View className="flex-row items-center mt-0.5">
                      <Text className="text-text-secondary text-xs">
                        {item.quantity} un x {formatCurrency(item.unit_price)}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-text-primary font-bold text-base">
                    {formatCurrency(itemTotal)}
                  </Text>
                </View>
              );
            })}
          </View>

          <View className="h-[1px] bg-secondary/10 w-full my-4" />

          {/* Detailed Footer */}
          <View className="flex-row justify-between items-center">
            <Text className="text-[9px] text-text-muted font-mono uppercase">
              ID: {sale.id.slice(0, 8)}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-[9px] text-text-muted ml-1 pb-2">
                Registrado em{' '}
                {new Date(sale.created_at).toLocaleDateString('pt-BR')}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
