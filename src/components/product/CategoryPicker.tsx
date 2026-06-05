import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { Category } from '@/context/AppContext';

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
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  return (
    <View className="mb-4">
      <Text className="mb-2 text-text-secondary font-medium text-sm uppercase tracking-wider">
        Categoria
      </Text>
      <TouchableOpacity
        onPress={() => setShowDropdown(true)}
        activeOpacity={0.7}
        className="flex-row items-center justify-between rounded-2xl border border-secondary bg-white px-4 py-4"
      >
        <Text
          className={
            selectedCategoryId
              ? 'text-text-primary font-medium'
              : 'text-text-muted'
          }
        >
          {selectedCategory ? selectedCategory.name : 'Selecione uma categoria'}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={24} color="#8C7E7E" />
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
          <View className="bg-white rounded-3xl overflow-hidden max-h-[60%] shadow-2xl">
            <View className="p-4 border-b border-secondary flex-row justify-between items-center bg-gray-50">
              <Text className="text-text-primary font-bold text-lg">
                Escolher Categoria
              </Text>
              <TouchableOpacity onPress={() => setShowDropdown(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color="#3C2F2F"
                />
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onSelectCategory(item.id);
                    setShowDropdown(false);
                  }}
                  className={`px-6 py-4 border-b border-gray-50 flex-row items-center justify-between ${
                    selectedCategoryId === item.id ? 'bg-primary/5' : ''
                  }`}
                >
                  <Text
                    className={`text-base ${
                      selectedCategoryId === item.id
                        ? 'text-primary font-bold'
                        : 'text-text-primary'
                    }`}
                  >
                    {item.name}
                  </Text>
                  {selectedCategoryId === item.id && (
                    <MaterialCommunityIcons
                      name="check"
                      size={20}
                      color="#A34211"
                    />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View className="p-10 items-center">
                  <Text className="text-text-secondary text-center">
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
