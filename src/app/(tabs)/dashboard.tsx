import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Header } from '@/components/Header';
import { SalesChart } from '@/components/SalesChart';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import { useAppContext } from '@/context/AppContext';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useFocusAnimation } from '@/hooks/useFocusAnimation';
import { formatCurrency } from '@/utils/formatters';

export function Dashboard() {
  const router = useRouter();
  const { sales, products, loading, colorScheme, isAdmin, user } =
    useAppContext();

  const filteredSales = React.useMemo(() => {
    if (isAdmin) return sales;
    return sales.filter(sale => sale.user_id === user?.id);
  }, [sales, isAdmin, user]);

  const metrics = useDashboardMetrics(filteredSales, products);
  const focusAnimatedStyle = useFocusAnimation();

  const debtsByCustomer = useMemo(() => {
    const debts: {
      [key: string]: { name: string; total: number; count: number };
    } = {};

    sales.forEach(sale => {
      if (sale.status === 'pending' && sale.customer_name) {
        const name = sale.customer_name;
        if (!debts[name]) {
          debts[name] = { name, total: 0, count: 0 };
        }
        debts[name].total += Number(sale.total || 0);
        debts[name].count += 1;
      }
    });

    return Object.values(debts).sort((a, b) => b.total - a.total);
  }, [sales]);

  const hasSales = metrics.topProducts.length > 0;

  if (loading) {
    return (
      <View className="bg-background dark:bg-zinc-950 flex-1">
        <Header />
        <DashboardSkeleton />
      </View>
    );
  }

  return (
    <View className="bg-background dark:bg-zinc-950 flex-1">
      <Header />

      <Animated.View style={focusAnimatedStyle} className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View className="px-6 py-4">
            {/* Main Integrated Sales Card & Chart */}
            <Animated.View entering={FadeInDown.duration(600)}>
              <SalesChart
                data={metrics.salesChartData}
                percentageChange={metrics.percentageChange}
              />
            </Animated.View>

            {/* Customers with Debts (Fiados) */}
            {debtsByCustomer.length > 0 && (
              <Animated.View
                entering={FadeInDown.delay(100).duration(600)}
                className="mb-8 mt-4"
              >
                <View className="mb-4 flex-row items-center justify-between">
                  <Text className="text-text-primary dark:text-zinc-100 font-bold text-xl">
                    Clientes Devedores
                  </Text>
                  <TouchableOpacity onPress={() => router.push('/history')}>
                    <Text className="text-primary dark:text-orange-400 font-bold text-sm">
                      Ver Tudo
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="bg-white dark:bg-zinc-900 rounded-[32px] p-2 border border-orange-100 dark:border-orange-900/30 shadow-sm">
                  {debtsByCustomer.slice(0, 3).map((debt, index) => (
                    <View
                      key={debt.name}
                      className={`flex-row items-center p-4 ${index !== Math.min(debtsByCustomer.length, 3) - 1 ? 'border-b border-secondary/5 dark:border-zinc-800/50' : ''}`}
                    >
                      <View className="bg-orange-50 dark:bg-orange-950/40 h-10 w-10 items-center justify-center rounded-2xl mr-4">
                        <MaterialCommunityIcons
                          name="account-clock"
                          size={20}
                          color="#f97316"
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-text-primary dark:text-zinc-100 font-bold text-sm"
                          numberOfLines={1}
                        >
                          {debt.name}
                        </Text>
                        <Text className="text-text-muted dark:text-zinc-500 text-[10px] uppercase font-medium">
                          {debt.count}{' '}
                          {debt.count === 1
                            ? 'venda pendente'
                            : 'vendas pendentes'}
                        </Text>
                      </View>
                      <Text className="text-orange-600 dark:text-orange-400 font-bold text-sm">
                        {formatCurrency(debt.total)}
                      </Text>
                    </View>
                  ))}
                  {debtsByCustomer.length > 3 && (
                    <TouchableOpacity
                      onPress={() => router.push('/history')}
                      className="py-3 items-center"
                    >
                      <Text className="text-text-secondary dark:text-zinc-500 text-xs font-bold">
                        + {debtsByCustomer.length - 3} outros clientes
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Animated.View>
            )}

            {/* Top 5 Products Section / Empty Products State */}
            {products.length === 0 ? (
              <Animated.View
                entering={FadeInDown.delay(200).duration(500)}
                className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 border border-secondary/20 dark:border-zinc-800 shadow-sm items-center py-10 mt-4 mb-8"
              >
                <View className="bg-primary/10 dark:bg-orange-500/10 p-5 rounded-[24px] mb-4">
                  <MaterialCommunityIcons
                    name="package-variant-closed"
                    size={40}
                    color={colorScheme === 'dark' ? '#fb923c' : '#A34211'}
                  />
                </View>
                <Text className="text-text-primary dark:text-zinc-100 font-bold text-xl text-center mb-2">
                  {isAdmin
                    ? 'Comece Cadastrando um Produto'
                    : 'Nenhum Produto no Inventário'}
                </Text>
                <Text className="text-text-secondary dark:text-zinc-500 text-sm text-center mb-6 px-4">
                  {isAdmin
                    ? 'Você ainda não possui produtos no seu inventário. Cadastre seu primeiro produto para começar a vender.'
                    : 'Não há produtos cadastrados no inventário. Aguarde um administrador cadastrar produtos para iniciar as vendas.'}
                </Text>
                {isAdmin && (
                  <TouchableOpacity
                    onPress={() => router.push('/new-product')}
                    className="bg-primary dark:bg-orange-500 px-6 py-3 rounded-full flex-row items-center"
                  >
                    <MaterialCommunityIcons
                      name="plus"
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text className="text-white font-bold text-sm ml-1">
                      Cadastrar Produto
                    </Text>
                  </TouchableOpacity>
                )}
              </Animated.View>
            ) : hasSales ? (
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
                  {metrics.topProducts.map((item, index) => (
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
                  ))}
                </View>
              </View>
            ) : null}

            {/* Categories Grid */}
            {hasSales && metrics.topCategories.length > 0 && (
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
            )}

            {/* Low Stock Warning */}
            {metrics.lowStockItems.length > 0 && (
              <View>
                <View className="mb-4 flex-row items-center justify-between">
                  <Text className="text-text-primary dark:text-zinc-100 font-bold text-xl px-2 py-1">
                    Atenção ao Estoque
                  </Text>
                  <TouchableOpacity onPress={() => router.push('/stock')}>
                    <Text className="text-primary dark:text-orange-400 font-bold text-sm">
                      {isAdmin ? 'Repor Agora' : 'Ver Estoque'}
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
                            item.stock <= 5
                              ? 'alert-outline'
                              : 'package-variant'
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
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

export default Dashboard;
