import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { useAppContext } from '@/context/AppContext';
import { formatCurrency } from '@/utils/formatters';

export function Dashboard() {
  const router = useRouter();
  const { sales, products, loading } = useAppContext();

  const metrics = useMemo(() => {
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

    // Top 5 Products/Variations
    const productStats: {
      [key: string]: { name: string; quantity: number; total: number };
    } = {};
    const categoryStats: {
      [key: string]: { name: string; quantity: number; total: number };
    } = {};

    sales.forEach(sale => {
      sale.sale_items?.forEach(item => {
        const prodName = item.product?.name || 'Produto';
        const varName = item.variation?.name;
        const displayName = varName ? `${prodName} (${varName})` : prodName;
        const categoryName = item.product?.categories?.name || 'Sem Categoria';

        // Aggregating products/variations
        if (!productStats[displayName]) {
          productStats[displayName] = {
            name: displayName,
            quantity: 0,
            total: 0
          };
        }
        productStats[displayName].quantity += item.quantity;
        productStats[displayName].total +=
          item.quantity * Number(item.unit_price);

        // Aggregating categories
        if (!categoryStats[categoryName]) {
          categoryStats[categoryName] = {
            name: categoryName,
            quantity: 0,
            total: 0
          };
        }
        categoryStats[categoryName].quantity += item.quantity;
        categoryStats[categoryName].total +=
          item.quantity * Number(item.unit_price);
      });
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const topCategories = Object.values(categoryStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 4);

    // Stock items (filtering only low stock and sorting by lowest)
    const lowStockItems = products
      .filter(p => p.stock <= 10)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);

    return {
      todaySales: tTotalSales,
      percentageChange: pChange,
      topProducts,
      topCategories,
      lowStockItems
    };
  }, [sales, products]);

  if (loading) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Loading />
      </View>
    );
  }

  return (
    <View className="bg-background flex-1">
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-6 py-4">
          {/* Main Card: Faturamento */}
          <Animated.View
            entering={FadeInDown.duration(600)}
            className="bg-[#065F46] rounded-[32px] p-8 shadow-xl shadow-emerald-950/30 mb-8"
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
              <Text className="text-text-primary font-bold text-xl">
                Top 5 Produtos
              </Text>
              <TouchableOpacity onPress={() => router.push('/history')}>
                <Text className="text-primary font-bold text-sm">
                  Histórico
                </Text>
              </TouchableOpacity>
            </View>

            <View className="bg-white rounded-[32px] p-2 border border-secondary/20 shadow-sm">
              {metrics.topProducts.length > 0 ? (
                metrics.topProducts.map((item, index) => (
                  <View
                    key={item.name}
                    className={`flex-row items-center p-4 ${index !== metrics.topProducts.length - 1 ? 'border-b border-secondary/5' : ''}`}
                  >
                    <View className="bg-secondary/30 h-10 w-10 items-center justify-center rounded-2xl mr-4">
                      <Text className="text-primary font-bold">
                        {index + 1}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-text-primary font-bold text-sm"
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text className="text-text-muted text-[10px] uppercase font-medium">
                        {item.quantity} unidades vendidas
                      </Text>
                    </View>
                    <Text className="text-primary font-bold text-sm">
                      {formatCurrency(item.total)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text className="text-text-secondary italic text-center py-8">
                  Nenhuma venda registrada ainda.
                </Text>
              )}
            </View>
          </View>

          {/* Categories Grid */}
          <View className="mb-8">
            <Text className="text-text-primary font-bold text-xl mb-4">
              Categorias em Destaque
            </Text>
            <View className="flex-row flex-wrap gap-4">
              {metrics.topCategories.map(item => (
                <View
                  key={item.name}
                  className="bg-white p-5 rounded-[28px] border border-secondary/20 shadow-sm w-[47%]"
                >
                  <View className="bg-secondary/40 self-start p-3 rounded-2xl mb-3">
                    <MaterialCommunityIcons
                      name="tag-outline"
                      size={20}
                      color="#A34211"
                    />
                  </View>
                  <Text
                    className="text-text-primary font-bold text-sm mb-1"
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text className="text-primary font-bold text-lg">
                    {formatCurrency(item.total)}
                  </Text>
                  <Text className="text-text-muted text-[10px] uppercase mt-1">
                    {item.quantity} vendas
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Low Stock Warning */}
          <View>
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-text-primary font-bold text-xl  px-2 py-1 ">
                Atenção ao Estoque
              </Text>
              <TouchableOpacity onPress={() => router.push('/stock')}>
                <Text className="text-primary font-bold text-sm">
                  Repor Agora
                </Text>
              </TouchableOpacity>
            </View>

            <View className="bg-white rounded-[32px] p-2 border border-secondary/20 shadow-sm">
              {metrics.lowStockItems.map((item, index) => (
                <View
                  key={item.id}
                  className={`flex-row items-center p-4 ${index !== metrics.lowStockItems.length - 1 ? 'border-b border-secondary/5' : ''}`}
                >
                  <View
                    className={`h-10 w-10 items-center justify-center rounded-2xl mr-4 ${item.stock <= 5 ? 'bg-red-50' : 'bg-teal-50'}`}
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
                      className="text-text-primary font-bold text-sm"
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text className="text-text-muted text-[10px] uppercase font-medium">
                      {item.category || 'Sem Categoria'}
                    </Text>
                  </View>
                  <View
                    className={`px-3 py-1 rounded-full ${item.stock <= 5 ? 'bg-red-50' : 'bg-teal-50'}`}
                  >
                    <Text
                      className={`font-bold text-xs ${item.stock <= 5 ? 'text-red-600' : 'text-teal-600'}`}
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
