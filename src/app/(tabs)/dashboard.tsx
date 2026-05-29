import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { Header } from '@/components/Header';
import { HistoryItem } from '@/components/HistoryItem';
import { useAppContext } from '@/context/AppContext';
import { formatCurrency } from '@/utils/formatters';

export function Dashboard() {
  const router = useRouter();
  const { sales } = useAppContext();

  const { todaySales, percentageChange, recentSales } = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todaySalesData = sales.filter(s => new Date(s.created_at) >= today);
    const yesterdaySalesData = sales.filter(s => {
      const date = new Date(s.created_at);
      return date >= yesterday && date < today;
    });

    const tTotalSales = todaySalesData.reduce((acc, s) => acc + s.total, 0);
    const yTotalSales = yesterdaySalesData.reduce((acc, s) => acc + s.total, 0);

    let pChange = 0;
    if (yTotalSales > 0) {
      pChange = ((tTotalSales - yTotalSales) / yTotalSales) * 100;
    } else if (tTotalSales > 0) {
      pChange = 100;
    }

    const rSales = sales.slice(0, 5);

    return {
      todaySales: tTotalSales,
      percentageChange: pChange,
      recentSales: rSales
    };
  }, [sales]);

  return (
    <View className="bg-background flex-1">
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-6 py-4">
          {/* Sales Summary Card */}
          <View className="bg-primary rounded-3xl p-6 shadow-lg shadow-orange-500/20 mb-6">
            <Text className="text-white/80 font-bold text-xs uppercase tracking-widest">
              Vendas Hoje
            </Text>
            <View className="my-2 flex-row items-baseline">
              <Text className="text-white font-bold text-4xl">
                {formatCurrency(todaySales)}
              </Text>
            </View>
            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name={percentageChange >= 0 ? 'trending-up' : 'trending-down'}
                size={20}
                color="white"
              />
              <Text className="ml-1 font-medium text-white/90 text-sm">
                {percentageChange >= 0 ? '+' : ''}
                {percentageChange.toFixed(0)}% em relação a ontem
              </Text>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/new-sale')}
            className="bg-teal-600 flex-row items-center justify-center rounded-2xl py-5 shadow-sm mb-10"
          >
            <MaterialCommunityIcons name="cart-plus" size={24} color="white" />
            <Text className="ml-2 font-bold text-white text-lg">
              Nova Venda
            </Text>
          </TouchableOpacity>

          {/* Recent Sales Section */}
          <View>
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-text-primary font-bold text-xl">
                Últimas Vendas
              </Text>
              <TouchableOpacity onPress={() => router.push('/history')}>
                <Text className="text-primary font-bold text-sm">
                  Ver todas
                </Text>
              </TouchableOpacity>
            </View>

            <View className="gap-y-4">
              {recentSales.length > 0 ? (
                recentSales.map(sale => (
                  <HistoryItem key={sale.id} sale={sale} showRelativeTime />
                ))
              ) : (
                <View className="items-center py-8">
                  <Text className="text-text-secondary italic">
                    Nenhuma venda registrada ainda.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default Dashboard;
