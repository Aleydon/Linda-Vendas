import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAlert } from '@/context/AlertContext';
import { useAppContext } from '@/context/AppContext';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationsScreen() {
  const { showAlert } = useAlert();
  const { profile, isAdmin, updateProfile } = useAppContext();
  const { toggleNotifications } = useNotifications();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleTogglePush = async (value: boolean) => {
    try {
      setIsUpdating(true);
      await toggleNotifications(value);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      showAlert({
        title: 'Erro',
        description: `Não foi possível atualizar as notificações: ${message}`,
        type: 'error'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleSubSetting = async (
    key:
      | 'low_stock_notifications'
      | 'sales_notifications'
      | 'products_notifications',
    value: boolean
  ) => {
    try {
      setIsUpdating(true);
      await updateProfile({ [key]: value });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      showAlert({
        title: 'Erro',
        description: `Não foi possível atualizar a configuração: ${message}`,
        type: 'error'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-zinc-950">
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4 rounded-full bg-zinc-100 p-2 dark:bg-zinc-900"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#A34211" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Notificações
        </Text>
      </View>

      <ScrollView className="flex-1 px-6">
        <Animated.View entering={FadeIn.duration(400)} className="mt-4">
          <View className="mb-6 rounded-2xl bg-zinc-50 p-6 dark:bg-zinc-900/50">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Notificações Push
                </Text>
                <Text className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Ative para receber alertas importantes mesmo com o app
                  fechado.
                </Text>
              </View>
              {isUpdating ? (
                <ActivityIndicator color="#fb923c" />
              ) : (
                <Switch
                  value={profile?.notifications_enabled}
                  onValueChange={handleTogglePush}
                  trackColor={{ false: '#d4d4d8', true: '#fdba74' }}
                  thumbColor={
                    profile?.notifications_enabled ? '#fb923c' : '#f4f4f5'
                  }
                />
              )}
            </View>
          </View>

          {profile?.notifications_enabled && (
            <Animated.View entering={FadeIn}>
              <Text className="mb-4 ml-2 text-sm font-medium uppercase tracking-wider text-zinc-500">
                Preferências de Alerta
              </Text>

              {isAdmin && (
                <View className="mb-4 rounded-2xl bg-zinc-50 p-6 dark:bg-zinc-900/50">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-4">
                      <Text className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                        Novas Vendas
                      </Text>
                      <Text className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Receba notificações de vendas realizadas por outros
                        vendedores.
                      </Text>
                    </View>
                    <Switch
                      value={profile?.sales_notifications}
                      onValueChange={v =>
                        handleToggleSubSetting('sales_notifications', v)
                      }
                      trackColor={{ false: '#d4d4d8', true: '#fdba74' }}
                      thumbColor={
                        profile?.sales_notifications ? '#fb923c' : '#f4f4f5'
                      }
                    />
                  </View>
                </View>
              )}

              {isAdmin && (
                <View className="mb-4 rounded-2xl bg-zinc-50 p-6 dark:bg-zinc-900/50">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-4">
                      <Text className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                        Produtos
                      </Text>
                      <Text className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Receba notificações quando produtos forem adicionados,
                        editados ou excluídos.
                      </Text>
                    </View>
                    <Switch
                      value={profile?.products_notifications}
                      onValueChange={v =>
                        handleToggleSubSetting('products_notifications', v)
                      }
                      trackColor={{ false: '#d4d4d8', true: '#fdba74' }}
                      thumbColor={
                        profile?.products_notifications ? '#fb923c' : '#f4f4f5'
                      }
                    />
                  </View>
                </View>
              )}
            </Animated.View>
          )}

          <View className="mt-6 rounded-xl bg-orange-50 p-4 dark:bg-orange-950/20">
            <View className="flex-row">
              <MaterialCommunityIcons
                name="information-outline"
                size={20}
                color="#A34211"
              />
              <Text className="ml-2 flex-1 text-sm text-orange-800 dark:text-orange-200">
                O administrador receberá notificações de vendas e produtos em
                tempo real.
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
