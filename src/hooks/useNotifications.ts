import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { useAppContext } from '@/context/AppContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true
  })
});

export function useNotifications() {
  const { profile, updateProfile } = useAppContext();

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C'
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Falha ao obter token para notificações push!');
        return;
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: '3276267e-3c18-442a-9d22-9f109059606d'
        })
      ).data;
      console.log('Expo Push Token:', token);
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  const toggleNotifications = async (enabled: boolean) => {
    try {
      if (enabled) {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await updateProfile({
            notifications_enabled: true,
            expo_push_token: token,
            // Default sub-settings to true if enabling for the first time
            sales_notifications: profile?.sales_notifications ?? true
          });
        }
      } else {
        await updateProfile({
          notifications_enabled: false
        });
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      throw error;
    }
  };

  const sendLocalNotification = async (title: string, body: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body
      },
      trigger: null
    });
  };

  return {
    registerForPushNotificationsAsync,
    toggleNotifications,
    sendLocalNotification
  };
}
