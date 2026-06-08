import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { Category, useAppContext } from '@/context/AppContext';

interface CategoryPickerProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
}

export function CategoryPicker({
  categories,
  selectedCategoryId,
  onSelectCategory,
  showDropdown,
  setShowDropdown
}: CategoryPickerProps) {
  const { colorScheme, addCategory, isAdmin } = useAppContext();
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  const [newCatName, setNewCatName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [pendingSelectionName, setPendingSelectionName] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (pendingSelectionName) {
      const found = categories.find(
        c => c.name.toLowerCase() === pendingSelectionName.toLowerCase()
      );
      if (found) {
        onSelectCategory(found.id);
        setPendingSelectionName(null);
        setShowDropdown(false);
      }
    }
  }, [categories, pendingSelectionName, onSelectCategory, setShowDropdown]);

  const handleCreateCategory = async () => {
    const categoryName = newCatName.trim();
    if (!categoryName) return;

    setIsAdding(true);
    try {
      setPendingSelectionName(categoryName);
      await addCategory(categoryName);
      setNewCatName('');
    } catch (error) {
      console.error('Erro ao adicionar categoria rápida:', error);
      setPendingSelectionName(null);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <View className="mb-4">
      <Text className="mb-2 text-text-secondary dark:text-zinc-400 font-medium text-sm uppercase tracking-wider">
        Categoria
      </Text>
      <TouchableOpacity
        onPress={() => setShowDropdown(true)}
        activeOpacity={0.7}
        className="flex-row items-center justify-between rounded-2xl border border-secondary dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-4"
      >
        <Text
          className={
            selectedCategoryId
              ? 'text-text-primary dark:text-zinc-100 font-medium'
              : 'text-text-muted dark:text-zinc-500'
          }
        >
          {selectedCategory ? selectedCategory.name : 'Selecione uma categoria'}
        </Text>
        <MaterialCommunityIcons
          name="chevron-down"
          size={24}
          color={colorScheme === 'dark' ? '#71717a' : '#8C7E7E'}
        />
      </TouchableOpacity>

      <Modal
        visible={showDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-center px-6"
          onPress={() => setShowDropdown(false)}
        >
          <View className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden max-h-[60%] shadow-2xl">
            <View className="p-4 border-b border-secondary dark:border-zinc-800 flex-row justify-between items-center bg-gray-50 dark:bg-zinc-800/50">
              <Text className="text-text-primary dark:text-zinc-100 font-bold text-lg">
                Escolher Categoria
              </Text>
              <TouchableOpacity onPress={() => setShowDropdown(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={colorScheme === 'dark' ? '#F5EBE0' : '#3C2F2F'}
                />
              </TouchableOpacity>
            </View>

            {isAdmin && (
              <View className="px-4 py-3 border-b border-secondary dark:border-zinc-800 flex-row items-center bg-gray-50 dark:bg-zinc-800/20">
                <TextInput
                  className="flex-1 bg-gray-100 dark:bg-zinc-800 rounded-xl px-4 py-3 text-text-primary dark:text-zinc-100 mr-2 text-sm"
                  placeholder="Criar nova categoria..."
                  placeholderTextColor={
                    colorScheme === 'dark' ? '#71717a' : '#8C7E7E'
                  }
                  value={newCatName}
                  onChangeText={setNewCatName}
                  editable={!isAdding}
                />
                <TouchableOpacity
                  className="bg-primary dark:bg-orange-600 p-3 rounded-xl items-center justify-center h-11 w-11"
                  onPress={handleCreateCategory}
                  disabled={isAdding}
                  activeOpacity={0.8}
                >
                  {isAdding ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <MaterialCommunityIcons
                      name="plus"
                      size={20}
                      color="white"
                    />
                  )}
                </TouchableOpacity>
              </View>
            )}

            <FlatList
              data={categories}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onSelectCategory(item.id);
                    setShowDropdown(false);
                  }}
                  className={`px-6 py-4 border-b border-gray-50 dark:border-zinc-800/50 flex-row items-center justify-between ${
                    selectedCategoryId === item.id
                      ? 'bg-primary/5 dark:bg-orange-500/10'
                      : ''
                  }`}
                >
                  <Text
                    className={`text-base ${
                      selectedCategoryId === item.id
                        ? 'text-primary dark:text-orange-400 font-bold'
                        : 'text-text-primary dark:text-zinc-200'
                    }`}
                  >
                    {item.name}
                  </Text>
                  {selectedCategoryId === item.id && (
                    <MaterialCommunityIcons
                      name="check"
                      size={20}
                      color={colorScheme === 'dark' ? '#fb923c' : '#A34211'}
                    />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View className="p-10 items-center">
                  <Text className="text-text-secondary dark:text-zinc-500 text-center">
                    Nenhuma categoria encontrada.
                  </Text>
                </View>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export default CategoryPicker;
