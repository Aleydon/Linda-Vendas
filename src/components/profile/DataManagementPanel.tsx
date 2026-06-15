import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Product, Variation } from '@/context/types';
import { api } from '@/services/api';
import { csvUtils } from '@/utils/csv';
import { formatDate } from '@/utils/formatters';

interface DataManagementPanelProps {
  isAdmin: boolean;
  colorScheme: 'light' | 'dark';
  refreshData: () => Promise<void>;
}

interface ProductCsvRow {
  'ID Produto'?: string;
  Produto: string;
  'Preço Base': number;
  Categoria: string;
  'Possui Variações': 'Sim' | 'Não';
  Variação?: string;
  'Preço Variação'?: number;
  'Estoque Variação'?: number;
  'Imagem URL'?: string;
}

interface ProductImportData extends Omit<
  Product,
  'id' | 'outOfStock' | 'category'
> {
  id?: string;
  variations: Omit<Variation, 'id'>[];
}

export function DataManagementPanel({
  isAdmin,
  colorScheme,
  refreshData
}: DataManagementPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Somente Admins podem ver este painel inteiro
  if (!isAdmin) return null;

  const handleExportProducts = async (): Promise<void> => {
    try {
      setLoading(true);
      const products = await api.fetchProducts();

      const exportData: Record<
        string,
        string | number | boolean | null | undefined
      >[] = products.flatMap(p => {
        if (p.has_variations && p.variations && p.variations.length > 0) {
          return p.variations.map(v => ({
            'ID Produto': p.id,
            Produto: p.name,
            'Preço Base': p.price,
            Categoria: p.category,
            'Possui Variações': 'Sim',
            Variação: v.name,
            'Preço Variação': v.price,
            'Estoque Variação': v.stock,
            'Imagem URL': p.imageUrl
          }));
        }
        return [
          {
            'ID Produto': p.id,
            Produto: p.name,
            'Preço Base': p.price,
            Categoria: p.category,
            'Possui Variações': 'Não',
            Variação: '',
            'Preço Variação': '',
            'Estoque Variação': p.stock,
            'Imagem URL': p.imageUrl
          }
        ];
      });

      await csvUtils.exportToCsv(
        exportData,
        `Produtos_${formatDate(new Date()).replace(/\//g, '-')}`
      );
    } catch (error) {
      console.error('Export Products Error:', error);
      Alert.alert(
        'Erro',
        `Não foi possível exportar os produtos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExportSales = async (): Promise<void> => {
    try {
      setLoading(true);
      const sales = await api.fetchSales();

      const exportData: Record<
        string,
        string | number | boolean | null | undefined
      >[] = sales.map(s => ({
        'ID Venda': s.id.substring(0, 8),
        Data: formatDate(s.created_at),
        Vendedor: s.seller?.email || 'N/A',
        Cliente: s.customer_name || 'N/A',
        Total: s.total,
        Status: s.status === 'paid' ? 'Pago' : 'Pendente',
        Itens: s.sale_items
          ?.map(
            item =>
              `${item.quantity}x ${item.product?.name}${item.variation ? ` (${item.variation.name})` : ''}`
          )
          .join('; ')
      }));

      await csvUtils.exportToCsv(
        exportData,
        `Vendas_${formatDate(new Date()).replace(/\//g, '-')}`
      );
    } catch (error) {
      console.error('Export Sales Error:', error);
      Alert.alert(
        'Erro',
        `Não foi possível exportar as vendas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImportProducts = async (): Promise<void> => {
    try {
      const data = await csvUtils.importFromCsv<ProductCsvRow>();
      if (!data || data.length === 0) return;

      setLoading(true);

      let categories = await api.fetchCategories();
      const existingProducts = await api.fetchProducts();

      const getCategoryId = (name: string): string | undefined =>
        categories.find(c => c.name.toLowerCase() === name.toLowerCase())?.id;

      // Group by product name to handle variations
      const productsMap = new Map<string, ProductImportData>();

      for (const item of data) {
        const productName = item['Produto'];
        if (!productName) continue;

        const categoryName = item['Categoria'] || 'Sem Categoria';
        let categoryId = getCategoryId(categoryName);

        if (!categoryId && categoryName !== 'Sem Categoria') {
          await api.addCategory(categoryName);
          categories = await api.fetchCategories();
          categoryId = getCategoryId(categoryName);
        }

        if (!productsMap.has(productName)) {
          // Check if product already exists by name
          const existing = existingProducts.find(
            ep => ep.name.toLowerCase() === productName.toLowerCase()
          );

          productsMap.set(productName, {
            id: existing?.id, // If exists, we'll update
            name: productName,
            price: Number(item['Preço Base']) || 0,
            category_id: categoryId,
            imageUrl: item['Imagem URL'] || '',
            has_variations: item['Possui Variações'] === 'Sim',
            stock:
              item['Possui Variações'] === 'Sim'
                ? 0
                : Number(item['Estoque Variação']) || 0,
            variations: []
          });
        }

        if (item['Possui Variações'] === 'Sim' && item['Variação']) {
          const currentProduct = productsMap.get(productName);
          if (currentProduct) {
            currentProduct.variations.push({
              name: item['Variação'],
              price:
                Number(item['Preço Variação']) ||
                Number(item['Preço Base']) ||
                0,
              stock: Number(item['Estoque Variação']) || 0
            });
          }
        }
      }

      let updatedCount = 0;
      let createdCount = 0;

      // Upsert products
      for (const productData of Array.from(productsMap.values())) {
        if (productData.id) {
          // Update existing
          await api.updateProduct(productData.id, {
            name: productData.name,
            price: productData.price,
            stock: productData.stock,
            imageUrl: productData.imageUrl,
            category_id: productData.category_id,
            has_variations: productData.has_variations,
            variations: productData.variations as Variation[]
          });
          updatedCount++;
        } else {
          // Create new
          await api.addProduct(productData as Product);
          createdCount++;
        }
      }

      await refreshData();
      Alert.alert(
        'Sucesso',
        `${createdCount} novos produtos criados e ${updatedCount} atualizados.`
      );
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Erro',
        'Falha ao importar produtos. Verifique o formato do arquivo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-secondary dark:border-zinc-800 overflow-hidden mb-4">
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
        className="flex-row items-center justify-between p-4"
      >
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 items-center justify-center">
            <MaterialCommunityIcons
              name="database-sync-outline"
              size={24}
              color={colorScheme === 'dark' ? '#fb923c' : '#A34211'}
            />
          </View>
          <View className="ml-3">
            <Text className="text-text-primary dark:text-zinc-100 font-bold">
              Backup e Relatórios
            </Text>
            <Text className="text-text-secondary dark:text-zinc-400 text-xs">
              Exportar e importar dados (CSV)
            </Text>
          </View>
        </View>
        <MaterialCommunityIcons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#BDB2B2"
        />
      </TouchableOpacity>

      {isExpanded && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          className="px-4 pb-6 border-t border-secondary dark:border-zinc-800 pt-4"
        >
          {loading ? (
            <ActivityIndicator
              color={colorScheme === 'dark' ? '#fb923c' : '#A34211'}
              className="my-4"
            />
          ) : (
            <View className="gap-3">
              <Text className="text-text-secondary dark:text-zinc-400 text-[10px] uppercase font-bold mb-1">
                Exportar Dados
              </Text>

              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={handleExportProducts}
                  className="flex-1 bg-gray-50 dark:bg-zinc-800 p-3 rounded-xl flex-row items-center justify-center border border-gray-100 dark:border-zinc-700"
                >
                  <MaterialCommunityIcons
                    name="package-variant"
                    size={20}
                    color={colorScheme === 'dark' ? '#fb923c' : '#A34211'}
                  />
                  <Text className="ml-2 text-text-primary dark:text-zinc-100 font-medium text-xs">
                    Produtos
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleExportSales}
                  className="flex-1 bg-gray-50 dark:bg-zinc-800 p-3 rounded-xl flex-row items-center justify-center border border-gray-100 dark:border-zinc-700"
                >
                  <MaterialCommunityIcons
                    name="receipt"
                    size={20}
                    color={colorScheme === 'dark' ? '#fb923c' : '#A34211'}
                  />
                  <Text className="ml-2 text-text-primary dark:text-zinc-100 font-medium text-xs">
                    Vendas
                  </Text>
                </TouchableOpacity>
              </View>

              <Text className="text-text-secondary dark:text-zinc-400 text-[10px] uppercase font-bold mt-2 mb-1">
                Importar Dados
              </Text>

              <TouchableOpacity
                onPress={handleImportProducts}
                className="bg-primary/10 dark:bg-primary/20 p-3 rounded-xl flex-row items-center justify-center border border-primary/20"
              >
                <MaterialCommunityIcons
                  name="file-import-outline"
                  size={20}
                  color={colorScheme === 'dark' ? '#fb923c' : '#A34211'}
                />
                <Text className="ml-2 text-primary dark:text-orange-400 font-bold text-xs">
                  Importar Produtos do CSV
                </Text>
              </TouchableOpacity>

              <Text className="text-text-secondary dark:text-zinc-500 text-[9px] text-center mt-1">
                Nota: Se o nome do produto já existir, ele será atualizado em
                vez de duplicado.
              </Text>
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
}
