import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface CategoryItemProps {
  label: string;
  isActive?: boolean;
  onPress?: () => void;
}

export function CategoryItem({
  label,
  isActive,
  onPress
}: CategoryItemProps): React.JSX.Element {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`mr-3 rounded-full border px-chip-x py-chip-y ${
        isActive
          ? 'border-category-chip-active bg-category-chip-active dark:border-orange-600 dark:bg-orange-600'
          : 'border-secondary bg-category-chip dark:bg-zinc-800 dark:border-zinc-800'
      }`}
    >
      <Text
        className={`font-semibold text-chip ${
          isActive ? 'text-white' : 'text-text-primary dark:text-zinc-300'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
