import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { PaymentModal } from '@/components/PaymentModal';
import { SaleProductItem } from '@/components/SaleProductItem';
import { SearchBar } from '@/components/SearchBar';
import { useAppContext } from '@/context/AppContext';
import { formatCurrency } from '@/utils/formatters';
import { generatePixPayload } from '@/utils/pix';

interface CartItem {
  productId: string;
  quantity: number;
}

export function NewSale() {
  const router = useRouter();
  const { products, addSale, loading } = useAppContext();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(
      p => p.name.toLowerCase().includes(search.toLowerCase()) && p.stock > 0
    );
  }, [products, search]);

  const total = useMemo(() => {
    return cart.reduce((acc, item) => {
      const product = products.find(p => p.id === item.productId);
      return acc + (product?.price || 0) * item.quantity;
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

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      const product = products.find(p => p.id === productId);

      if (!product) return prev;

      if (existing) {
        const newQuantity = existing.quantity + delta;
        if (newQuantity <= 0) {
          return prev.filter(item => item.productId !== productId);
        }
        if (newQuantity > product.stock) {
          return prev;
        }
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else if (delta > 0) {
        return [...prev, { productId, quantity: 1 }];
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
        return {
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: product.price
        };
      });

      await addSale(items, total);
      setShowConfirmation(false);
      router.back();
    } catch (error) {
      console.error('Error finalizing sale:', error);
    }
  };

  return (
    <View className="bg-background flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pb-4 pt-12">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <MaterialCommunityIcons name="arrow-left" size={28} color="#3C2F2F" />
        </TouchableOpacity>
        <Text className="text-text-primary font-bold text-xl">Nova Venda</Text>
        <View className="border-secondary bg-secondary h-10 w-10 items-center justify-center overflow-hidden rounded-full border">
          <MaterialCommunityIcons name="cart-plus" size={22} color="#A34211" />
        </View>
      </View>

      {/* Search Bar */}
      <SearchBar
        value={search}
        onChangeText={setSearch}
        onClear={() => setSearch('')}
      />

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 160 }}
        renderItem={({ item }) => (
          <SaleProductItem
            item={item}
            quantity={cart.find(ci => ci.productId === item.id)?.quantity || 0}
            onUpdateQuantity={updateQuantity}
          />
        )}
      />

      {/* Bottom Summary */}
      <View className="border-secondary absolute bottom-0 left-0 right-0 border-t bg-white px-6 pb-10 pt-4 shadow-lg">
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
