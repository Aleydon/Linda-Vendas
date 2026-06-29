import React from 'react';
import { Text, TextInput, View } from 'react-native';

import { useAppContext } from '@/context/AppContext';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'decimal-pad';
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
}

export function FormField({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  placeholder,
  multiline = false,
  numberOfLines
}: FormFieldProps): React.JSX.Element {
  const { colorScheme } = useAppContext();

  return (
    <View className="mb-4 w-full">
      <Text className="mb-2 text-text-secondary dark:text-zinc-400 font-medium text-sm uppercase tracking-wider">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        className="rounded-2xl border border-secondary dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-4 text-text-primary dark:text-zinc-100 w-full"
        placeholder={placeholder || `Insira o ${label.toLowerCase()}`}
        placeholderTextColor={colorScheme === 'dark' ? '#71717a' : '#9CA3AF'}
      />
    </View>
  );
}
