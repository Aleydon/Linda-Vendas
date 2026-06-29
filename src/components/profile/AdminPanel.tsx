import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Profile } from '@/context/types';

interface AdminPanelProps {
  user: { id: string } | null;
  allProfiles: Profile[];
  isLoading: boolean;
  onRefresh: () => void;
  onToggleAdmin: (profile: Profile) => void;
  onToggleFiado: (profile: Profile) => void;
  onToggleApproval: (profile: Profile) => void;
  colorScheme: 'light' | 'dark';
  isExpanded: boolean;
  onToggleExpand: () => void;
  pendingApprovalsCount?: number;
}

export function AdminPanel({
  user,
  allProfiles,
  isLoading,
  onRefresh,
  onToggleAdmin,
  onToggleFiado,
  onToggleApproval,
  colorScheme,
  isExpanded,
  onToggleExpand,
  pendingApprovalsCount = 0
}: AdminPanelProps) {
  return (
    <View className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-secondary dark:border-zinc-800 overflow-hidden mb-4">
      <TouchableOpacity
        onPress={onToggleExpand}
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
            <View className="flex-row items-center">
              <Text className="text-text-primary dark:text-zinc-100 font-bold">
                Gestão de Usuários
              </Text>
              {pendingApprovalsCount > 0 && (
                <View className="ml-2 bg-blue-500 rounded-full px-2 py-0.5">
                  <Text className="text-white text-[10px] font-bold">
                    {pendingApprovalsCount} pendente
                    {pendingApprovalsCount > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>
            <Text className="text-text-secondary dark:text-zinc-400 text-xs">
              Configurar acesso e permissões
            </Text>
          </View>
        </View>
        <MaterialCommunityIcons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#BDB2B2"
        />
      </TouchableOpacity>

      {isExpanded && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          className="px-4 pb-6 border-t border-secondary dark:border-zinc-800 pt-4"
        >
          {isLoading ? (
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
                <View className="flex-1 mr-2">
                  <Text
                    className="text-text-primary dark:text-zinc-100 font-medium"
                    numberOfLines={1}
                  >
                    {p.email}
                  </Text>
                  <Text
                    className={`text-[10px] uppercase font-bold ${
                      p.role === 'admin'
                        ? 'text-primary dark:text-orange-400'
                        : 'text-text-secondary dark:text-zinc-500'
                    }`}
                  >
                    {p.role === 'admin' ? 'Administrador' : 'Vendedor'}
                  </Text>
                </View>

                <View className="flex-row items-center gap-3">
                  <View className="items-center">
                    <Text className="text-[9px] text-text-secondary dark:text-zinc-500 mb-1 uppercase font-bold">
                      Aprov.
                    </Text>
                    <Switch
                      value={p.role === 'admin' || p.approved === true}
                      onValueChange={() => onToggleApproval(p)}
                      disabled={p.id === user?.id || p.role === 'admin'}
                      trackColor={{ false: '#D1D5DB', true: '#3b82f6' }}
                      thumbColor={
                        p.approved || p.role === 'admin' ? '#FFFFFF' : '#F3F4F6'
                      }
                    />
                  </View>
                  <View className="items-center">
                    <Text className="text-[9px] text-text-secondary dark:text-zinc-500 mb-1 uppercase font-bold">
                      Admin
                    </Text>
                    <Switch
                      value={p.role === 'admin'}
                      onValueChange={() => onToggleAdmin(p)}
                      disabled={p.id === user?.id}
                      trackColor={{ false: '#D1D5DB', true: '#A34211' }}
                      thumbColor={p.role === 'admin' ? '#FFFFFF' : '#F3F4F6'}
                    />
                  </View>
                  <View className="items-center">
                    <Text className="text-[9px] text-text-secondary dark:text-zinc-500 mb-1 uppercase font-bold">
                      Fiado
                    </Text>
                    <Switch
                      value={!!p.allow_fiado}
                      onValueChange={() => onToggleFiado(p)}
                      trackColor={{ false: '#D1D5DB', true: '#10b981' }}
                      thumbColor={p.allow_fiado ? '#FFFFFF' : '#F3F4F6'}
                    />
                  </View>
                </View>
              </View>
            ))
          )}
          <TouchableOpacity onPress={onRefresh} className="mt-4 items-center">
            <Text className="text-text-secondary dark:text-zinc-500 text-xs underline">
              Atualizar lista
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}
export default AdminPanel;
