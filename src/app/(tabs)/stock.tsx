import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  ZoomIn,
  ZoomOut
} from 'react-native-reanimated';

import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { SearchBar } from '@/components/SearchBar';
import { useAppContext } from '@/context/AppContext';

export function Stock(): React.JSX.Element {
  const {
    products,
    categories,
    loading,
    deleteProduct,
    addCategory,
    deleteCategory,
    isAdmin
  } = useAppContext();
  const [showOptions, setShowOptions] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
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
    Alert.alert(
      'Deletar Produto',
      `Tem certeza que deseja deletar o produto "${name}"?`,
      [
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
    );
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      return;
    }
    try {
      await addCategory(newCategoryName.trim());
      setNewCategoryName('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
    }
  };

  const handleDeleteCategory = (id: string, name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Deletar Categoria',
      `Tem certeza que deseja deletar a categoria "${name}"?`,
      [
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
    );
  };

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-6 py-6">
          <View className="mb-6">
            <Text className="text-text-primary font-bold text-2xl">
              Gestão de Estoque
            </Text>
            <Text className="text-text-secondary text-base">
              Acompanhe as quantidades disponíveis em tempo real.
            </Text>
          </View>

          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            customClass="mb-6"
          />

          <View className="gap-y-4">
            {filteredProducts.map(product => {
              const isExpanded = expandedProducts.includes(product.id);
              const totalStock = product.stock;

              return (
                <View
                  key={product.id}
                  className="border-secondary rounded-2xl border bg-white shadow-sm overflow-hidden"
                >
                  <TouchableOpacity
                    activeOpacity={product.has_variations ? 0.7 : 1}
                    onPress={() =>
                      product.has_variations && toggleExpand(product.id)
                    }
                    className="flex-row items-center justify-between p-5"
                  >
                    <View className="flex-1">
                      <Text className="text-text-primary font-bold text-lg">
                        {product.name}
                      </Text>
                      <Text className="text-text-secondary text-sm">
                        {product.category || 'Sem Categoria'}
                      </Text>
                      {product.has_variations && (
                        <View className="flex-row items-center mt-1">
                          <Text className="text-primary text-[10px] font-bold uppercase mr-1">
                            {product.variations?.length || 0} Variações
                          </Text>
                          <MaterialCommunityIcons
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={14}
                            color="#A34211"
                          />
                        </View>
                      )}
                    </View>

                    <View className="items-end">
                      <View
                        className={`rounded-full px-3 py-1 ${
                          totalStock > 10
                            ? 'bg-teal-50'
                            : totalStock > 0
                              ? 'bg-orange-50'
                              : 'bg-red-50'
                        }`}
                      >
                        <Text
                          className={`font-bold text-sm ${
                            totalStock > 10
                              ? 'text-teal-700'
                              : totalStock > 0
                                ? 'text-orange-700'
                                : 'text-red-700'
                          }`}
                        >
                          {totalStock} un
                        </Text>
                      </View>
                      <Text className="text-text-muted mt-1 text-[10px] uppercase">
                        {totalStock === 0 ? 'Esgotado' : 'Disponível'}
                      </Text>
                    </View>

                    {isAdmin && (
                      <View className="ml-4 flex-row">
                        <TouchableOpacity
                          className="mr-2 rounded-full bg-gray-100 p-2"
                          onPress={() => {
                            Haptics.selectionAsync();
                            router.push(`/edit-product/${product.id}`);
                          }}
                        >
                          <MaterialCommunityIcons
                            name="pencil"
                            size={20}
                            color="#4B5563"
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          className="rounded-full bg-red-50 p-2"
                          onPress={() =>
                            handleDeleteProduct(product.id, product.name)
                          }
                        >
                          <MaterialCommunityIcons
                            name="trash-can-outline"
                            size={20}
                            color="#EF4444"
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </TouchableOpacity>

                  {product.has_variations &&
                    isExpanded &&
                    product.variations &&
                    product.variations.length > 0 && (
                      <Animated.View
                        entering={FadeIn.duration(300)}
                        exiting={FadeOut.duration(200)}
                        className="bg-secondary/10 px-5 pb-4 border-t border-secondary/20"
                      >
                        {product.variations.map(v => (
                          <View
                            key={v.id}
                            className="flex-row justify-between py-3 border-b border-secondary/10 last:border-b-0"
                          >
                            <Text className="text-text-secondary text-sm">
                              {v.name}
                            </Text>
                            <View className="flex-row items-center">
                              <Text className="text-text-primary font-bold text-sm mr-2">
                                {v.stock} un
                              </Text>
                              <View
                                className={`w-2 h-2 rounded-full ${
                                  v.stock > 0 ? 'bg-teal-500' : 'bg-red-500'
                                }`}
                              />
                            </View>
                          </View>
                        ))}
                      </Animated.View>
                    )}
                </View>
              );
            })}
          </View>

          {/* Low Stock Warning */}
          {products.some(p => {
            const totalStock = p.stock;
            return totalStock <= 5 && totalStock > 0;
          }) && (
            <View className="mt-10 flex-row items-center rounded-2xl bg-orange-50 p-4 border border-orange-100">
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={24}
                color="#C2410C"
              />
              <Text className="text-orange-800 ml-3 flex-1 font-medium">
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
            className="bg-white w-full rounded-3xl p-6 overflow-hidden shadow-2xl"
          >
            <Text className="text-text-primary font-bold text-xl mb-6 text-center">
              O que deseja fazer?
            </Text>

            <TouchableOpacity
              className="bg-primary flex-row items-center justify-center py-4 rounded-2xl mb-4"
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
              className="bg-secondary flex-row items-center justify-center py-4 rounded-2xl"
              onPress={() => {
                Haptics.selectionAsync();
                setShowOptions(false);
                setShowCategoryManager(true);
              }}
            >
              <MaterialCommunityIcons
                name="shape-outline"
                size={24}
                color="#A34211"
              />
              <Text className="text-primary font-bold ml-2 text-lg">
                Gerenciar Categorias
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Category Manager Modal */}
      <Modal
        visible={showCategoryManager}
        transparent
        animationType="none"
        onRequestClose={() => setShowCategoryManager(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View className="flex-1 justify-end">
            <Animated.View
              entering={FadeIn}
              exiting={FadeOut}
              className="absolute inset-0 bg-black/50"
            >
              <Pressable
                className="flex-1"
                onPress={() => setShowCategoryManager(false)}
              />
            </Animated.View>

            <Animated.View
              entering={SlideInDown.springify().damping(15)}
              exiting={SlideOutDown}
              className="bg-white h-[70%] rounded-t-3xl p-6 shadow-2xl"
            >
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-text-primary font-bold text-xl">
                  Gerenciar Categorias
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCategoryManager(false)}
                  className="p-1"
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={28}
                    color="#3C2F2F"
                  />
                </TouchableOpacity>
              </View>

              <View className="flex-row mb-6">
                <TextInput
                  className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-text-primary mr-2"
                  placeholder="Nova categoria..."
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                />
                <TouchableOpacity
                  className="bg-primary p-3 rounded-xl items-center justify-center"
                  onPress={handleAddCategory}
                >
                  <MaterialCommunityIcons name="plus" size={24} color="white" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={categories}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
                    <Text className="text-text-primary text-lg">
                      {item.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteCategory(item.id, item.name)}
                      className="p-2"
                    >
                      <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={22}
                        color="#EF4444"
                      />
                    </TouchableOpacity>
                  </View>
                )}
                ListEmptyComponent={() => (
                  <Text className="text-text-secondary text-center mt-10">
                    Nenhuma categoria cadastrada.
                  </Text>
                )}
              />
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Floating Action Button */}
      {isAdmin && (
        <TouchableOpacity
          className="bg-primary shadow-primary/40 absolute bottom-6 right-6 h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
