import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { CategoryItem } from '@/components/CategoryItem';
import { Header } from '@/components/Header';
import { PaymentModal } from '@/components/PaymentModal';
import { SaleProductItem } from '@/components/SaleProductItem';
import { SearchBar } from '@/components/SearchBar';
import { useAppContext } from '@/context/AppContext';
import { formatCurrency } from '@/utils/formatters';
import { generatePixPayload } from '@/utils/pix';

interface CartItem {
  productId: string;
  variationId?: string;
  quantity: number;
}

export function NewSale() {
  const { products, addSale, loading, categories, profile, user } =
    useAppContext();
  const [search, setSearch] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState('Todos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const filteredProducts = useMemo(() => {
    const lowerQuery = search.toLowerCase();
    return products.filter(p => {
      if (p.stock <= 0 && !p.has_variations) return false;

      const matchesCategory =
        activeCategoryId === 'Todos' || p.category_id === activeCategoryId;

      const matchesName = p.name.toLowerCase().includes(lowerQuery);
      const matchesVariations = p.variations?.some(v =>
        v.name.toLowerCase().includes(lowerQuery)
      );

      return matchesCategory && (matchesName || matchesVariations);
    });
  }, [products, search, activeCategoryId]);

  const displayedSections = useMemo(() => {
    if (activeCategoryId === 'Todos') {
      return categories.filter(cat =>
        filteredProducts.some(p => p.category_id === cat.id)
      );
    }
    return categories.filter(cat => cat.id === activeCategoryId);
  }, [categories, filteredProducts, activeCategoryId]);

  const total = useMemo(() => {
    return cart.reduce((acc, item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return acc;

      if (item.variationId && product.variations) {
        const variation = product.variations.find(
          v => v.id === item.variationId
        );
        return acc + (variation?.price || 0) * item.quantity;
      }

      return acc + (product.price || 0) * item.quantity;
    }, 0);
  }, [cart, products]);

  const pixString = useMemo(() => {
    const key = profile?.pix_key || process.env.EXPO_PUBLIC_PIX_KEY;
    const name = profile?.pix_name || process.env.EXPO_PUBLIC_PIX_NAME;
    const city = profile?.pix_city || process.env.EXPO_PUBLIC_PIX_CITY;

    if (!key || !name || !city || total <= 0) return '';

    return generatePixPayload({
      key,
      name,
      city,
      amount: total,
      description: 'Venda Linda Sales'
    });
  }, [total, profile]);

  const updateQuantity = (
    productId: string,
    delta: number,
    variationId?: string
  ) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.productId === productId && item.variationId === variationId
      );
      const product = products.find(p => p.id === productId);

      if (!product) return prev;

      let maxStock = product.stock;
      if (variationId && product.variations) {
        const v = product.variations.find(
          varItem => varItem.id === variationId
        );
        if (v) maxStock = v.stock;
      }

      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const newQuantity = existing.quantity + delta;

        if (newQuantity <= 0) {
          return prev.filter((_, i) => i !== existingIndex);
        }

        if (newQuantity > maxStock) {
          return prev;
        }

        const newCart = [...prev];
        newCart[existingIndex] = { ...existing, quantity: newQuantity };
        return newCart;
      } else if (delta > 0) {
        if (maxStock <= 0) return prev;
        return [...prev, { productId, variationId, quantity: 1 }];
      }
      return prev;
    });
  };

  const handleFinalize = () => {
    if (cart.length === 0) {
      return;
    }
    setShowConfirmation(true);
  };

  const confirmSale = async () => {
    try {
      const items = cart.map(item => {
        const product = products.find(p => p.id === item.productId)!;
        let price = product.price;

        if (item.variationId && product.variations) {
          const v = product.variations.find(
            varItem => varItem.id === item.variationId
          );
          if (v) price = v.price;
        }

        return {
          product_id: item.productId,
          variation_id: item.variationId,
          quantity: item.quantity,
          unit_price: price
        };
      });

      await addSale(items, total, user?.id);
      setShowConfirmation(false);
      setCart([]);
      setSearch('');
    } catch (error) {
      console.error('Error finalizing sale:', error);
    }
  };

  return (
    <View className="bg-surface flex-1">
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 180 }}
      >
        <View className="px-6 pt-2">
          <Text className="text-text-primary font-bold text-2xl">
            Nova Venda
          </Text>
          <Text className="text-text-secondary text-base">
            Selecione os produtos para gerar o QR Code.
          </Text>
        </View>

        <SearchBar
          value={search}
          onChangeText={setSearch}
          onClear={() => setSearch('')}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6 px-6"
          contentContainerStyle={{ paddingRight: 40 }}
        >
          <CategoryItem
            label="Todos"
            isActive={activeCategoryId === 'Todos'}
            onPress={() => setActiveCategoryId('Todos')}
          />
          {categories.map(category => (
            <CategoryItem
              key={category.id}
              label={category.name}
              isActive={activeCategoryId === category.id}
              onPress={() => setActiveCategoryId(category.id)}
            />
          ))}
        </ScrollView>

        <View className="px-6">
          {displayedSections.map(section => {
            const sectionProducts = filteredProducts.filter(
              p => p.category_id === section.id
            );

            if (sectionProducts.length === 0) return null;

            return (
              <View key={section.id} className="mb-6">
                <Text className="text-text-secondary mb-4 font-bold text-xs uppercase tracking-widest">
                  {section.name}
                </Text>

                {sectionProducts.map(product => (
                  <SaleProductItem
                    key={product.id}
                    item={product}
                    cart={cart}
                    onUpdateQuantity={updateQuantity}
                    searchQuery={search}
                  />
                ))}
              </View>
            );
          })}

          {filteredProducts.length === 0 && (
            <View className="py-20 items-center justify-center">
              <MaterialCommunityIcons
                name="package-variant"
                size={48}
                color="#D1D5DB"
              />
              <Text className="text-text-secondary mt-2 text-base text-center px-10">
                {search || activeCategoryId !== 'Todos'
                  ? 'Nenhum produto encontrado com estes filtros.'
                  : 'Nenhum produto em estoque no momento.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Summary */}
      <View className="border-secondary absolute bottom-0 left-0 right-0 border-t bg-white px-6 pb-2 pt-2 shadow-lg">
        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-text-secondary text-sm">Total da Venda</Text>
            <Text className="text-text-primary font-bold text-3xl">
              {formatCurrency(total)}
            </Text>
          </View>
          <View className="rounded-full bg-secondary px-4 py-2">
            <Text className="text-primary font-bold">
              {cart.reduce((acc, item) => acc + item.quantity, 0)} itens
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleFinalize}
          disabled={loading || cart.length === 0}
          className={`flex-row items-center justify-center rounded-2xl py-5 shadow-lg ${
            cart.length === 0
              ? 'bg-gray-300'
              : 'bg-primary shadow-orange-500/40'
          }`}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <MaterialCommunityIcons
                name="qrcode-scan"
                size={20}
                color="white"
              />
              <Text className="ml-2 font-bold text-white text-lg">
                Gerar QR Code
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <PaymentModal
        visible={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmSale}
        total={total}
        loading={loading}
        pixString={pixString}
      />
    </View>
  );
}

export default NewSale;
