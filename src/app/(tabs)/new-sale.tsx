import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  FadeInDown,
  LinearTransition
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryItem } from '@/components/CategoryItem';
import { Header } from '@/components/Header';
import { PaymentModal } from '@/components/PaymentModal';
import { SaleProductItem } from '@/components/SaleProductItem';
import { SearchBar } from '@/components/SearchBar';
import { NewSaleSkeleton } from '@/components/skeletons/NewSaleSkeleton';
import { useAppContext } from '@/context/AppContext';
import { SaleStatus } from '@/context/types';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/utils/formatters';
import { generatePixPayload } from '@/utils/pix';

export default function NewSale() {
  const {
    products,
    addSale,
    loading,
    categories,
    profile,
    user,
    colorScheme,
    isApproved
  } = useAppContext();
  const [search, setSearch] = useState('');
  const insets = useSafeAreaInsets();

  // Dynamically calculate spacing to position the checkout summary card above the floating tab bar
  const bottomInset = insets.bottom > 0 ? insets.bottom + 8 : 24;
  const cardBottom = bottomInset + 80 + 2; // 80 (tab bar height) + 12 (margin offset)
  const [activeCategoryId, setActiveCategoryId] = useState('Todos');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { cart, total, totalItemsCount, updateQuantity, clearCart } =
    useCart(products);

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

  const pixString = useMemo(() => {
    if (
      !profile?.pix_key ||
      !profile?.pix_name ||
      !profile?.pix_city ||
      total <= 0
    )
      return '';

    return generatePixPayload({
      key: profile.pix_key,
      name: profile.pix_name,
      city: profile.pix_city,
      amount: total,
      description: 'Venda Linda Sales'
    });
  }, [total, profile]);

  const hasOwnPix = !!profile?.pix_key;

  const handleFinalize = () => {
    if (cart.length === 0) {
      return;
    }
    setShowConfirmation(true);
  };

  const confirmSale = async (
    status: SaleStatus = 'paid',
    customerName?: string
  ) => {
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

      await addSale(items, total, user?.id, status, customerName);
      setShowConfirmation(false);
      clearCart();
      setSearch('');
    } catch (error) {
      console.error('Error finalizing sale:', error);
    }
  };

  if (!isApproved) {
    return (
      <View className="bg-background dark:bg-zinc-950 flex-1">
        <Header />
        <View className="flex-1 items-center justify-center px-10">
          <MaterialCommunityIcons
            name="account-lock-outline"
            size={64}
            color={colorScheme === 'dark' ? '#52525b' : '#BDB2B2'}
          />
          <Text className="text-text-primary dark:text-zinc-100 font-bold text-xl text-center mt-6">
            Aguardando Aprovação
          </Text>
          <Text className="text-text-secondary dark:text-zinc-400 text-base text-center mt-2">
            Seu cadastro ainda não foi aprovado pelo administrador. Assim que
            for liberado, você poderá realizar vendas.
          </Text>
        </View>
      </View>
    );
  }

  if (loading && products.length === 0) {
    return (
      <View className="bg-background dark:bg-zinc-950 flex-1">
        <Header />
        <NewSaleSkeleton />
      </View>
    );
  }

  return (
    <View className="bg-background dark:bg-zinc-950 flex-1">
      <Header />

      <View className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <View className="px-6 pt-2">
            <Text className="text-text-primary dark:text-zinc-100 font-bold text-2xl">
              Nova Venda
            </Text>
            <Text className="text-text-secondary dark:text-zinc-400 text-base">
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

          <View className="p-card">
            {displayedSections.map(section => {
              const sectionProducts = filteredProducts.filter(
                p => p.category_id === section.id
              );

              if (sectionProducts.length === 0) return null;

              return (
                <View key={section.id} className="mb-6">
                  <Text className="text-text-secondary dark:text-zinc-500 mb-4 ml-2 font-bold text-category-section uppercase tracking-widest">
                    {section.name}
                  </Text>

                  <Animated.View layout={LinearTransition} className="gap-y-4">
                    {sectionProducts.map((product, index) => (
                      <Animated.View
                        key={product.id}
                        entering={FadeInDown.delay(index * 30).duration(300)}
                        layout={LinearTransition}
                      >
                        <SaleProductItem
                          item={product}
                          cart={cart}
                          onUpdateQuantity={updateQuantity}
                          searchQuery={search}
                        />
                      </Animated.View>
                    ))}
                  </Animated.View>
                </View>
              );
            })}

            {filteredProducts.length === 0 && (
              <View className="py-20 items-center justify-center">
                <MaterialCommunityIcons
                  name="package-variant"
                  size={48}
                  color={colorScheme === 'dark' ? '#3f3f46' : '#D1D5DB'}
                />
                <Text className="text-text-secondary dark:text-zinc-500 mt-2 text-base text-center px-10">
                  {search || activeCategoryId !== 'Todos'
                    ? 'Nenhum produto encontrado com estes filtros.'
                    : 'Nenhum produto em estoque no momento.'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Summary */}
        <View
          className="border border-secondary dark:border-zinc-800 bg-white dark:bg-zinc-900 px-card pb-5 pt-4 rounded-3xl shadow-xl shadow-black/10 mx-2"
          style={{ marginBottom: cardBottom }}
        >
          <View className="mb-4 flex-row items-center justify-between px-card">
            <View>
              <Text className="text-text-secondary dark:text-zinc-400 text-sm">
                Total da Venda
              </Text>
              <Text className="text-text-primary dark:text-zinc-100 font-bold text-3xl">
                {formatCurrency(total)}
              </Text>
            </View>
            <View className="rounded-full bg-secondary dark:bg-zinc-800 px-4 py-2">
              <Text className="text-primary dark:text-orange-400 font-bold">
                {totalItemsCount} itens
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleFinalize}
            disabled={loading || cart.length === 0}
            className={`flex-row items-center justify-center rounded-2xl py-5 shadow-lg ${
              cart.length === 0
                ? 'bg-gray-300 dark:bg-zinc-800'
                : 'bg-primary dark:bg-orange-600 shadow-orange-500/40'
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
                  Confirmar Pagamento
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {showConfirmation && (
        <PaymentModal
          visible={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={confirmSale}
          total={total}
          loading={loading}
          pixString={pixString}
          allowFiado={profile?.allow_fiado}
          colorScheme={colorScheme}
          hasOwnPix={hasOwnPix}
        />
      )}
    </View>
  );
}
