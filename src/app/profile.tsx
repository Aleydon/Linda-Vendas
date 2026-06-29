import { MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdminPanel } from '@/components/profile/AdminPanel';
import { DataManagementPanel } from '@/components/profile/DataManagementPanel';
import { PixConfigPanel } from '@/components/profile/PixConfigPanel';
import { ProfileMenuItem } from '@/components/ProfileMenuItem';
import { useAlert } from '@/context/AlertContext';
import { Profile as UserProfile, useAppContext } from '@/context/AppContext';

export default function Profile() {
  const {
    user,
    profile,
    isAdmin,
    signOut,
    updateProfile,
    isApproved,
    colorScheme,
    toggleColorScheme,
    fetchAllProfiles,
    updateUserRole,
    updateUserFiado,
    updateUserApproval,
    pendingApprovalsCount,
    refreshData
  } = useAppContext();
  const { showAlert } = useAlert();

  const [isPixExpanded, setIsPixExpanded] = useState(false);
  const [isAdminPanelExpanded, setIsAdminPanelExpanded] = useState(false);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  // App Info
  const appVersion =
    Constants.expoConfig?.version ?? Constants.nativeAppVersion;

  const updateId = Updates.updateId ? Updates.updateId.slice(0, 8) : 'Base';
  const runtimeVersion = Updates.runtimeVersion ?? 'N/A';

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
      showAlert({
        title: 'Segurança',
        description:
          'Você não pode alterar seu próprio acesso administrativo por segurança.',
        type: 'warning'
      });
      return;
    }

    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    const actionStr = newRole === 'admin' ? 'conceder' : 'remover';

    showAlert({
      title: 'Alterar Acesso',
      description: `Deseja ${actionStr} acesso de administrador para ${targetUser.email}?`,
      type: 'confirm',
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await updateUserRole(targetUser.id, newRole);
              void loadProfiles();
              showAlert({
                title: 'Sucesso',
                description: 'Permissão atualizada com sucesso.',
                type: 'success'
              });
            } catch {
              showAlert({
                title: 'Erro',
                description:
                  'Não foi possível atualizar a permissão. Verifique as políticas de segurança do banco de dados.',
                type: 'error'
              });
            }
          }
        }
      ]
    });
  };

  const handleToggleFiado = async (targetUser: UserProfile) => {
    const newValue = !targetUser.allow_fiado;
    const actionStr = newValue ? 'permitir' : 'bloquear';

    showAlert({
      title: 'Venda Fiado',
      description: `Deseja ${actionStr} a opção de venda fiado para ${targetUser.email}?`,
      type: 'confirm',
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await updateUserFiado(targetUser.id, newValue);
              void loadProfiles();
              showAlert({
                title: 'Sucesso',
                description: 'Permissão de fiado atualizada.',
                type: 'success'
              });
            } catch (error: unknown) {
              const errorMessage =
                error instanceof Error ? error.message : 'Erro desconhecido';
              showAlert({
                title: 'Erro ao Atualizar',
                description: `Não foi possível atualizar a permissão. Detalhe: ${errorMessage}. Certifique-se de que as colunas novas foram criadas no banco de dados.`,
                type: 'error'
              });
            }
          }
        }
      ]
    });
  };

  const handleToggleApproval = async (targetUser: UserProfile) => {
    if (targetUser.id === user?.id) return;
    if (targetUser.role === 'admin') return;

    const newValue = !(targetUser.approved ?? false);
    const actionStr = newValue ? 'aprovar' : 'desaprovar';

    showAlert({
      title: 'Aprovação de Vendedor',
      description: `Deseja ${actionStr} o vendedor ${targetUser.email}?`,
      type: 'confirm',
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await updateUserApproval(targetUser.id, newValue);
              void loadProfiles();
              showAlert({
                title: 'Sucesso',
                description: newValue
                  ? 'Vendedor aprovado com sucesso.'
                  : 'Aprovação removida.',
                type: 'success'
              });
            } catch {
              showAlert({
                title: 'Erro',
                description:
                  'Não foi possível atualizar a aprovação. Verifique as políticas de segurança do banco de dados.',
                type: 'error'
              });
            }
          }
        }
      ]
    });
  };

  const handleSignOut = () => {
    showAlert({
      title: 'Sair',
      description: 'Tem certeza que deseja sair da sua conta?',
      type: 'confirm',
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/login');
          }
        }
      ]
    });
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
          <View className="relative mb-4">
            <View className="w-32 h-32 rounded-full border-4 border-secondary dark:border-zinc-800 overflow-hidden bg-secondary dark:bg-zinc-800 items-center justify-center">
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
            {!profile?.pix_key && (
              <View className="absolute -bottom-1 -right-1 bg-red-500 rounded-full px-2 py-0.5 shadow-md flex-row items-center">
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={12}
                  color="white"
                />
                <Text className="text-white text-[9px] font-bold ml-0.5">
                  PIX
                </Text>
              </View>
            )}
          </View>

          <Text className="text-text-primary dark:text-zinc-100 text-2xl font-bold text-center">
            {user?.user_metadata?.full_name || 'Usuário'}
          </Text>
          <Text className="text-text-secondary dark:text-zinc-400 text-base text-center mt-1">
            {user?.email}
          </Text>

          <View className="flex-row items-center gap-2 mt-4">
            <View className="bg-category-chip dark:bg-zinc-800 rounded-full px-chip-x py-chip-y">
              <Text className="text-primary dark:text-orange-400 font-semibold text-chip capitalize">
                {profile?.role === 'admin' ? 'Administrador' : 'Vendedor'}
              </Text>
            </View>
            {!profile?.pix_key && (
              <View className="bg-red-100 dark:bg-red-900/30 rounded-full px-chip-x py-chip-y">
                <Text className="text-red-500 dark:text-red-400 font-semibold text-chip">
                  Sem PIX
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Panel Section */}
        <View className="mt-8 p-card">
          <Text className="text-text-primary dark:text-zinc-100 text-lg font-bold mb-4 ml-card">
            Painel do Vendedor
          </Text>

          {/* User Sales */}
          <ProfileMenuItem
            icon="basket-outline"
            iconBgColor="bg-primary/10 dark:bg-orange-500/10"
            iconColor={colorScheme === 'dark' ? '#fb923c' : '#A34211'}
            title={isAdmin ? 'Histórico de Vendas' : 'Minhas Vendas'}
            description={
              isAdmin
                ? 'Histórico geral de vendas'
                : 'Histórico pessoal de vendas'
            }
            onPress={() => router.push('/user-sales')}
          />

          {/* Admin Panels */}
          {isAdmin && (
            <>
              <Text className="text-text-primary dark:text-zinc-100 text-lg font-bold ml-card mb-cardLg">
                Administração
              </Text>
              <AdminPanel
                user={user}
                allProfiles={allProfiles}
                isLoading={isLoadingProfiles}
                onRefresh={loadProfiles}
                onToggleAdmin={handleToggleAdmin}
                onToggleFiado={handleToggleFiado}
                onToggleApproval={handleToggleApproval}
                colorScheme={colorScheme}
                isExpanded={isAdminPanelExpanded}
                onToggleExpand={() =>
                  setIsAdminPanelExpanded(!isAdminPanelExpanded)
                }
                pendingApprovalsCount={pendingApprovalsCount}
              />

              <DataManagementPanel
                isAdmin={isAdmin}
                colorScheme={colorScheme}
                refreshData={refreshData}
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
            isApproved={isApproved}
          />

          <Text className="text-text-primary dark:text-zinc-100 text-lg font-bold mb-4 mt-4">
            Sobre o App
          </Text>

          <ProfileMenuItem
            icon="information-outline"
            iconBgColor="bg-zinc-100 dark:bg-zinc-800"
            iconColor={colorScheme === 'dark' ? '#cbd5e1' : '#475569'}
            title="Versão do Aplicativo"
            description={`v${appVersion} (${updateId}) • RT: ${runtimeVersion}`}
          />
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
