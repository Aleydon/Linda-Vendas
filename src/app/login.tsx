import { AntDesign } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Loading } from '@/components/Loading';
import { useAppContext } from '@/context/AppContext';

export default function Login() {
  const { signInWithGoogle } = useAppContext();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isLoggingIn) {
    return <Loading />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
      <View className="items-center mb-12">
        <View className="w-24 h-24 bg-red-800 rounded-full items-center justify-center mb-4">
          <AntDesign name="shoppingcart" size={48} color="white" />
        </View>
        <Text className="text-3xl font-bold text-gray-800">Linda Vendas</Text>
        <Text className="text-gray-500 mt-2 text-center">
          Gerencie suas vendas e estoque de forma simples e eficiente.
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleGoogleLogin}
        className="flex-row items-center justify-center w-full bg-white border border-gray-300 py-4 rounded-xl shadow-sm"
      >
        <Image
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png'
          }}
          className="w-6 h-6 mr-3"
        />
        <Text className="text-gray-700 text-lg font-medium">
          Continuar com Google
        </Text>
      </TouchableOpacity>

      <Text className="text-gray-400 mt-8 text-xs text-center">
        Ao continuar, você concorda com nossos Termos de Serviço e Política de
        Privacidade.
      </Text>
    </SafeAreaView>
  );
}
