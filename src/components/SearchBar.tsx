import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';

import { useAppContext } from '@/context/AppContext';

interface SearchBarProps {
  value: string;
  customClass?: string;
  placeholder?: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Buscar produtos...',
  customClass,
  onClear
}: SearchBarProps) {
  const { colorScheme } = useAppContext();

  return (
    <View className={customClass || 'px-6 py-6'}>
      <View className="border-secondary dark:border-zinc-800 flex-row items-center rounded-2xl border bg-white dark:bg-zinc-900 px-4 py-3 shadow-sm">
        <MaterialCommunityIcons
          name="magnify"
          size={24}
          color={colorScheme === 'dark' ? '#71717a' : '#8C7E7E'}
        />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={colorScheme === 'dark' ? '#71717a' : '#8C7E7E'}
          value={value}
          onChangeText={onChangeText}
          className="ml-2 flex-1 font-medium text-base text-text-primary dark:text-zinc-100"
          autoCapitalize="none"
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => (onClear ? onClear() : onChangeText(''))}
            className="p-1"
          >
            <MaterialCommunityIcons
              name="close-circle"
              size={20}
              color={colorScheme === 'dark' ? '#71717a' : '#8C7E7E'}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
