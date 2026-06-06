import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HistoryItem } from '@/components/HistoryItem';
import { Loading } from '@/components/Loading';
import { Sale, useAppContext } from '@/context/AppContext';
import { formatCurrency, formatDateLong } from '@/utils/formatters';

export default function UserSales() {
  const { user, fetchSalesByUser, colorScheme } = useAppContext();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSalesByUser(user.id).then(data => {
        setSales(data);
        setLoading(false);
      });
    }
  }, [user]);

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

  if (loading) {
    return (
      <View className="bg-background dark:bg-zinc-950 flex-1 items-center justify-center">
        <Loading />
      </View>
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
            Minhas Vendas
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
                Total Acumulado
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

          {groupedSales.length > 0 ? (
            groupedSales.map(([date, data]) => (
              <View key={date} className="mb-8">
                <Text className="text-text-secondary dark:text-zinc-500 font-bold text-xs uppercase tracking-widest mb-4">
                  {date}
                </Text>
                <View className="gap-y-4">
                  {data.sales.map((sale, index) => (
                    <HistoryItem
                      key={sale.id}
                      sale={sale}
                      isInitiallyExpanded={index === 0}
                    />
                  ))}
                </View>
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
