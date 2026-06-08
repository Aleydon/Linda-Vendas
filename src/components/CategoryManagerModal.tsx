import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
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
  FadeInDown,
  FadeOut,
  LinearTransition,
  SlideInDown,
  SlideOutDown
} from 'react-native-reanimated';

import { Category } from '@/context/types';

interface CategoryManagerModalProps {
  visible: boolean;
  onClose: () => void;
  categories: Category[];
  colorScheme: 'light' | 'dark';
  onAddCategory: (name: string) => Promise<void>;
  onDeleteCategory: (id: string, name: string) => void;
  onReorderCategories: (newCategories: Category[]) => Promise<void>;
}

export function CategoryManagerModal({
  visible,
  onClose,
  categories,
  colorScheme,
  onAddCategory,
  onDeleteCategory,
  onReorderCategories
}: CategoryManagerModalProps) {
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAdd = async () => {
    if (!newCategoryName.trim()) return;
    await onAddCategory(newCategoryName.trim());
    setNewCategoryName('');
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newCategories = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newCategories.length) return;

    Haptics.selectionAsync();
    [newCategories[index], newCategories[targetIndex]] = [
      newCategories[targetIndex],
      newCategories[index]
    ];

    await onReorderCategories(newCategories);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
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
            <Pressable className="flex-1" onPress={onClose} />
          </Animated.View>

          <Animated.View
            entering={SlideInDown.springify().damping(15)}
            exiting={SlideOutDown}
            className="bg-white dark:bg-zinc-900 h-[70%] rounded-t-3xl p-6 shadow-2xl"
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-text-primary dark:text-zinc-100 font-bold text-xl">
                Gerenciar Categorias
              </Text>
              <TouchableOpacity onPress={onClose} className="p-1">
                <MaterialCommunityIcons
                  name="close"
                  size={28}
                  color={colorScheme === 'dark' ? '#fb923c' : '#3C2F2F'}
                />
              </TouchableOpacity>
            </View>

            <View className="flex-row mb-6">
              <TextInput
                className="flex-1 bg-gray-100 dark:bg-zinc-800 rounded-xl px-4 py-3 text-text-primary dark:text-zinc-100 mr-2"
                placeholder="Nova categoria..."
                placeholderTextColor={
                  colorScheme === 'dark' ? '#71717a' : '#8C7E7E'
                }
                value={newCategoryName}
                onChangeText={setNewCategoryName}
              />
              <TouchableOpacity
                className="bg-primary dark:bg-orange-600 p-3 rounded-xl items-center justify-center"
                onPress={handleAdd}
              >
                <MaterialCommunityIcons name="plus" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              <Animated.View layout={LinearTransition}>
                {categories.length > 0 ? (
                  categories.map((item, index) => (
                    <Animated.View
                      key={item.id}
                      entering={FadeInDown.delay(index * 30).duration(300)}
                      exiting={FadeOut}
                      layout={LinearTransition}
                      className="flex-row items-center py-3 border-b border-gray-100 dark:border-zinc-800"
                    >
                      <View className="flex-row mr-2">
                        <TouchableOpacity
                          onPress={() => handleMove(index, 'up')}
                          disabled={index === 0}
                          className={`p-1 ${index === 0 ? 'opacity-20' : ''}`}
                        >
                          <MaterialCommunityIcons
                            name="chevron-up"
                            size={24}
                            color={
                              colorScheme === 'dark' ? '#fb923c' : '#3C2F2F'
                            }
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleMove(index, 'down')}
                          disabled={index === categories.length - 1}
                          className={`p-1 ${index === categories.length - 1 ? 'opacity-20' : ''}`}
                        >
                          <MaterialCommunityIcons
                            name="chevron-down"
                            size={24}
                            color={
                              colorScheme === 'dark' ? '#fb923c' : '#3C2F2F'
                            }
                          />
                        </TouchableOpacity>
                      </View>

                      <Text className="flex-1 text-text-primary dark:text-zinc-200 text-lg">
                        {item.name}
                      </Text>

                      <TouchableOpacity
                        onPress={() => onDeleteCategory(item.id, item.name)}
                        className="p-2"
                      >
                        <MaterialCommunityIcons
                          name="trash-can-outline"
                          size={22}
                          color="#EF4444"
                        />
                      </TouchableOpacity>
                    </Animated.View>
                  ))
                ) : (
                  <Text className="text-text-secondary dark:text-zinc-500 text-center mt-10">
                    Nenhuma categoria cadastrada.
                  </Text>
                )}
              </Animated.View>
            </ScrollView>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
export default CategoryManagerModal;
