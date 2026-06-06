import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { useAppContext } from '@/context/AppContext';

interface ProductImagePickerProps {
  imageUrl: string;
  isUploading: boolean;
  onPickImage: () => void;
  isStocked?: boolean;
}

export function ProductImagePicker({
  imageUrl,
  isUploading,
  onPickImage,
  isStocked
}: ProductImagePickerProps) {
  const { colorScheme } = useAppContext();

  return (
    <TouchableOpacity
      onPress={onPickImage}
      disabled={isUploading}
      activeOpacity={0.7}
      className="border-primary dark:border-orange-600 overflow-hidden rounded-3xl border bg-white dark:bg-zinc-900 shadow-sm border-dotted "
    >
      <View className="relative h-40 w-full">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center bg-gray-100 dark:bg-zinc-800">
            {isUploading ? (
              <ActivityIndicator
                color={colorScheme === 'dark' ? '#fb923c' : '#A34211'}
              />
            ) : (
              <View className="items-center justify-center">
                <MaterialCommunityIcons
                  name="camera-plus-outline"
                  size={40}
                  color={colorScheme === 'dark' ? '#fb923c' : '#A34211'}
                />
                <Text className="text-primary dark:text-orange-400 mt-2 text-center text-lg">
                  Adicionar imagem
                </Text>
              </View>
            )}
            {!isUploading && (
              <View>
                <Text className="text-text-secondary dark:text-zinc-500 text-center text-sm py-2">
                  Opcional
                </Text>
              </View>
            )}
          </View>
        )}
        {isUploading && (
          <View className="absolute inset-0 items-center justify-center bg-black/20">
            <ActivityIndicator color="white" />
          </View>
        )}
        {isStocked !== undefined && (
          <View className="absolute right-4 top-4 rounded-lg bg-primary dark:bg-orange-600 px-3 py-1">
            <Text className="font-bold text-white text-[10px] uppercase">
              {isStocked ? 'Em estoque' : 'Esgotado'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
