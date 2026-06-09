import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeInDown,
  LinearTransition
} from 'react-native-reanimated';

import { Header } from '@/components/Header';
import { HistoryItem } from '@/components/HistoryItem';
import { SearchBar } from '@/components/SearchBar';
import { HistorySkeleton } from '@/components/skeletons/HistorySkeleton';
import { Sale, useAppContext } from '@/context/AppContext';
import { useFocusAnimation } from '@/hooks/useFocusAnimation';
import {
  formatCurrency,
  formatDateLong,
  formatDateTime
} from '@/utils/formatters';

export function History() {
  const { sales, loading, colorScheme } = useAppContext();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>(
    'all'
  );
  const focusAnimatedStyle = useFocusAnimation();

  const filteredSales = useMemo(() => {
    let result = sales;

    // Filter by status first
    if (statusFilter !== 'all') {
      result = result.filter(sale => sale.status === statusFilter);
    }

    if (!search) return result;

    const lowerSearch = search.toLowerCase();
    return result.filter(sale => {
      // Search by product name or variation name
      const hasProduct = sale.sale_items?.some(
        item =>
          item.product?.name.toLowerCase().includes(lowerSearch) ||
          item.variation?.name.toLowerCase().includes(lowerSearch)
      );

      // Search by time/date
      const timeStr = formatDateTime(sale.created_at);
      const dateStr = formatDateLong(sale.created_at);
      const customerStr = sale.customer_name?.toLowerCase() || '';

      return (
        hasProduct ||
        timeStr.includes(search) ||
        dateStr.toLowerCase().includes(lowerSearch) ||
        customerStr.includes(lowerSearch)
      );
    });
  }, [sales, search, statusFilter]);

  const totalPending = useMemo(() => {
    return sales
      .filter(s => s.status === 'pending')
      .reduce((acc, sale) => acc + Number(sale.total || 0), 0);
  }, [sales]);

  const groupedSales = useMemo(() => {
    const groups: { [key: string]: { sales: Sale[]; total: number } } = {};

    filteredSales.forEach(sale => {
      const label = formatDateLong(sale.created_at);
      if (!groups[label]) {
        groups[label] = { sales: [], total: 0 };
      }
      groups[label].sales.push(sale);

      const saleTotal =
        sale.status !== 'pending'
          ? sale.total ||
            sale.sale_items?.reduce(
              (sAcc, item) => sAcc + item.quantity * Number(item.unit_price),
              0
            ) ||
            0
          : 0;
      groups[label].total += Number(saleTotal);
    });

    return Object.entries(groups);
  }, [filteredSales]);

  if (loading && sales.length === 0) {
    return (
      <View className="bg-background dark:bg-zinc-950 flex-1">
        <Header />
        <HistorySkeleton />
      </View>
    );
  }

  return (
    <View className="bg-background dark:bg-zinc-950 flex-1">
      <Header />

      <Animated.View style={focusAnimatedStyle} className="flex-1">
        <SearchBar
          value={search}
          onChangeText={setSearch}
          onClear={() => setSearch('')}
          placeholder="Buscar por produto, cliente, data..."
        />

        {/* Status Filter Tabs */}
        <View className="flex-row px-6 mb-4 gap-2">
          {(['all', 'paid', 'pending'] as const).map(status => (
            <TouchableOpacity
              key={status}
              onPress={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full border ${
                statusFilter === status
                  ? 'bg-primary border-primary dark:bg-orange-600 dark:border-orange-600'
                  : 'bg-secondary border-secondary dark:bg-zinc-800 dark:border-zinc-800'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
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
          <View className="px-6">
            {totalPending > 0 && statusFilter !== 'paid' && (
              <View className="bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-4 mb-6 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="bg-orange-100 dark:bg-orange-900/40 p-2 rounded-xl mr-3">
                    <MaterialCommunityIcons
                      name="clock-alert-outline"
                      size={20}
                      color="#f97316"
                    />
                  </View>
                  <View>
                    <Text className="text-orange-800 dark:text-orange-300 text-[10px] font-bold uppercase tracking-wider">
                      Total Pendente (Fiado)
                    </Text>
                    <Text className="text-orange-600 dark:text-orange-400 font-bold text-xl">
                      {formatCurrency(totalPending)}
                    </Text>
                  </View>
                </View>
                {statusFilter === 'all' && (
                  <TouchableOpacity
                    onPress={() => setStatusFilter('pending')}
                    className="bg-orange-500 px-3 py-1.5 rounded-lg"
                  >
                    <Text className="text-white text-[10px] font-bold">
                      VER TODAS
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {groupedSales.length > 0 ? (
              groupedSales.map(([date, data]) => (
                <View key={date} className="mb-8">
                  <View className="mb-4 flex-row items-center justify-between">
                    <Text className="text-text-secondary dark:text-zinc-500 font-bold text-xs uppercase tracking-widest">
                      {date}
                    </Text>
                  </View>
                  <Animated.View layout={LinearTransition} className="gap-y-4">
                    {data.sales.map((sale, index) => (
                      <Animated.View
                        key={sale.id}
                        entering={FadeInDown.delay(index * 35).duration(300)}
                        layout={LinearTransition}
                      >
                        <HistoryItem
                          sale={sale}
                          isInitiallyExpanded={index === 0}
                        />
                      </Animated.View>
                    ))}
                  </Animated.View>
                </View>
              ))
            ) : (
              <EmptyState search={search} colorScheme={colorScheme} />
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

function EmptyState({
  search,
  colorScheme
}: {
  search: string;
  colorScheme: 'light' | 'dark';
}) {
  return (
    <View className="items-center py-20">
      <MaterialCommunityIcons
        name="text-search"
        size={48}
        color={colorScheme === 'dark' ? '#3f3f46' : '#BDB2B2'}
      />
      <Text className="text-text-secondary dark:text-zinc-500 mt-4 text-center text-lg italic">
        {search
          ? 'Nenhuma venda encontrada para sua busca.'
          : 'Nenhuma venda registrada ainda.'}
      </Text>
    </View>
  );
}

export default History;
