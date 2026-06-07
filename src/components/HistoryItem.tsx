import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Sale, useAppContext } from '@/context/AppContext';
import { formatCurrency, formatDateTime } from '@/utils/formatters';

interface HistoryItemProps {
  sale: Sale;
  isInitiallyExpanded?: boolean;
}

export function HistoryItem({
  sale,
  isInitiallyExpanded = false
}: HistoryItemProps) {
  const { isAdmin, colorScheme } = useAppContext();
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

  const sellerName = sale.seller?.pix_name || sale.seller?.email || 'N/A';

  return (
    <View className="bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden shadow-sm border border-secondary/20 dark:border-zinc-800">
      <Pressable onPress={() => setIsExpanded(!isExpanded)} className="p-4">
        {/* Header: Status, Total, and Date/Icon */}
        <View className="flex-row items-center justify-between">
          <View className="rounded-2xl flex-row items-center flex-1 mr-2">
            <MaterialCommunityIcons
              name="cart-outline"
              size={25}
              color={colorScheme === 'dark' ? '#fb923c' : '#A34211'}
            />
            <View className="flex-row items-center pl-2 flex-1">
              <View className="items-start flex-1">
                <Text className="text-text-secondary dark:text-zinc-400 font-bold text-[10px] uppercase tracking-wider">
                  {timeStr}
                </Text>
                <Text className="text-text-muted dark:text-zinc-500 text-[10px] uppercase font-medium">
                  {dateStr}
                </Text>
                {isAdmin && (
                  <Text
                    className="text-primary dark:text-orange-400 text-[10px] font-bold mt-0.5"
                    numberOfLines={1}
                  >
                    Por: {sellerName}
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View className="items-end">
            <Text className="text-green-500 dark:text-emerald-400 font-bold text-[10px] uppercase mb-0.5">
              Concluída
            </Text>
            <Text className="text-primary dark:text-orange-400 font-bold text-2xl">
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
          <View className="h-[1px] bg-secondary/10 dark:bg-zinc-800 w-full mb-2" />

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
                      className="text-text-primary dark:text-zinc-100 font-bold text-base"
                      numberOfLines={1}
                    >
                      {displayName}
                    </Text>

                    <View className="flex-row items-center mt-0.5">
                      <Text className="text-text-secondary dark:text-zinc-400 text-xs">
                        {item.quantity} un x {formatCurrency(item.unit_price)}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-text-primary dark:text-zinc-100 font-bold text-base">
                    {formatCurrency(itemTotal)}
                  </Text>
                </View>
              );
            })}
          </View>

          {isAdmin && (
            <>
              <View className="h-[1px] bg-secondary/10 dark:bg-zinc-800 w-full my-4" />
              <View className="flex-row items-center justify-between">
                <Text className="text-text-secondary dark:text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
                  Vendedor
                </Text>
                <Text className="text-text-primary dark:text-zinc-200 font-bold text-sm">
                  {sellerName}
                </Text>
              </View>
            </>
          )}

          <View className="h-[1px] bg-secondary/10 dark:bg-zinc-800 w-full my-4" />

          {/* Detailed Footer */}
          <View className="flex-row justify-between items-center">
            <Text className="text-[9px] text-text-muted dark:text-zinc-500 font-mono uppercase">
              ID: {sale.id.slice(0, 8)}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-[9px] text-text-muted dark:text-zinc-500 ml-1 pb-2">
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
