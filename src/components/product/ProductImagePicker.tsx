import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

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
  return (
    <TouchableOpacity
      onPress={onPickImage}
      disabled={isUploading}
      activeOpacity={0.7}
      className="border-primary overflow-hidden rounded-3xl border bg-white shadow-sm border-dotted "
    >
      <View className="relative h-40 w-full">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center bg-gray-100">
            {isUploading ? (
              <ActivityIndicator color="#A34211" />
            ) : (
              <View className="items-center justify-center">
                <MaterialCommunityIcons
                  name="camera-plus-outline"
                  size={40}
                  color="#A34211"
                />
                <Text className="text-primary mt-2 text-center text-lg">
                  Adicionar imagem
                </Text>
              </View>
            )}
            {!isUploading && (
              <View>
                <Text className="text-text-secondary  text-center text-sm py-2">
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
          <View className="absolute right-4 top-4 rounded-lg bg-primary px-3 py-1">
            <Text className="font-bold text-white text-[10px] uppercase">
              {isStocked ? 'Em estoque' : 'Esgotado'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
