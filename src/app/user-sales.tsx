import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
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
import { api } from '@/services/api';
import { formatCurrency, formatDateLong } from '@/utils/formatters';

export default function UserSales() {
  const { user, isAdmin, fetchSalesByUser, colorScheme } = useAppContext();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const loadSales = async () => {
        try {
          setLoading(true);
          const data = isAdmin
            ? await api.fetchSales()
            : await fetchSalesByUser(user.id);
          setSales(data);
        } catch (error) {
          console.error('Error fetching sales:', error);
        } finally {
          setLoading(false);
        }
      };
      void loadSales();
    }
  }, [user, isAdmin]);

  const groupedSales = useMemo(() => {
    const groups: { [key: string]: { sales: Sale[]; total: number } } = {};

    sales.forEach(sale => {
      const label = formatDateLong(sale.created_at);
      if (!groups[label]) {
        groups[label] = { sales: [], total: 0 };
      }
      groups[label].sales.push(sale);
      groups[label].total += Number(sale.total || 0);
    });

    return Object.entries(groups);
  }, [sales]);

  const totalAmount = useMemo(() => {
    return sales.reduce((acc, sale) => acc + Number(sale.total || 0), 0);
  }, [sales]);

  const salesBySeller = useMemo((): SellerGroup[] => {
    if (!isAdmin) return [];

    const groups: { [key: string]: SellerGroup } = {};

    sales.forEach(sale => {
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
          totalItems: 0
        };
      }

      groups[sellerId].sales.push(sale);
      groups[sellerId].totalAmount += Number(sale.total || 0);

      const itemsCount =
        sale.sale_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      groups[sellerId].totalItems += itemsCount;
    });

    return Object.values(groups).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [sales, isAdmin]);

  if (loading && sales.length === 0) {
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
        <View className="bg-secondary dark:bg-zinc-800 px-3 py-1 rounded-full">
          <Text className="text-primary dark:text-orange-400 font-bold">
            {sales.length}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-6">
          <View className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 mb-8 border border-secondary/20 dark:border-zinc-800 shadow-sm flex-row items-center justify-between">
            <View>
              <Text className="text-primary dark:text-orange-400 text-xs uppercase font-bold tracking-widest mb-1">
                {isAdmin ? 'Faturamento Total' : 'Total Acumulado'}
              </Text>
              <Text className="text-[#22c55e] dark:text-emerald-400 font-bold text-3xl">
                {formatCurrency(totalAmount)}
              </Text>
            </View>
            <View className="bg-primary/10 dark:bg-orange-500/10 p-3 rounded-2xl">
              <MaterialCommunityIcons
                name="finance"
                size={32}
                color={colorScheme === 'dark' ? '#fb923c' : '#A34211'}
              />
            </View>
          </View>

          {isAdmin ? (
            salesBySeller.length > 0 ? (
              salesBySeller.map((group, index) => (
                <SellerSalesCard
                  key={group.sellerId}
                  group={group}
                  isInitiallyExpanded={index === 0}
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
                  Nenhuma venda registrada no sistema.
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
                Você ainda não realizou nenhuma venda.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
