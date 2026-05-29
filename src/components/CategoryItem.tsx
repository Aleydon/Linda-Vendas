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
      className={`mr-3 rounded-full border px-6 py-2 ${
        isActive ? 'border-primary bg-primary' : 'border-secondary bg-secondary'
      }`}
    >
      <Text
        className={`font-semibold text-sm ${
          isActive ? 'text-white' : 'text-text-primary'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
