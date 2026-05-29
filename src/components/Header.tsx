import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, Text, View } from 'react-native';

import Logo from '../assets/icon.png';
export function Header() {
  return (
    <View className="border-secondary bg-background flex-row items-center justify-between border-b px-6 pb-4 pt-12">
      <View className="flex-row items-center">
        <MaterialCommunityIcons
          name="storefront-outline"
          size={28}
          color="#A34211"
        />
        <Text className="text-text-primary ml-2 font-bold text-xl">
          Linda Vendas
        </Text>
      </View>
      <View className="border-secondary bg-secondary h-10 w-10 items-center justify-center overflow-hidden rounded-full border">
        {/* Placeholder for profile image */}
        {/* <MaterialCommunityIcons name="account" size={24} color="#A34211" /> */}
        <Image source={Logo} className="h-full w-full" />
      </View>
    </View>
  );
}
