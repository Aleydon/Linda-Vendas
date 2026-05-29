import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Header } from '@/components/Header';
import { HistoryItem } from '@/components/HistoryItem';
import { Loading } from '@/components/Loading';
import { SearchBar } from '@/components/SearchBar';
import { Sale, useAppContext } from '@/context/AppContext';
import { formatDateLong, formatDateTime } from '@/utils/formatters';

export function History() {
  const { sales, loading } = useAppContext();
  const [search, setSearch] = useState('');

  const filteredSales = useMemo(() => {
    if (!search) return sales;

    const lowerSearch = search.toLowerCase();
    return sales.filter(sale => {
      // Search by product name
      const hasProduct = sale.sale_items?.some(item =>
        item.product?.name.toLowerCase().includes(lowerSearch)
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
    const groups: { [key: string]: Sale[] } = {};

    filteredSales.forEach(sale => {
      const label = formatDateLong(sale.created_at);
      if (!groups[label]) groups[label] = [];
      groups[label].push(sale);
    });

    return Object.entries(groups);
  }, [filteredSales]);

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

      <SearchBar
        value={search}
        onChangeText={setSearch}
        onClear={() => setSearch('')}
        placeholder="Buscar por produto, data ou hora..."
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-6">
          {groupedSales.length > 0 ? (
            groupedSales.map(([date, dateSales]) => (
              <View key={date} className="mb-8">
                <Text className="text-text-secondary mb-4 font-bold text-xs uppercase tracking-widest">
                  {date}
                </Text>
                <View className="gap-y-4">
                  {dateSales.map(sale => (
                    <HistoryItem key={sale.id} sale={sale} />
                  ))}
                </View>
              </View>
            ))
          ) : (
            <EmptyState search={search} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function EmptyState({ search }: { search: string }) {
  return (
    <View className="items-center py-20">
      <MaterialCommunityIcons name="text-search" size={48} color="#BDB2B2" />
      <Text className="text-text-secondary mt-4 text-center text-lg italic">
        {search
          ? 'Nenhuma venda encontrada para sua busca.'
          : 'Nenhuma venda registrada ainda.'}
      </Text>
    </View>
  );
}

export default History;
