import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition,
  ZoomIn,
  ZoomOut
} from 'react-native-reanimated';

import { CategoryManagerModal } from '@/components/CategoryManagerModal';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { StockSkeleton } from '@/components/skeletons/StockSkeleton';
import { StockProductItem } from '@/components/StockProductItem';
import { useAlert } from '@/context/AlertContext';
import { useAppContext } from '@/context/AppContext';

export function Stock(): React.JSX.Element {
  const {
    products,
    categories,
    loading,
    deleteProduct,
    addCategory,
    deleteCategory,
    isAdmin,
    colorScheme
  } = useAppContext();
  const { showAlert } = useAlert();
  const [showOptions, setShowOptions] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProducts, setExpandedProducts] = useState<string[]>([]);

  const toggleExpand = (productId: string) => {
    setExpandedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const filteredProducts = products.filter(product => {
    const lowerQuery = searchQuery.toLowerCase();
    const matchesName = product.name.toLowerCase().includes(lowerQuery);
    const matchesVariations = product.variations?.some(v =>
      v.name.toLowerCase().includes(lowerQuery)
    );
    return matchesName || matchesVariations;
  });

  const handleDeleteProduct = (id: string, name: string): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showAlert({
      title: 'Deletar Produto',
      description: `Tem certeza que deseja deletar o produto "${name}"?`,
      type: 'confirm',
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(id);
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
            } catch (error) {
              console.error('Erro ao excluir produto:', error);
            }
          }
        }
      ]
    });
  };

  const handleAddCategory = async (name: string) => {
    try {
      await addCategory(name);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
    }
  };

  const handleDeleteCategory = (id: string, name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showAlert({
      title: 'Deletar Categoria',
      description: `Tem certeza que deseja deletar a categoria "${name}"?`,
      type: 'confirm',
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(id);
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
            } catch (error) {
              console.error('Erro ao excluir categoria:', error);
            }
          }
        }
      ]
    });
  };

  if (loading) {
    return (
      <View className="bg-background dark:bg-zinc-950 flex-1">
        <Header />
        <StockSkeleton />
      </View>
    );
  }

  return (
    <View className="bg-background dark:bg-zinc-950 flex-1">
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-6 py-6">
          <View className="mb-6">
            <Text className="text-text-primary dark:text-zinc-100 font-bold text-2xl">
              Gestão de Estoque
            </Text>
            <Text className="text-text-secondary dark:text-zinc-400 text-base">
              Acompanhe as quantidades disponíveis em tempo real.
            </Text>
          </View>

          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            customClass="mb-6"
          />

          <Animated.View layout={LinearTransition} className="gap-y-4">
            {filteredProducts.map((product, index) => (
              <Animated.View
                key={product.id}
                entering={FadeInDown.delay(index * 30).duration(300)}
                exiting={FadeOut.duration(200)}
                layout={LinearTransition}
              >
                <StockProductItem
                  product={product}
                  isExpanded={expandedProducts.includes(product.id)}
                  onToggleExpand={() => toggleExpand(product.id)}
                  isAdmin={isAdmin}
                  colorScheme={colorScheme}
                  onEdit={() => {
                    Haptics.selectionAsync();
                    router.push(`/edit-product/${product.id}`);
                  }}
                  onDelete={() => handleDeleteProduct(product.id, product.name)}
                />
              </Animated.View>
            ))}
          </Animated.View>

          {/* Low Stock Warning */}
          {products.some(p => p.stock <= 5 && p.stock > 0) && (
            <View className="mt-10 flex-row items-center rounded-2xl bg-orange-50 dark:bg-orange-900/20 p-4 border border-orange-100 dark:border-orange-900/30">
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={24}
                color={colorScheme === 'dark' ? '#fb923c' : '#C2410C'}
              />
              <Text className="text-orange-800 dark:text-orange-300 ml-3 flex-1 font-medium">
                Existem itens com baixo estoque. Considere reabastecer em breve.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Options Modal */}
      <Modal
        visible={showOptions}
        transparent
        animationType="none"
        onRequestClose={() => setShowOptions(false)}
      >
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            className="absolute inset-0 bg-black/50"
          >
            <Pressable
              className="flex-1"
              onPress={() => setShowOptions(false)}
            />
          </Animated.View>

          <Animated.View
            entering={ZoomIn.springify().damping(15)}
            exiting={ZoomOut}
            className="bg-white dark:bg-zinc-900 w-full rounded-3xl p-6 overflow-hidden shadow-2xl"
          >
            <Text className="text-text-primary dark:text-zinc-100 font-bold text-xl mb-6 text-center">
              O que deseja fazer?
            </Text>

            <TouchableOpacity
              className="bg-primary dark:bg-orange-600 flex-row items-center justify-center py-4 rounded-2xl mb-4"
              onPress={() => {
                Haptics.selectionAsync();
                setShowOptions(false);
                router.push('/new-product');
              }}
            >
              <MaterialCommunityIcons name="plus-box" size={24} color="white" />
              <Text className="text-white font-bold ml-2 text-lg">
                Novo Produto
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-secondary dark:bg-zinc-800 flex-row items-center justify-center py-4 rounded-2xl"
              onPress={() => {
                Haptics.selectionAsync();
                setShowOptions(false);
                setShowCategoryManager(true);
              }}
            >
              <MaterialCommunityIcons
                name="shape-outline"
                size={24}
                color={colorScheme === 'dark' ? '#fb923c' : '#A34211'}
              />
              <Text className="text-primary dark:text-orange-400 font-bold ml-2 text-lg">
                Gerenciar Categorias
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Category Manager Modal */}
      <CategoryManagerModal
        visible={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
        categories={categories}
        colorScheme={colorScheme}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* Floating Action Button */}
      {isAdmin && (
        <TouchableOpacity
          className="bg-primary dark:bg-orange-600 shadow-primary/40 dark:shadow-orange-950/40 absolute bottom-6 right-6 h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
          activeOpacity={0.8}
          onPress={() => {
            Haptics.selectionAsync();
            setShowOptions(true);
          }}
        >
          <MaterialCommunityIcons
            name="plus-box-outline"
            size={32}
            color="white"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default Stock;
