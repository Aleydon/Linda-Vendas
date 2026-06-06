import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Header } from '@/components/Header';
import { HistoryItem } from '@/components/HistoryItem';
import { Loading } from '@/components/Loading';
import { SearchBar } from '@/components/SearchBar';
import { Sale, useAppContext } from '@/context/AppContext';
import {
  formatCurrency,
  formatDateLong,
  formatDateTime
} from '@/utils/formatters';

export function History() {
  const { sales, loading, colorScheme } = useAppContext();
  const [search, setSearch] = useState('');

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

  const grandTotal = useMemo(() => {
    return filteredSales.reduce((acc, sale) => {
      const saleTotal =
        sale.total ||
        sale.sale_items?.reduce(
          (sAcc, item) => sAcc + item.quantity * Number(item.unit_price),
          0
        ) ||
        0;
      return acc + Number(saleTotal);
    }, 0);
  }, [filteredSales]);

  const groupedSales = useMemo(() => {
    const groups: { [key: string]: { sales: Sale[]; total: number } } = {};

    filteredSales.forEach(sale => {
      const label = formatDateLong(sale.created_at);
      if (!groups[label]) {
        groups[label] = { sales: [], total: 0 };
      }
      groups[label].sales.push(sale);

      const saleTotal =
        sale.total ||
        sale.sale_items?.reduce(
          (sAcc, item) => sAcc + item.quantity * Number(item.unit_price),
          0
        ) ||
        0;
      groups[label].total += Number(saleTotal);
    });

    return Object.entries(groups);
  }, [filteredSales]);

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
          {/* Grand Total Summary */}
          {filteredSales.length > 0 && (
            <View className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 mb-8 border border-secondary/20 dark:border-zinc-800 shadow-sm flex-row items-center justify-between">
              <View>
                <Text className="text-primary dark:text-orange-400 text-xs uppercase font-bold tracking-widest mb-1">
                  Total do Período
                </Text>
                <Text className="text-[#22c55e] dark:text-emerald-400 font-bold text-3xl">
                  {formatCurrency(grandTotal)}
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
          )}

          {groupedSales.length > 0 ? (
            groupedSales.map(([date, data]) => (
              <View key={date} className="mb-8">
                <View className="mb-4 flex-row items-center justify-between">
                  <Text className="text-text-secondary dark:text-zinc-500 font-bold text-xs uppercase tracking-widest">
                    {date}
                  </Text>
                </View>
                <View className="gap-y-4">
                  {data.sales.map((sale, index) => (
                    <HistoryItem
                      key={sale.id}
                      sale={sale}
                      isInitiallyExpanded={index < 3}
                    />
                  ))}
                </View>
              </View>
            ))
          ) : (
            <EmptyState search={search} colorScheme={colorScheme} />
          )}
        </View>
      </ScrollView>
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
