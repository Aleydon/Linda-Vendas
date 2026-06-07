import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut
} from 'react-native-reanimated';

import { useAlert } from '@/context/AlertContext';
import { useAppContext } from '@/context/AppContext';

export function CustomAlertModal() {
  const { alertConfig, isVisible, hideAlert } = useAlert();
  const { colorScheme } = useAppContext();

  useEffect(() => {
    if (isVisible && alertConfig?.type) {
      void (async () => {
        try {
          switch (alertConfig.type) {
            case 'success':
              await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
              break;
            case 'error':
              await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
              );
              break;
            case 'warning':
              await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning
              );
              break;
            case 'confirm':
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              break;
            case 'info':
            default:
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              break;
          }
        } catch {
          // Ignora falhas de haptics em ambientes sem suporte
        }
      })();
    }
  }, [isVisible, alertConfig?.type]);

  if (!alertConfig) return null;

  const { title, description, type = 'info', buttons } = alertConfig;

  const handleButtonPress = async (onPress?: () => void | Promise<void>) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignora falhas de haptics
    }
    hideAlert();
    if (onPress) {
      setTimeout(async () => {
        await onPress();
      }, 150);
    }
  };

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'check-circle-outline' as const,
          color: '#10B981',
          bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
          borderColor: 'border-emerald-100 dark:border-emerald-900/30'
        };
      case 'error':
        return {
          icon: 'close-circle-outline' as const,
          color: '#EF4444',
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          borderColor: 'border-red-100 dark:border-red-900/30'
        };
      case 'warning':
        return {
          icon: 'alert-outline' as const,
          color: '#F59E0B',
          bgColor: 'bg-amber-50 dark:bg-amber-950/20',
          borderColor: 'border-amber-100 dark:border-amber-900/30'
        };
      case 'confirm':
        return {
          icon: 'help-circle-outline' as const,
          color: colorScheme === 'dark' ? '#fb923c' : '#A34211',
          bgColor: colorScheme === 'dark' ? 'bg-orange-950/20' : 'bg-orange-50',
          borderColor:
            colorScheme === 'dark'
              ? 'border-orange-900/30'
              : 'border-orange-100'
        };
      case 'info':
      default:
        return {
          icon: 'information-outline' as const,
          color: '#3B82F6',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          borderColor: 'border-blue-100 dark:border-blue-900/30'
        };
    }
  };

  const config = getTypeConfig();
  const activeButtons =
    buttons && buttons.length > 0
      ? buttons
      : [{ text: 'OK', style: 'default' as const }];

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={hideAlert}
    >
      <View className="flex-1 items-center justify-center px-6">
        <Animated.View
          entering={FadeIn.duration(250)}
          exiting={FadeOut.duration(200)}
          className="absolute inset-0"
        >
          <BlurView
            intensity={colorScheme === 'dark' ? 30 : 20}
            tint={colorScheme === 'dark' ? 'dark' : 'light'}
            className="flex-1"
          >
            <Pressable
              className="flex-1 bg-black/40 dark:bg-black/60"
              onPress={hideAlert}
            />
          </BlurView>
        </Animated.View>

        <Animated.View
          entering={ZoomIn.springify().damping(18).stiffness(120)}
          exiting={ZoomOut.duration(150)}
          className="w-full max-w-[340px] rounded-[36px] bg-white dark:bg-zinc-900 p-6 shadow-2xl border border-secondary/15 dark:border-zinc-800"
        >
          <View className="items-center mb-5">
            {/* Outer animated-like ring for aesthetic appeal */}
            <View
              className={`p-1.5 rounded-full border ${config.borderColor} mb-4`}
            >
              <View className={`p-4 rounded-full ${config.bgColor}`}>
                <MaterialCommunityIcons
                  name={config.icon}
                  size={36}
                  color={config.color}
                />
              </View>
            </View>

            <Text className="text-text-primary dark:text-zinc-100 font-bold text-xl text-center px-2">
              {title}
            </Text>

            {description && (
              <Text className="text-text-secondary dark:text-zinc-400 text-center mt-2.5 text-sm leading-5 px-1 font-medium">
                {description}
              </Text>
            )}
          </View>

          <View className="flex-row gap-3 mt-3">
            {activeButtons.map((btn, index) => {
              let btnClass =
                'flex-1 py-3.5 rounded-2xl items-center justify-center border shadow-sm ';
              let textClass = 'font-bold text-sm ';

              if (btn.style === 'destructive') {
                btnClass +=
                  'bg-red-500 dark:bg-red-600 border-red-500 dark:border-red-600 active:bg-red-600 dark:active:bg-red-700';
                textClass += 'text-white';
              } else if (btn.style === 'cancel') {
                btnClass +=
                  'bg-gray-50 dark:bg-zinc-800/80 border-gray-200/50 dark:border-zinc-700/50 active:bg-gray-100 dark:active:bg-zinc-800';
                textClass += 'text-text-secondary dark:text-zinc-300';
              } else {
                btnClass +=
                  'bg-primary dark:bg-orange-600 border-primary dark:border-orange-600 active:bg-primary/95 dark:active:bg-orange-700';
                textClass += 'text-white';
              }

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => void handleButtonPress(btn.onPress)}
                  className={btnClass}
                  activeOpacity={0.85}
                >
                  <Text className={textClass}>{btn.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default CustomAlertModal;
