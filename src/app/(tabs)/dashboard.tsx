import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { useAppContext } from '@/context/AppContext';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { formatCurrency } from '@/utils/formatters';

export function Dashboard() {
  const router = useRouter();
  const { sales, products, loading, colorScheme } = useAppContext();
  const metrics = useDashboardMetrics(sales, products);

  if (loading) {
    return (
      <View className="bg-background dark:bg-zinc-950 flex-1 items-center justify-center">
        <Loading />
      </View>
    );
  }

  return (
    <View className="bg-background dark:bg-zinc-950 flex-1">
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-6 py-4">
          {/* Main Card: Faturamento */}
          <Animated.View
            entering={FadeInDown.duration(600)}
            className="bg-[#065F46] dark:bg-emerald-900 rounded-[32px] p-8 shadow-xl shadow-emerald-950/30 mb-8"
          >
            <View className="flex-row justify-between items-center mb-4">
              <View className="bg-white/20 p-2 rounded-2xl">
                <MaterialCommunityIcons
                  name="wallet-outline"
                  size={24}
                  color="white"
                />
              </View>
              <View className="bg-white/20 px-3 py-1 rounded-full">
                <Text className="text-white text-[10px] font-bold uppercase tracking-wider">
                  Hoje
                </Text>
              </View>
            </View>

            <Text className="text-white/70 font-bold text-xs uppercase tracking-widest">
              Faturamento Total
            </Text>
            <Text className="text-white font-bold text-5xl my-1">
              {formatCurrency(metrics.todaySales)}
            </Text>

            <View className="flex-row items-center mt-4">
              <View
                className={`flex-row items-center px-2 py-1 rounded-lg ${metrics.percentageChange >= 0 ? 'bg-green-400/20' : 'bg-red-400/20'}`}
              >
                <MaterialCommunityIcons
                  name={
                    metrics.percentageChange >= 0 ? 'arrow-up' : 'arrow-down'
                  }
                  size={14}
                  color={metrics.percentageChange >= 0 ? '#4ade80' : '#f87171'}
                />
                <Text
                  className={`ml-1 font-bold text-xs ${metrics.percentageChange >= 0 ? 'text-green-400' : 'text-red-400'}`}
                >
                  {Math.abs(metrics.percentageChange).toFixed(0)}%
                </Text>
              </View>
              <Text className="ml-3 text-white/60 text-xs font-medium">
                em relação a ontem
              </Text>
            </View>
          </Animated.View>

          {/* Top 5 Products Section */}
          <View className="mb-8">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-text-primary dark:text-zinc-100 font-bold text-xl">
                Top 5 Produtos
              </Text>
              <TouchableOpacity onPress={() => router.push('/history')}>
                <Text className="text-primary dark:text-orange-400 font-bold text-sm">
                  Histórico
                </Text>
              </TouchableOpacity>
            </View>

            <View className="bg-white dark:bg-zinc-900 rounded-[32px] p-2 border border-secondary/20 dark:border-zinc-800 shadow-sm">
              {metrics.topProducts.length > 0 ? (
                metrics.topProducts.map((item, index) => (
                  <View
                    key={item.name}
                    className={`flex-row items-center p-4 ${index !== metrics.topProducts.length - 1 ? 'border-b border-secondary/5 dark:border-zinc-800/50' : ''}`}
                  >
                    <View className="bg-secondary/30 dark:bg-zinc-800 h-10 w-10 items-center justify-center rounded-2xl mr-4">
                      <Text className="text-primary dark:text-orange-400 font-bold">
                        {index + 1}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-text-primary dark:text-zinc-100 font-bold text-sm"
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text className="text-text-muted dark:text-zinc-500 text-[10px] uppercase font-medium">
                        {item.quantity} unidades vendidas
                      </Text>
                    </View>
                    <Text className="text-primary dark:text-orange-400 font-bold text-sm">
                      {formatCurrency(item.total)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text className="text-text-secondary dark:text-zinc-500 italic text-center py-8">
                  Nenhuma venda registrada ainda.
                </Text>
              )}
            </View>
          </View>

          {/* Categories Grid */}
          <View className="mb-8">
            <Text className="text-text-primary dark:text-zinc-100 font-bold text-xl mb-4">
              Categorias em Destaque
            </Text>
            <View className="flex-row flex-wrap gap-4">
              {metrics.topCategories.map(item => (
                <View
                  key={item.name}
                  className="bg-white dark:bg-zinc-900 p-5 rounded-[28px] border border-secondary/20 dark:border-zinc-800 shadow-sm w-[47%]"
                >
                  <View className="bg-secondary/40 dark:bg-zinc-800 self-start p-3 rounded-2xl mb-3">
                    <MaterialCommunityIcons
                      name="tag-outline"
                      size={20}
                      color={colorScheme === 'dark' ? '#fb923c' : '#A34211'}
                    />
                  </View>
                  <Text
                    className="text-text-primary dark:text-zinc-100 font-bold text-sm mb-1"
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text className="text-primary dark:text-orange-400 font-bold text-lg">
                    {formatCurrency(item.total)}
                  </Text>
                  <Text className="text-text-muted dark:text-zinc-500 text-[10px] uppercase mt-1">
                    {item.quantity} vendas
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Low Stock Warning */}
          <View>
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-text-primary dark:text-zinc-100 font-bold text-xl px-2 py-1">
                Atenção ao Estoque
              </Text>
              <TouchableOpacity onPress={() => router.push('/stock')}>
                <Text className="text-primary dark:text-orange-400 font-bold text-sm">
                  Repor Agora
                </Text>
              </TouchableOpacity>
            </View>

            <View className="bg-white dark:bg-zinc-900 rounded-[32px] p-2 border border-secondary/20 dark:border-zinc-800 shadow-sm">
              {metrics.lowStockItems.map((item, index) => (
                <View
                  key={item.id}
                  className={`flex-row items-center p-4 ${index !== metrics.lowStockItems.length - 1 ? 'border-b border-secondary/5 dark:border-zinc-800/50' : ''}`}
                >
                  <View
                    className={`h-10 w-10 items-center justify-center rounded-2xl mr-4 ${
                      item.stock <= 5
                        ? 'bg-red-50 dark:bg-red-900/20'
                        : 'bg-teal-50 dark:bg-teal-900/20'
                    }`}
                  >
                    <MaterialCommunityIcons
                      name={
                        item.stock <= 5 ? 'alert-outline' : 'package-variant'
                      }
                      size={20}
                      color={item.stock <= 5 ? '#ef4444' : '#0d9488'}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-text-primary dark:text-zinc-100 font-bold text-sm"
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text className="text-text-muted dark:text-zinc-500 text-[10px] uppercase font-medium">
                      {item.category || 'Sem Categoria'}
                    </Text>
                  </View>
                  <View
                    className={`px-3 py-1 rounded-full ${
                      item.stock <= 5
                        ? 'bg-red-50 dark:bg-red-900/30'
                        : 'bg-teal-50 dark:bg-teal-900/30'
                    }`}
                  >
                    <Text
                      className={`font-bold text-xs ${item.stock <= 5 ? 'text-red-600 dark:text-red-400' : 'text-teal-600 dark:text-teal-400'}`}
                    >
                      {item.stock} un
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default Dashboard;
