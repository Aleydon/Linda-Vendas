import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
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
  onConfirm: () => void;
  total: number;
  loading: boolean;
  pixString: string;
}

export function PaymentModal({
  visible,
  onClose,
  onConfirm,
  total,
  loading,
  pixString
}: PaymentModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center px-6">
        <Animated.View
          entering={FadeIn}
          leaving={FadeOut}
          className="absolute inset-0 bg-black/50"
        >
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        <Animated.View
          entering={ZoomIn.springify().damping(15)}
          leaving={ZoomOut}
          className="w-full rounded-3xl bg-white p-6 shadow-2xl"
        >
          <View className="mb-6 items-center">
            <Text className="text-text-primary mb-2 text-xl font-bold">
              Confirmar Pagamento
            </Text>
            <Text className="text-text-secondary text-center">
              Aponte a câmera para o QR Code abaixo para realizar o pagamento
              via PIX.
            </Text>
          </View>

          <View className="mb-6 items-center justify-center rounded-2xl bg-secondary p-4">
            {pixString ? (
              <QRCode
                value={pixString}
                size={200}
                color="#3C2F2F"
                backgroundColor="transparent"
              />
            ) : (
              <View className="h-[200px] w-[200px] items-center justify-center">
                <MaterialCommunityIcons
                  name="qrcode-remove"
                  size={48}
                  color="#BDB2B2"
                />
                <Text className="text-text-secondary mt-2 text-center text-xs">
                  PIX não configurado
                </Text>
              </View>
            )}
          </View>

          <View className="mb-6">
            <View className="flex-row justify-between border-b border-secondary pb-2">
              <Text className="text-text-secondary">Total a pagar:</Text>
              <Text className="text-primary font-bold text-lg">
                {formatCurrency(total)}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 items-center justify-center rounded-xl border border-secondary py-4"
            >
              <Text className="text-text-primary font-bold">Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              disabled={loading}
              className="bg-primary flex-[2] flex-row items-center justify-center rounded-xl py-4 shadow-lg shadow-orange-500/40"
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
                    Confirmar Venda
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
