import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardTypeOptions,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { useAlert } from '@/context/AlertContext';
import { Profile } from '@/context/types';

interface PixConfigPanelProps {
  profile: Profile | null;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  colorScheme: 'light' | 'dark';
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function PixConfigPanel({
  profile,
  updateProfile,
  colorScheme,
  isExpanded,
  onToggleExpand
}: PixConfigPanelProps) {
  const { showAlert } = useAlert();
  const [isUpdating, setIsUpdating] = useState(false);
  const [pixKey, setPixKey] = useState(profile?.pix_key || '');
  const [pixName, setPixName] = useState(profile?.pix_name || '');
  const [pixCity, setPixCity] = useState(profile?.pix_city || '');

  const isPixConfigured = !!(
    profile?.pix_key &&
    profile?.pix_name &&
    profile?.pix_city
  );

  const getKeyboardType = (): KeyboardTypeOptions => {
    if (!pixKey) return 'default';
    if (/^\d+$/.test(pixKey.replace(/[-.() ]/g, ''))) return 'numeric';
    if (pixKey.includes('@')) return 'email-address';
    return 'default';
  };

  const handleUpdatePix = async () => {
    try {
      setIsUpdating(true);
      await updateProfile({
        pix_key: pixKey,
        pix_name: pixName,
        pix_city: pixCity
      });
      showAlert({
        title: 'Sucesso',
        description: 'Configurações de PIX atualizadas!',
        type: 'success'
      });
      onToggleExpand();
    } catch (error) {
      showAlert({
        title: 'Erro',
        description: 'Não foi possível atualizar o PIX.',
        type: 'error'
      });
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <View className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-secondary dark:border-zinc-800 overflow-hidden mb-4">
      <TouchableOpacity
        onPress={onToggleExpand}
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
              {isPixConfigured ? 'Configurado e Ativo' : 'Não configurado'}
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
                <MaterialCommunityIcons name="check" size={20} color="white" />
                <Text className="text-white font-bold ml-2">
                  Salvar Configurações
                </Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}
export default PixConfigPanel;
