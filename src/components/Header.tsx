import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { useAppContext } from '@/context/AppContext';

export function Header() {
  const { user, colorScheme } = useAppContext();

  const handleProfilePress = () => {
    router.push('/profile');
  };

  return (
    <View className="border-secondary dark:border-zinc-800 bg-background dark:bg-zinc-950 flex-row items-center justify-between border-b px-6 pb-4 pt-12">
      <View className="flex-row items-center">
        <MaterialCommunityIcons
          name="storefront-outline"
          size={28}
          color={colorScheme === 'dark' ? '#F5EBE0' : '#A34211'}
        />
        <Text className="text-text-primary dark:text-zinc-100 ml-2 font-bold text-xl">
          Linda Vendas
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleProfilePress}
        className="border-secondary dark:border-zinc-800 bg-secondary dark:bg-zinc-800 h-10 w-10 items-center justify-center overflow-hidden rounded-full border"
      >
        {user?.user_metadata?.avatar_url ? (
          <Image
            source={{ uri: user.user_metadata.avatar_url }}
            className="h-full w-full"
          />
        ) : (
          <MaterialCommunityIcons
            name="account"
            size={24}
            color={colorScheme === 'dark' ? '#F5EBE0' : '#A34211'}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}
