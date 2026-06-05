import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';

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
  return (
    <View className={customClass || 'px-6 py-6'}>
      <View className="border-secondary flex-row items-center rounded-2xl border bg-white px-4 py-3 shadow-sm">
        <MaterialCommunityIcons name="magnify" size={24} color="#8C7E7E" />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#8C7E7E"
          value={value}
          onChangeText={onChangeText}
          className="ml-2 flex-1 font-medium text-base text-text-primary"
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
              color="#8C7E7E"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
