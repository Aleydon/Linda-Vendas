import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut
} from 'react-native-reanimated';

import { formatCurrency } from '@/utils/formatters';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (status?: 'paid' | 'pending', customerName?: string) => void;
  total: number;
  loading: boolean;
  pixString: string;
  allowFiado?: boolean;
  colorScheme: 'light' | 'dark';
  hasOwnPix?: boolean;
}

export function PaymentModal({
  visible,
  onClose,
  onConfirm,
  total,
  loading,
  pixString,
  allowFiado = false,
  colorScheme,
  hasOwnPix = false
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'fiado' | null>(
    allowFiado ? null : 'pix'
  );
  const [customerName, setCustomerName] = useState('');
  const fiadoEnabled = allowFiado === true;

  useEffect(() => {
    if (visible) {
      setPaymentMethod(fiadoEnabled ? null : 'pix');
      setCustomerName('');
    }
  }, [fiadoEnabled, visible]);

  if (!visible) return null;

  const handleConfirm = () => {
    if (!paymentMethod) {
      return;
    }
    if (paymentMethod === 'fiado' && !customerName.trim()) {
      return;
    }
    if (paymentMethod === 'pix' && !pixString) {
      return;
    }
    onConfirm(paymentMethod === 'pix' ? 'paid' : 'pending', customerName);
  };

  const resetAndClose = () => {
    setPaymentMethod(fiadoEnabled ? null : 'pix');
    setCustomerName('');
    onClose();
  };

  const isConfirmDisabled =
    loading ||
    !paymentMethod ||
    (paymentMethod === 'fiado' && !customerName.trim()) ||
    (paymentMethod === 'pix' && !pixString);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={resetAndClose}
    >
      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1 items-center justify-center px-5"
      >
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          className="absolute inset-0 bg-black/50"
        >
          <Pressable className="flex-1" onPress={resetAndClose} />
        </Animated.View>

        <Animated.View
          entering={ZoomIn.springify().damping(15)}
          exiting={ZoomOut}
          className="w-full rounded-2xl bg-white dark:bg-zinc-900 p-4 shadow-2xl"
        >
          <View className="mb-4 items-center">
            <Text className="text-text-primary dark:text-zinc-100 mb-1 text-lg font-bold">
              Forma de Pagamento
            </Text>
            <Text className="text-text-secondary dark:text-zinc-400 text-center text-sm">
              Total: {formatCurrency(total)}
            </Text>
          </View>

          {fiadoEnabled && (
            <View className="mb-4 flex-row gap-3">
              <TouchableOpacity
                onPress={() => setPaymentMethod('pix')}
                className={`flex-1 items-center justify-center rounded-xl border px-3 py-3 ${
                  paymentMethod === 'pix'
                    ? 'border-primary bg-orange-50 dark:border-orange-500 dark:bg-orange-950/20'
                    : 'border-secondary bg-secondary dark:border-zinc-800 dark:bg-zinc-800'
                }`}
              >
                <MaterialCommunityIcons
                  name="qrcode-scan"
                  size={22}
                  color={paymentMethod === 'pix' ? '#A34211' : '#71717a'}
                />
                <Text
                  className={`mt-1 text-center text-xs font-bold ${
                    paymentMethod === 'pix'
                      ? 'text-text-primary dark:text-zinc-100'
                      : 'text-text-secondary dark:text-zinc-400'
                  }`}
                >
                  QR Code PIX
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPaymentMethod('fiado')}
                className={`flex-1 items-center justify-center rounded-xl border px-3 py-3 ${
                  paymentMethod === 'fiado'
                    ? 'border-primary bg-orange-50 dark:border-orange-500 dark:bg-orange-950/20'
                    : 'border-secondary bg-secondary dark:border-zinc-800 dark:bg-zinc-800'
                }`}
              >
                <MaterialCommunityIcons
                  name="calendar-clock"
                  size={22}
                  color={paymentMethod === 'fiado' ? '#A34211' : '#71717a'}
                />
                <Text
                  className={`mt-1 text-center text-xs font-bold ${
                    paymentMethod === 'fiado'
                      ? 'text-text-primary dark:text-zinc-100'
                      : 'text-text-secondary dark:text-zinc-400'
                  }`}
                >
                  Vender Fiado
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <Animated.View
            key={paymentMethod ?? 'none'}
            entering={FadeIn.duration(180)}
            exiting={FadeOut.duration(120)}
          >
            {paymentMethod === 'pix' ? (
              <View className="mb-4 items-center">
                <View className="items-center justify-center rounded-xl bg-secondary p-3 dark:bg-white mb-4">
                  {pixString ? (
                    <QRCode
                      value={pixString}
                      size={220}
                      color="#09090b"
                      backgroundColor="white"
                    />
                  ) : (
                    <View className="h-[220px] w-[220px] items-center justify-center">
                      <MaterialCommunityIcons
                        name="qrcode-remove"
                        size={60}
                        color={colorScheme === 'dark' ? '#09090b' : '#BDB2B2'}
                      />
                      <Text className="text-text-secondary dark:text-zinc-950 mt-2 text-center text-xs">
                        PIX não configurado
                      </Text>
                    </View>
                  )}
                </View>

                {pixString && !hasOwnPix && (
                  <View className="mb-3 rounded-xl border border-orange-200 dark:border-orange-900/30 bg-orange-50 dark:bg-orange-950/20 px-3 py-2">
                    <Text className="text-orange-600 dark:text-orange-400 text-[11px] text-center">
                      Chave PIX padrão do administrador. Configure sua própria
                      chave em Meu Perfil.
                    </Text>
                  </View>
                )}

                <View className="w-full">
                  <Text className="text-text-primary dark:text-zinc-100 mb-2 ml-1 font-bold">
                    Nome do Cliente (Opcional)
                  </Text>
                  <View className="rounded-xl border border-zinc-200 bg-secondary px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-800">
                    <TextInput
                      placeholder="Ex: João Silva"
                      placeholderTextColor="#71717a"
                      className="text-text-primary dark:text-zinc-100 text-base"
                      value={customerName}
                      onChangeText={setCustomerName}
                      returnKeyType="done"
                    />
                  </View>
                </View>
              </View>
            ) : fiadoEnabled && paymentMethod === 'fiado' ? (
              <View className="mb-4">
                <Text className="text-text-primary dark:text-zinc-100 mb-2 ml-1 font-bold">
                  Nome do Cliente
                </Text>
                <View className="rounded-xl border border-zinc-200 bg-secondary px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-800">
                  <TextInput
                    placeholder="Ex: João Silva"
                    placeholderTextColor="#71717a"
                    className="text-text-primary dark:text-zinc-100 text-base"
                    value={customerName}
                    onChangeText={setCustomerName}
                    returnKeyType="done"
                  />
                </View>
                <Text className="text-text-secondary dark:text-zinc-400 ml-1 mt-2 text-xs">
                  A venda ficará marcada como pendente no histórico.
                </Text>
              </View>
            ) : fiadoEnabled ? (
              <View className="mb-4 rounded-xl border border-dashed border-secondary px-4 py-3 dark:border-zinc-800">
                <Text className="text-text-secondary dark:text-zinc-400 text-center text-sm">
                  Escolha uma forma de pagamento para continuar.
                </Text>
              </View>
            ) : null}
          </Animated.View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={resetAndClose}
              className="flex-1 items-center justify-center rounded-xl border border-secondary py-3 dark:border-zinc-800"
            >
              <Text className="text-text-primary dark:text-zinc-100 font-bold">
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              disabled={isConfirmDisabled}
              className={`flex-1 flex-row items-center justify-center rounded-xl py-3 shadow-lg ${
                isConfirmDisabled
                  ? 'bg-zinc-300 dark:bg-zinc-800'
                  : 'bg-primary dark:bg-orange-600 shadow-orange-500/40'
              }`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color="white"
                  />
                  <Text className="ml-2 font-bold text-white">
                    {paymentMethod === 'fiado' ? 'Salvar Fiado' : 'Confirmar'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
