import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Toast as toast } from 'expo-react-native-toastify';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { useAppContext } from '@/context/AppContext';

export function Stock(): React.JSX.Element {
  const {
    products,
    categories,
    loading,
    deleteProduct,
    addCategory,
    deleteCategory
  } = useAppContext();
  const [showOptions, setShowOptions] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleDeleteProduct = (id: string, name: string): void => {
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
              toast.success('Produto excluído com sucesso!');
            } catch (error) {
              toast.error(
                'Erro ao excluir produto.',
                error instanceof Error ? error.message : undefined
              );
            }
          }
        }
      ]
    );
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('O nome da categoria não pode estar vazio.');
      return;
    }
    try {
      await addCategory(newCategoryName.trim());
      setNewCategoryName('');
      toast.success('Categoria adicionada com sucesso!');
    } catch (error) {
      toast.error(
        'Erro ao adicionar categoria.',
        error instanceof Error ? error.message : undefined
      );
    }
  };

  const handleDeleteCategory = (id: string, name: string) => {
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
              toast.success('Categoria excluída com sucesso!');
            } catch (error) {
              toast.error(
                'Erro ao excluir categoria.',
                error instanceof Error ? error.message : undefined
              );
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

          <View className="gap-y-4">
            {products.map(product => (
              <View
                key={product.id}
                className="border-secondary flex-row items-center justify-between rounded-2xl border bg-white p-5 shadow-sm"
              >
                <View className="flex-1">
                  <Text className="text-text-primary font-bold text-lg">
                    {product.name}
                  </Text>
                  <Text className="text-text-secondary text-sm">
                    {product.category || 'Sem Categoria'}
                  </Text>
                </View>

                <View className="items-end">
                  <View
                    className={`rounded-full px-3 py-1 ${
                      product.stock > 10
                        ? 'bg-teal-50'
                        : product.stock > 0
                          ? 'bg-orange-50'
                          : 'bg-red-50'
                    }`}
                  >
                    <Text
                      className={`font-bold text-sm ${
                        product.stock > 10
                          ? 'text-teal-700'
                          : product.stock > 0
                            ? 'text-orange-700'
                            : 'text-red-700'
                      }`}
                    >
                      {product.stock} un
                    </Text>
                  </View>
                  <Text className="text-text-muted mt-1 text-[10px] uppercase">
                    {product.stock === 0 ? 'Esgotado' : 'Disponível'}
                  </Text>
                </View>

                <View className="ml-4 flex-row">
                  <TouchableOpacity
                    className="mr-2 rounded-full bg-gray-100 p-2"
                    onPress={() => router.push(`/edit-product/${product.id}`)}
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
              </View>
            ))}
          </View>

          {/* Low Stock Warning */}
          {products.some(p => p.stock <= 5 && p.stock > 0) && (
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
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 items-center justify-center px-6"
          activeOpacity={1}
          onPress={() => setShowOptions(false)}
        >
          <View className="bg-white w-full rounded-3xl p-6 overflow-hidden">
            <Text className="text-text-primary font-bold text-xl mb-6 text-center">
              O que deseja fazer?
            </Text>

            <TouchableOpacity
              className="bg-primary flex-row items-center justify-center py-4 rounded-2xl mb-4"
              onPress={() => {
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
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Category Manager Modal */}
      <Modal
        visible={showCategoryManager}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryManager(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white h-[70%] rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-text-primary font-bold text-xl">
                Gerenciar Categorias
              </Text>
              <TouchableOpacity onPress={() => setShowCategoryManager(false)}>
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
                  <Text className="text-text-primary text-lg">{item.name}</Text>
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
          </View>
        </View>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="bg-primary shadow-primary/40 absolute bottom-6 right-6 h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
        activeOpacity={0.8}
        onPress={() => setShowOptions(true)}
      >
        <MaterialCommunityIcons
          name="plus-box-outline"
          size={32}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );
}

export default Stock;
