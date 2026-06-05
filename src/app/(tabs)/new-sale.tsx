import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

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
  const { products, addSale, loading } = useAppContext();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const filteredProducts = useMemo(() => {
    const lowerQuery = search.toLowerCase();
    return products.filter(p => {
      if (p.stock <= 0) return false;
      const matchesName = p.name.toLowerCase().includes(lowerQuery);
      const matchesVariations = p.variations?.some(v =>
        v.name.toLowerCase().includes(lowerQuery)
      );
      return matchesName || matchesVariations;
    });
  }, [products, search]);

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
    const key = process.env.EXPO_PUBLIC_PIX_KEY;
    const name = process.env.EXPO_PUBLIC_PIX_NAME;
    const city = process.env.EXPO_PUBLIC_PIX_CITY;

    if (!key || !name || !city || total <= 0) return '';

    return generatePixPayload({
      key,
      name,
      city,
      amount: total,
      description: 'Venda Linda Sales'
    });
  }, [total]);

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

      await addSale(items, total);
      setShowConfirmation(false);
      setCart([]);
      setSearch('');
    } catch (error) {
      console.error('Error finalizing sale:', error);
    }
  };

  return (
    <View className="bg-background flex-1">
      <Header />

      <View className="px-6 py-2">
        <Text className="text-text-primary font-bold text-2xl">Nova Venda</Text>
        <Text className="text-text-secondary text-base">
          Selecione os produtos para gerar o QR Code.
        </Text>
      </View>

      <SearchBar
        value={search}
        onChangeText={setSearch}
        onClear={() => setSearch('')}
      />

      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <SaleProductItem
            item={item}
            cart={cart}
            onUpdateQuantity={updateQuantity}
            searchQuery={search}
          />
        )}
        ListEmptyComponent={() => (
          <View className="py-20 items-center justify-center">
            <MaterialCommunityIcons
              name="package-variant"
              size={48}
              color="#D1D5DB"
            />
            <Text className="text-text-secondary mt-2 text-base text-center px-10">
              {search
                ? 'Nenhum produto disponível com este nome.'
                : 'Nenhum produto em estoque no momento.'}
            </Text>
          </View>
        )}
      />

      {/* Bottom Summary */}
      <View className="border-secondary absolute bottom-0 left-0 right-0 border-t bg-white px-6 pb-24 pt-4 shadow-lg">
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
              <MaterialCommunityIcons name="check" size={24} color="white" />
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
