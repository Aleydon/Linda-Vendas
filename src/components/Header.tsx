import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';

import { useAppContext } from '@/context/AppContext';

export function Header() {
  const { user, signOut } = useAppContext();

  const handleSignOut = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/login');
        }
      }
    ]);
  };

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

      <TouchableOpacity
        onPress={handleSignOut}
        className="border-secondary bg-secondary h-10 w-10 items-center justify-center overflow-hidden rounded-full border"
      >
        {user?.user_metadata?.avatar_url ? (
          <Image
            source={{ uri: user.user_metadata.avatar_url }}
            className="h-full w-full"
          />
        ) : (
          <MaterialCommunityIcons name="account" size={24} color="#A34211" />
        )}
      </TouchableOpacity>
    </View>
  );
}
