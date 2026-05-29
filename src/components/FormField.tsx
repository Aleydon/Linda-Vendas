import React from 'react';
import { Text, TextInput, View } from 'react-native';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'decimal-pad';
  placeholder?: string;
  multiline?: boolean;
}

export function FormField({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  placeholder,
  multiline = false
}: FormFieldProps): React.JSX.Element {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-text-secondary font-medium text-sm uppercase tracking-wider">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        className="rounded-2xl border border-secondary bg-white px-4 py-4 text-text-primary"
        placeholder={placeholder || `Insira o ${label.toLowerCase()}`}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );
}
