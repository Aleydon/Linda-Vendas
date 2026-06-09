import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition
} from 'react-native-reanimated';

import { HistoryItem } from '@/components/HistoryItem';
import { Sale, useAppContext } from '@/context/AppContext';
import { formatCurrency } from '@/utils/formatters';

export interface SellerGroup {
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  sales: Sale[];
  totalAmount: number;
  totalPending: number;
  totalItems: number;
}

interface SellerSalesCardProps {
  group: SellerGroup;
  isInitiallyExpanded?: boolean;
}

export function SellerSalesCard({
  group,
  isInitiallyExpanded = false
}: SellerSalesCardProps) {
  const { colorScheme } = useAppContext();
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);

  const initials = group.sellerName
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <Animated.View
      layout={LinearTransition}
      className="bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden shadow-sm border border-secondary/20 dark:border-zinc-800 mb-4"
    >
      <Pressable
        onPress={() => setIsExpanded(!isExpanded)}
        className="p-5 flex-row items-center justify-between"
      >
        <View className="flex-row items-center flex-1 mr-4">
          {/* Avatar circle with initials */}
          <View className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-orange-500/10 items-center justify-center mr-4">
            <Text className="text-primary dark:text-orange-400 font-bold text-base">
              {initials || '?'}
            </Text>
          </View>

          <View className="flex-1">
            <Text
              className="text-text-primary dark:text-zinc-100 font-bold text-base"
              numberOfLines={1}
            >
              {group.sellerName}
            </Text>
            <Text
              className="text-text-muted dark:text-zinc-500 text-xs mt-0.5"
              numberOfLines={1}
            >
              {group.sellerEmail}
            </Text>
            <Text className="text-text-secondary dark:text-zinc-400 text-xs mt-1 font-semibold">
              {group.sales.length}{' '}
              {group.sales.length === 1 ? 'venda' : 'vendas'} •{' '}
              {group.totalItems} {group.totalItems === 1 ? 'item' : 'itens'}
            </Text>
          </View>
        </View>

        <View className="items-end mr-2">
          <Text className="text-[#22c55e] dark:text-emerald-400 font-bold text-lg">
            {formatCurrency(group.totalAmount)}
          </Text>
          {group.totalPending > 0 && (
            <Text className="text-orange-500 font-bold text-[10px] mt-0.5">
              + {formatCurrency(group.totalPending)} pend.
            </Text>
          )}
        </View>

        <MaterialCommunityIcons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colorScheme === 'dark' ? '#a1a1aa' : '#BDB2B2'}
        />
      </Pressable>

      {isExpanded && (
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          className="px-5 pb-5 pt-2 bg-secondary/5 dark:bg-zinc-950/20"
        >
          <View className="h-[1px] bg-secondary/10 dark:bg-zinc-800 w-full mb-4" />

          <View className="flex-row items-center justify-between mb-3 px-1">
            <Text className="text-text-secondary dark:text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
              Histórico de Vendas
            </Text>
            {group.totalPending > 0 && (
              <View className="bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-md">
                <Text className="text-orange-600 dark:text-orange-400 text-[9px] font-bold">
                  PENDENTE: {formatCurrency(group.totalPending)}
                </Text>
              </View>
            )}
          </View>

          <View className="gap-y-4">
            {group.sales.map(sale => (
              <HistoryItem
                key={sale.id}
                sale={sale}
                isInitiallyExpanded={false}
                hideSeller={true}
              />
            ))}
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
}
