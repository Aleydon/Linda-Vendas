import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeInDown,
  LinearTransition
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HistoryItem } from '@/components/HistoryItem';
import { SellerGroup, SellerSalesCard } from '@/components/SellerSalesCard';
import { HistorySkeleton } from '@/components/skeletons/HistorySkeleton';
import { Sale, useAppContext } from '@/context/AppContext';
import { formatCurrency, formatDateLong } from '@/utils/formatters';

export default function UserSales() {
  const { user, isAdmin, sales, loading, colorScheme } = useAppContext();
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>(
    'all'
  );

  // If not admin, we only show current user's sales
  const userSales = useMemo(() => {
    if (isAdmin) return sales;
    return sales.filter(sale => sale.user_id === user?.id);
  }, [sales, isAdmin, user?.id]);

  const filteredSales = useMemo(() => {
    if (statusFilter === 'all') return userSales;
    return userSales.filter(sale => sale.status === statusFilter);
  }, [userSales, statusFilter]);

  const paidSales = useMemo(() => {
    return userSales.filter(sale => sale.status !== 'pending');
  }, [userSales]);

  const groupedSales = useMemo(() => {
    const groups: { [key: string]: { sales: Sale[]; total: number } } = {};

    filteredSales.forEach(sale => {
      const label = formatDateLong(sale.created_at);
      if (!groups[label]) {
        groups[label] = { sales: [], total: 0 };
      }
      groups[label].sales.push(sale);
      if (sale.status !== 'pending') {
        groups[label].total += Number(sale.total || 0);
      }
    });

    return Object.entries(groups);
  }, [filteredSales]);

  const totalAmount = useMemo(() => {
    return paidSales.reduce((acc, sale) => acc + Number(sale.total || 0), 0);
  }, [paidSales]);

  const totalPending = useMemo(() => {
    return userSales
      .filter(s => s.status === 'pending')
      .reduce((acc, sale) => acc + Number(sale.total || 0), 0);
  }, [userSales]);

  const salesBySeller = useMemo((): SellerGroup[] => {
    if (!isAdmin) return [];

    const groups: { [key: string]: SellerGroup } = {};

    // Use filteredSales here so the status filter works for admins too
    filteredSales.forEach(sale => {
      const isPaid = sale.status !== 'pending';
      const sellerId = sale.user_id || 'unknown';
      const sellerEmail = sale.seller?.email || 'Sem E-mail';
      const sellerName =
        sale.seller?.pix_name || sellerEmail.split('@')[0] || 'Desconhecido';

      if (!groups[sellerId]) {
        groups[sellerId] = {
          sellerId,
          sellerName,
          sellerEmail,
          sales: [],
          totalAmount: 0,
          totalPending: 0,
          totalItems: 0
        };
      }

      groups[sellerId].sales.push(sale);

      if (isPaid) {
        groups[sellerId].totalAmount += Number(sale.total || 0);
      } else {
        groups[sellerId].totalPending += Number(sale.total || 0);
      }

      const itemsCount =
        sale.sale_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      groups[sellerId].totalItems += itemsCount;
    });

    return Object.values(groups).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [filteredSales, isAdmin]);

  if (loading && userSales.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background dark:bg-zinc-950">
        <View className="px-6 py-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color={colorScheme === 'dark' ? '#F5EBE0' : '#A34211'}
              />
            </TouchableOpacity>
            <Text className="text-text-primary dark:text-zinc-100 text-xl font-bold">
              {isAdmin ? 'Histórico de Vendas' : 'Minhas Vendas'}
            </Text>
          </View>
        </View>
        <HistorySkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-zinc-950">
      <View className="px-6 py-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={colorScheme === 'dark' ? '#F5EBE0' : '#A34211'}
            />
          </TouchableOpacity>
          <Text className="text-text-primary dark:text-zinc-100 text-xl font-bold">
            {isAdmin ? 'Histórico de Vendas' : 'Minhas Vendas'}
          </Text>
        </View>
        <View className="bg-category-chip dark:bg-zinc-800 rounded-full px-chip-x py-chip-y">
          <Text className="text-primary dark:text-orange-400 font-bold text-chip">
            {filteredSales.length}
          </Text>
        </View>
      </View>

      <View className="flex-row px-6 mb-4 gap-2">
        {(['all', 'paid', 'pending'] as const).map(status => (
          <TouchableOpacity
            key={status}
            onPress={() => setStatusFilter(status)}
            className={`rounded-full border px-chip-x py-chip-y ${
              statusFilter === status
                ? 'bg-category-chip-active border-category-chip-active dark:bg-orange-600 dark:border-orange-600'
                : 'bg-category-chip border-secondary dark:bg-zinc-800 dark:border-zinc-800'
            }`}
          >
            <Text
              className={`text-chip font-bold ${
                statusFilter === status
                  ? 'text-white'
                  : 'text-text-secondary dark:text-zinc-400'
              }`}
            >
              {status === 'all'
                ? 'Todas'
                : status === 'paid'
                  ? 'Pagas'
                  : 'Pendentes'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="p-card">
          <View className="flex-row gap-4 mb-8">
            <View className="flex-1 bg-white dark:bg-zinc-900 rounded-[32px] p-5 border border-secondary/20 dark:border-zinc-800 shadow-sm">
              <Text className="text-primary dark:text-orange-400 text-[10px] uppercase font-bold tracking-widest mb-1">
                {isAdmin
                  ? 'Faturamento Total Acumulado'
                  : 'Total Pago Acumulado'}
              </Text>
              <Text className="text-[#22c55e] dark:text-emerald-400 font-bold text-xl">
                {formatCurrency(totalAmount)}
              </Text>
            </View>

            {totalPending > 0 && (
              <View className="flex-1 bg-white dark:bg-zinc-900 rounded-[32px] p-5 border border-orange-100 dark:border-orange-900/20 shadow-sm">
                <Text className="text-orange-500 text-[10px] uppercase font-bold tracking-widest mb-1">
                  Pendente (Fiado)
                </Text>
                <Text className="text-orange-600 dark:text-orange-400 font-bold text-xl">
                  {formatCurrency(totalPending)}
                </Text>
              </View>
            )}
          </View>

          {isAdmin ? (
            salesBySeller.length > 0 ? (
              salesBySeller.map(group => (
                <SellerSalesCard
                  key={group.sellerId}
                  group={group}
                  isInitiallyExpanded={false}
                />
              ))
            ) : (
              <View className="items-center py-20">
                <MaterialCommunityIcons
                  name="cart-off"
                  size={48}
                  color={colorScheme === 'dark' ? '#3f3f46' : '#BDB2B2'}
                />
                <Text className="text-text-secondary dark:text-zinc-500 mt-4 text-center text-lg italic">
                  Nenhuma venda encontrada com este filtro.
                </Text>
              </View>
            )
          ) : groupedSales.length > 0 ? (
            groupedSales.map(([date, data]) => (
              <View key={date} className="mb-8">
                <Text className="text-text-secondary dark:text-zinc-500 font-bold text-xs uppercase tracking-widest mb-4">
                  {date}
                </Text>
                <Animated.View layout={LinearTransition} className="gap-y-4">
                  {data.sales.map((sale, index) => (
                    <Animated.View
                      key={sale.id}
                      entering={FadeInDown.delay(index * 35).duration(300)}
                      layout={LinearTransition}
                    >
                      <HistoryItem
                        key={sale.id}
                        sale={sale}
                        isInitiallyExpanded={index === 0}
                      />
                    </Animated.View>
                  ))}
                </Animated.View>
              </View>
            ))
          ) : (
            <View className="items-center py-20">
              <MaterialCommunityIcons
                name="cart-off"
                size={48}
                color={colorScheme === 'dark' ? '#3f3f46' : '#BDB2B2'}
              />
              <Text className="text-text-secondary dark:text-zinc-500 mt-4 text-center text-lg italic">
                {statusFilter === 'all'
                  ? 'Você ainda não realizou nenhuma venda.'
                  : statusFilter === 'paid'
                    ? 'Nenhuma venda paga encontrada.'
                    : 'Nenhuma venda pendente encontrada.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
