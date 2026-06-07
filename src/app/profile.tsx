import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdminPanel } from '@/components/profile/AdminPanel';
import { PixConfigPanel } from '@/components/profile/PixConfigPanel';
import { ProfileMenuItem } from '@/components/ProfileMenuItem';
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

  const [isPixExpanded, setIsPixExpanded] = useState(false);
  const [isAdminPanelExpanded, setIsAdminPanelExpanded] = useState(false);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

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
    <SafeAreaView className="flex-1 bg-background dark:bg-zinc-950">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
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

        {/* User Card */}
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

        {/* Panel Section */}
        <View className="mt-12 px-6">
          <Text className="text-text-primary dark:text-zinc-100 text-lg font-bold mb-4">
            Painel do Vendedor
          </Text>

          {/* User Sales */}
          <ProfileMenuItem
            icon="basket-outline"
            iconBgColor="bg-primary/10 dark:bg-orange-500/10"
            iconColor={colorScheme === 'dark' ? '#fb923c' : '#A34211'}
            title="Minhas Vendas"
            description="Histórico pessoal de vendas"
            onPress={() => router.push('/user-sales')}
          />

          {/* Admin Management Panel */}
          {isAdmin && (
            <>
              <Text className="text-text-primary dark:text-zinc-100 text-lg font-bold mb-4 mt-4">
                Administração
              </Text>
              <AdminPanel
                user={user}
                allProfiles={allProfiles}
                isLoading={isLoadingProfiles}
                onRefresh={loadProfiles}
                onToggleAdmin={handleToggleAdmin}
                colorScheme={colorScheme}
                isExpanded={isAdminPanelExpanded}
                onToggleExpand={() =>
                  setIsAdminPanelExpanded(!isAdminPanelExpanded)
                }
              />
            </>
          )}

          <Text className="text-text-primary dark:text-zinc-100 text-lg font-bold mb-4 mt-4">
            Configurações
          </Text>

          {/* Notifications */}
          <ProfileMenuItem
            icon="bell-outline"
            iconBgColor="bg-orange-100 dark:bg-orange-900/30"
            iconColor="#A34211"
            title="Notificações"
            description="Gerenciar alertas e avisos"
            onPress={() => router.push('/notifications')}
          />

          {/* Dark Theme */}
          <ProfileMenuItem
            icon={colorScheme === 'dark' ? 'weather-night' : 'weather-sunny'}
            iconBgColor="bg-blue-100 dark:bg-blue-900/30"
            iconColor={colorScheme === 'dark' ? '#60a5fa' : '#2563eb'}
            title="Tema Escuro"
            description={colorScheme === 'dark' ? 'Ativado' : 'Desativado'}
            rightElement={
              <Switch
                value={colorScheme === 'dark'}
                onValueChange={toggleColorScheme}
                trackColor={{ false: '#D1D5DB', true: '#A34211' }}
                thumbColor={colorScheme === 'dark' ? '#FFFFFF' : '#F3F4F6'}
              />
            }
          />

          {/* PIX Settings */}
          <PixConfigPanel
            profile={profile}
            updateProfile={updateProfile}
            colorScheme={colorScheme}
            isExpanded={isPixExpanded}
            onToggleExpand={() => setIsPixExpanded(!isPixExpanded)}
          />

          {/* Personal Data (Static UI) */}
          <ProfileMenuItem
            icon="account-outline"
            iconBgColor="bg-blue-100 dark:bg-blue-900/30"
            iconColor={colorScheme === 'dark' ? '#60a5fa' : '#2563eb'}
            title="Dados Pessoais"
            onPress={() => {}}
          />
        </View>

        {/* Logout Button */}
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
