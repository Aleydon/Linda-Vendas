import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardTypeOptions,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Profile as UserProfile, useAppContext } from '@/context/AppContext';

export default function Profile() {
  const {
    user,
    profile,
    isAdmin,
    signOut,
    updateProfile,
    colorScheme,
    toggleColorScheme,
    fetchAllProfiles,
    updateUserRole
  } = useAppContext();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPixExpanded, setIsPixExpanded] = useState(false);
  const [isAdminPanelExpanded, setIsAdminPanelExpanded] = useState(false);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  const [pixKey, setPixKey] = useState(profile?.pix_key || '');
  const [pixName, setPixName] = useState(profile?.pix_name || '');
  const [pixCity, setPixCity] = useState(profile?.pix_city || '');

  const isPixConfigured = !!(
    profile?.pix_key &&
    profile?.pix_name &&
    profile?.pix_city
  );

  useEffect(() => {
    if (isAdminPanelExpanded && isAdmin) {
      void loadProfiles();
    }
  }, [isAdminPanelExpanded]);

  const loadProfiles = async () => {
    try {
      setIsLoadingProfiles(true);
      const data = await fetchAllProfiles();
      setAllProfiles(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  const handleToggleAdmin = async (targetUser: UserProfile) => {
    if (targetUser.id === user?.id) {
      Alert.alert(
        'Segurança',
        'Você não pode alterar seu próprio acesso administrativo por segurança.'
      );
      return;
    }

    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    const actionStr = newRole === 'admin' ? 'conceder' : 'remover';

    Alert.alert(
      'Alterar Acesso',
      `Deseja ${actionStr} acesso de administrador para ${targetUser.email}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await updateUserRole(targetUser.id, newRole);
              void loadProfiles();
              Alert.alert('Sucesso', 'Permissão atualizada com sucesso.');
            } catch {
              Alert.alert(
                'Erro',
                'Não foi possível atualizar a permissão. Verifique as políticas de segurança do banco de dados.'
              );
            }
          }
        }
      ]
    );
  };

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
    <SafeAreaView className="flex-1 bg-background dark:bg-zinc-950">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="px-6 py-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={colorScheme === 'dark' ? '#F5EBE0' : '#A34211'}
            />
          </TouchableOpacity>
          <Text className="text-text-primary dark:text-zinc-100 text-xl font-bold">
            Meu Perfil
          </Text>
        </View>

        <View className="items-center mt-8 px-6">
          <View className="w-32 h-32 rounded-full border-4 border-secondary dark:border-zinc-800 overflow-hidden bg-secondary dark:bg-zinc-800 items-center justify-center mb-4">
            {user?.user_metadata?.avatar_url ? (
              <Image
                source={{ uri: user.user_metadata.avatar_url }}
                className="w-full h-full"
              />
            ) : (
              <MaterialCommunityIcons
                name="account"
                size={64}
                color={colorScheme === 'dark' ? '#F5EBE0' : '#A34211'}
              />
            )}
          </View>

          <Text className="text-text-primary dark:text-zinc-100 text-2xl font-bold text-center">
            {user?.user_metadata?.full_name || 'Usuário'}
          </Text>
          <Text className="text-text-secondary dark:text-zinc-400 text-base text-center mt-1">
            {user?.email}
          </Text>

          <View className="bg-secondary dark:bg-zinc-800 px-4 py-1 rounded-full mt-4">
            <Text className="text-primary dark:text-orange-400 font-medium text-sm capitalize">
              {profile?.role === 'admin' ? 'Administrador' : 'Vendedor'}
            </Text>
          </View>
        </View>

        <View className="mt-12 px-6">
          <Text className="text-text-primary dark:text-zinc-100 text-lg font-bold mb-4">
            Painel do Vendedor
          </Text>

          {/* User Sales Card */}
          <View className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-secondary dark:border-zinc-800 overflow-hidden mb-4">
            <TouchableOpacity
              onPress={() => router.push('/user-sales')}
              activeOpacity={0.7}
              className="flex-row items-center justify-between p-4"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-orange-500/10 items-center justify-center">
                  <MaterialCommunityIcons
                    name="basket-outline"
                    size={24}
                    color={colorScheme === 'dark' ? '#fb923c' : '#A34211'}
                  />
                </View>
                <View className="ml-3">
                  <Text className="text-text-primary dark:text-zinc-100 font-bold">
                    Minhas Vendas
                  </Text>
                  <Text className="text-text-secondary dark:text-zinc-400 text-xs">
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

          {/* Admin Management Section */}
          {isAdmin && (
            <>
              <Text className="text-text-primary dark:text-zinc-100 text-lg font-bold mb-4 mt-4">
                Administração
              </Text>
              <View className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-secondary dark:border-zinc-800 overflow-hidden mb-4">
                <TouchableOpacity
                  onPress={() => setIsAdminPanelExpanded(!isAdminPanelExpanded)}
                  activeOpacity={0.7}
                  className="flex-row items-center justify-between p-4"
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 items-center justify-center">
                      <MaterialCommunityIcons
                        name="shield-account-outline"
                        size={24}
                        color={colorScheme === 'dark' ? '#a78bfa' : '#7c3aed'}
                      />
                    </View>
                    <View className="ml-3">
                      <Text className="text-text-primary dark:text-zinc-100 font-bold">
                        Gestão de Administradores
                      </Text>
                      <Text className="text-text-secondary dark:text-zinc-400 text-xs">
                        Configurar acesso administrativo
                      </Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons
                    name={isAdminPanelExpanded ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color="#BDB2B2"
                  />
                </TouchableOpacity>

                {isAdminPanelExpanded && (
                  <Animated.View
                    entering={FadeIn}
                    exiting={FadeOut}
                    className="px-4 pb-6 border-t border-secondary dark:border-zinc-800 pt-4"
                  >
                    {isLoadingProfiles ? (
                      <ActivityIndicator
                        color={colorScheme === 'dark' ? '#fb923c' : '#A34211'}
                        className="my-4"
                      />
                    ) : (
                      allProfiles.map(p => (
                        <View
                          key={p.id}
                          className="flex-row items-center justify-between py-3 border-b border-gray-50 dark:border-zinc-800 last:border-b-0"
                        >
                          <View className="flex-1">
                            <Text
                              className="text-text-primary dark:text-zinc-100 font-medium"
                              numberOfLines={1}
                            >
                              {p.email}
                            </Text>
                            <Text
                              className={`text-[10px] uppercase font-bold ${p.role === 'admin' ? 'text-primary dark:text-orange-400' : 'text-text-secondary dark:text-zinc-500'}`}
                            >
                              {p.role === 'admin'
                                ? 'Administrador'
                                : 'Vendedor'}
                            </Text>
                          </View>
                          <Switch
                            value={p.role === 'admin'}
                            onValueChange={() => handleToggleAdmin(p)}
                            disabled={p.id === user?.id}
                            trackColor={{ false: '#D1D5DB', true: '#A34211' }}
                            thumbColor={
                              p.role === 'admin' ? '#FFFFFF' : '#F3F4F6'
                            }
                          />
                        </View>
                      ))
                    )}
                    <TouchableOpacity
                      onPress={loadProfiles}
                      className="mt-4 items-center"
                    >
                      <Text className="text-text-secondary dark:text-zinc-500 text-xs underline">
                        Atualizar lista
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </View>
            </>
          )}

          <Text className="text-text-primary dark:text-zinc-100 text-lg font-bold mb-4 mt-4">
            Configurações
          </Text>

          {/* Notifications Section */}
          <View className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-secondary dark:border-zinc-800 overflow-hidden mb-4">
            <TouchableOpacity
              onPress={() => router.push('/notifications')}
              activeOpacity={0.7}
              className="flex-row items-center justify-between p-4"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 items-center justify-center">
                  <MaterialCommunityIcons
                    name="bell-outline"
                    size={24}
                    color="#A34211"
                  />
                </View>
                <View className="ml-3">
                  <Text className="text-text-primary dark:text-zinc-100 font-bold">
                    Notificações
                  </Text>
                  <Text className="text-text-secondary dark:text-zinc-400 text-xs">
                    Gerenciar alertas e avisos
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

          {/* Theme Section */}
          <View className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-secondary dark:border-zinc-800 overflow-hidden mb-4">
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 items-center justify-center">
                  <MaterialCommunityIcons
                    name={
                      colorScheme === 'dark' ? 'weather-night' : 'weather-sunny'
                    }
                    size={24}
                    color={colorScheme === 'dark' ? '#60a5fa' : '#2563eb'}
                  />
                </View>
                <View className="ml-3">
                  <Text className="text-text-primary dark:text-zinc-100 font-bold">
                    Tema Escuro
                  </Text>
                  <Text className="text-text-secondary dark:text-zinc-400 text-xs">
                    {colorScheme === 'dark' ? 'Ativado' : 'Desativado'}
                  </Text>
                </View>
              </View>
              <Switch
                value={colorScheme === 'dark'}
                onValueChange={toggleColorScheme}
                trackColor={{ false: '#D1D5DB', true: '#A34211' }}
                thumbColor={colorScheme === 'dark' ? '#FFFFFF' : '#F3F4F6'}
              />
            </View>
          </View>

          {/* PIX Expandable Card */}
          <View className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-secondary dark:border-zinc-800 overflow-hidden mb-4">
            <TouchableOpacity
              onPress={() => setIsPixExpanded(!isPixExpanded)}
              activeOpacity={0.7}
              className="flex-row items-center justify-between p-4"
            >
              <View className="flex-row items-center">
                <View
                  className={`w-10 h-10 rounded-xl items-center justify-center ${
                    isPixConfigured
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-orange-100 dark:bg-orange-900/30'
                  }`}
                >
                  <MaterialCommunityIcons
                    name="qrcode"
                    size={24}
                    color={
                      isPixConfigured
                        ? colorScheme === 'dark'
                          ? '#34d399'
                          : '#059669'
                        : colorScheme === 'dark'
                          ? '#fb923c'
                          : '#A34211'
                    }
                  />
                </View>
                <View className="ml-3">
                  <Text className="text-text-primary dark:text-zinc-100 font-bold">
                    Recebimento PIX
                  </Text>
                  <Text className="text-text-secondary dark:text-zinc-400 text-xs">
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
                exiting={FadeOut}
                className="px-4 pb-6 border-t border-secondary dark:border-zinc-800 pt-4"
              >
                <View className="mb-4">
                  <Text className="text-text-secondary dark:text-zinc-400 text-sm font-medium mb-2">
                    Chave PIX
                  </Text>
                  <TextInput
                    value={pixKey}
                    onChangeText={setPixKey}
                    placeholder="CPF, E-mail, Celular ou Chave Aleatória"
                    placeholderTextColor={
                      colorScheme === 'dark' ? '#71717a' : '#8C7E7E'
                    }
                    keyboardType={getKeyboardType()}
                    autoCapitalize="none"
                    className="bg-background dark:bg-zinc-950 border border-secondary dark:border-zinc-800 rounded-xl px-4 py-3 text-text-primary dark:text-zinc-100"
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-text-secondary dark:text-zinc-400 text-sm font-medium mb-2">
                    Nome do Beneficiário
                  </Text>
                  <TextInput
                    value={pixName}
                    onChangeText={setPixName}
                    placeholder="Seu nome completo"
                    placeholderTextColor={
                      colorScheme === 'dark' ? '#71717a' : '#8C7E7E'
                    }
                    className="bg-background dark:bg-zinc-950 border border-secondary dark:border-zinc-800 rounded-xl px-4 py-3 text-text-primary dark:text-zinc-100"
                  />
                </View>

                <View className="mb-6">
                  <Text className="text-text-secondary dark:text-zinc-400 text-sm font-medium mb-2">
                    Cidade
                  </Text>
                  <TextInput
                    value={pixCity}
                    onChangeText={setPixCity}
                    placeholder="Sua cidade"
                    placeholderTextColor={
                      colorScheme === 'dark' ? '#71717a' : '#8C7E7E'
                    }
                    autoCapitalize="words"
                    className="bg-background dark:bg-zinc-950 border border-secondary dark:border-zinc-800 rounded-xl px-4 py-3 text-text-primary dark:text-zinc-100"
                  />
                </View>

                <TouchableOpacity
                  onPress={handleUpdatePix}
                  disabled={isUpdating}
                  className="bg-primary dark:bg-orange-600 flex-row items-center justify-center py-4 rounded-xl shadow-sm shadow-orange-500/20"
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
          <View className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-secondary dark:border-zinc-800 mb-4">
            <TouchableOpacity className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 items-center justify-center">
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={24}
                    color={colorScheme === 'dark' ? '#60a5fa' : '#2563eb'}
                  />
                </View>
                <Text className="text-text-primary dark:text-zinc-100 ml-3 font-bold">
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

          <View className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-secondary dark:border-zinc-800 mb-4">
            <TouchableOpacity className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 items-center justify-center">
                  <MaterialCommunityIcons
                    name="bell-outline"
                    size={24}
                    color={colorScheme === 'dark' ? '#a78bfa' : '#7c3aed'}
                  />
                </View>
                <Text className="text-text-primary dark:text-zinc-100 ml-3 font-bold">
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
            className="flex-row items-center justify-center bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/30 py-4 rounded-xl"
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
