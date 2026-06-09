import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
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
import { formatDateLong, formatDateTime } from '@/utils/formatters';

export function History() {
  const { sales, loading, colorScheme } = useAppContext();
  const [search, setSearch] = useState('');
  const focusAnimatedStyle = useFocusAnimation();

  const filteredSales = useMemo(() => {
    if (!search) return sales;

    const lowerSearch = search.toLowerCase();
    return sales.filter(sale => {
      // Search by product name or variation name
      const hasProduct = sale.sale_items?.some(
        item =>
          item.product?.name.toLowerCase().includes(lowerSearch) ||
          item.variation?.name.toLowerCase().includes(lowerSearch)
      );

      // Search by time/date
      const timeStr = formatDateTime(sale.created_at);
      const dateStr = formatDateLong(sale.created_at);

      return (
        hasProduct ||
        timeStr.includes(search) ||
        dateStr.toLowerCase().includes(lowerSearch)
      );
    });
  }, [sales, search]);

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
          placeholder="Buscar por produto, variação, data ou hora..."
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View className="px-6">
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
