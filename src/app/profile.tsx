import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardTypeOptions,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppContext } from '@/context/AppContext';

export default function Profile() {
  const { user, profile, signOut, updateProfile } = useAppContext();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPixExpanded, setIsPixExpanded] = useState(false);

  const [pixKey, setPixKey] = useState(profile?.pix_key || '');
  const [pixName, setPixName] = useState(profile?.pix_name || '');
  const [pixCity, setPixCity] = useState(profile?.pix_city || '');

  const isPixConfigured = !!(
    profile?.pix_key &&
    profile?.pix_name &&
    profile?.pix_city
  );

  // Dynamic keyboard detection
  const getKeyboardType = (): KeyboardTypeOptions => {
    if (!pixKey) return 'default';
    if (/^\d+$/.test(pixKey.replace(/[-.() ]/g, ''))) return 'numeric';
    if (pixKey.includes('@')) return 'email-address';
    return 'default';
  };

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

  const handleUpdatePix = async () => {
    try {
      setIsUpdating(true);
      await updateProfile({
        pix_key: pixKey,
        pix_name: pixName,
        pix_city: pixCity
      });
      Alert.alert('Sucesso', 'Configurações de PIX atualizadas!');
      setIsPixExpanded(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o PIX.');
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="px-6 py-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#A34211"
            />
          </TouchableOpacity>
          <Text className="text-text-primary text-xl font-bold">
            Meu Perfil
          </Text>
        </View>

        <View className="items-center mt-8 px-6">
          <View className="w-32 h-32 rounded-full border-4 border-secondary overflow-hidden bg-secondary items-center justify-center mb-4">
            {user?.user_metadata?.avatar_url ? (
              <Image
                source={{ uri: user.user_metadata.avatar_url }}
                className="w-full h-full"
              />
            ) : (
              <MaterialCommunityIcons
                name="account"
                size={64}
                color="#A34211"
              />
            )}
          </View>

          <Text className="text-text-primary text-2xl font-bold text-center">
            {user?.user_metadata?.full_name || 'Usuário'}
          </Text>
          <Text className="text-text-secondary text-base text-center mt-1">
            {user?.email}
          </Text>

          <View className="bg-secondary px-4 py-1 rounded-full mt-4">
            <Text className="text-primary font-medium text-sm capitalize">
              {profile?.role === 'admin' ? 'Administrador' : 'Vendedor'}
            </Text>
          </View>
        </View>

        <View className="mt-12 px-6">
          <Text className="text-text-primary text-lg font-bold mb-4">
            Painel do Vendedor
          </Text>

          {/* User Sales Card */}
          <View className="bg-white rounded-2xl shadow-sm border border-secondary overflow-hidden mb-4">
            <TouchableOpacity
              onPress={() => router.push('/user-sales')}
              activeOpacity={0.7}
              className="flex-row items-center justify-between p-4"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                  <MaterialCommunityIcons
                    name="basket-outline"
                    size={24}
                    color="#A34211"
                  />
                </View>
                <View className="ml-3">
                  <Text className="text-text-primary font-bold">
                    Minhas Vendas
                  </Text>
                  <Text className="text-text-secondary text-xs">
                    Histórico pessoal de vendas
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#BDB2B2"
              />
            </TouchableOpacity>
          </View>

          <Text className="text-text-primary text-lg font-bold mb-4 mt-4">
            Configurações
          </Text>

          {/* PIX Expandable Card */}
          <View className="bg-white rounded-2xl shadow-sm border border-secondary overflow-hidden mb-4">
            <TouchableOpacity
              onPress={() => setIsPixExpanded(!isPixExpanded)}
              activeOpacity={0.7}
              className="flex-row items-center justify-between p-4"
            >
              <View className="flex-row items-center">
                <View
                  className={`w-10 h-10 rounded-xl items-center justify-center ${isPixConfigured ? 'bg-green-100' : 'bg-orange-100'}`}
                >
                  <MaterialCommunityIcons
                    name="qrcode"
                    size={24}
                    color={isPixConfigured ? '#059669' : '#A34211'}
                  />
                </View>
                <View className="ml-3">
                  <Text className="text-text-primary font-bold">
                    Recebimento PIX
                  </Text>
                  <Text className="text-text-secondary text-xs">
                    {isPixConfigured
                      ? 'Configurado e Ativo'
                      : 'Não configurado'}
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons
                name={isPixExpanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#BDB2B2"
              />
            </TouchableOpacity>

            {isPixExpanded && (
              <Animated.View
                entering={FadeIn}
                leaving={FadeOut}
                className="px-4 pb-6 border-t border-secondary pt-4"
              >
                <View className="mb-4">
                  <Text className="text-text-secondary text-sm font-medium mb-2">
                    Chave PIX
                  </Text>
                  <TextInput
                    value={pixKey}
                    onChangeText={setPixKey}
                    placeholder="CPF, E-mail, Celular ou Chave Aleatória"
                    keyboardType={getKeyboardType()}
                    autoCapitalize="none"
                    className="bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary"
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-text-secondary text-sm font-medium mb-2">
                    Nome do Beneficiário
                  </Text>
                  <TextInput
                    value={pixName}
                    onChangeText={setPixName}
                    placeholder="Seu nome completo"
                    className="bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary"
                  />
                </View>

                <View className="mb-6">
                  <Text className="text-text-secondary text-sm font-medium mb-2">
                    Cidade
                  </Text>
                  <TextInput
                    value={pixCity}
                    onChangeText={setPixCity}
                    placeholder="Sua cidade"
                    autoCapitalize="words"
                    className="bg-background border border-secondary rounded-xl px-4 py-3 text-text-primary"
                  />
                </View>

                <TouchableOpacity
                  onPress={handleUpdatePix}
                  disabled={isUpdating}
                  className="bg-primary flex-row items-center justify-center py-4 rounded-xl shadow-sm shadow-orange-500/20"
                >
                  {isUpdating ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="check"
                        size={20}
                        color="white"
                      />
                      <Text className="text-white font-bold ml-2">
                        Salvar Configurações
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>

          {/* Other Static Cards for UI completeness */}
          <View className="bg-white rounded-2xl p-4 shadow-sm border border-secondary mb-4">
            <TouchableOpacity className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-blue-100 items-center justify-center">
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={24}
                    color="#2563eb"
                  />
                </View>
                <Text className="text-text-primary ml-3 font-bold">
                  Dados Pessoais
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#BDB2B2"
              />
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-2xl p-4 shadow-sm border border-secondary mb-4">
            <TouchableOpacity className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-purple-100 items-center justify-center">
                  <MaterialCommunityIcons
                    name="bell-outline"
                    size={24}
                    color="#7c3aed"
                  />
                </View>
                <Text className="text-text-primary ml-3 font-bold">
                  Notificações
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#BDB2B2"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-8 px-6 mb-12">
          <TouchableOpacity
            onPress={handleSignOut}
            className="flex-row items-center justify-center bg-white border border-red-200 py-4 rounded-xl"
          >
            <MaterialCommunityIcons name="logout" size={20} color="#ef4444" />
            <Text className="text-red-500 text-lg font-bold ml-2">
              Sair da Conta
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
