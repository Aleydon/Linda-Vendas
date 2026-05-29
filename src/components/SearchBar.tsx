import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Buscar produtos...',
  onClear
}: SearchBarProps) {
  return (
    <View className="px-6 py-4">
      <View className="border-secondary bg-surface flex-row items-center rounded-xl border px-4 py-2">
        <MaterialCommunityIcons name="magnify" size={24} color="#8C7E7E" />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#BDB2B2"
          value={value}
          onChangeText={onChangeText}
          className="text-text-primary ml-2 flex-1 text-base"
          autoCapitalize="none"
        />
        {value.length > 0 && onClear && (
          <TouchableOpacity onPress={onClear} className="p-1">
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
