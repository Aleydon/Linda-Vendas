import './global.css';

import {
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black
} from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { router, Stack, usePathname } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { CustomAlertModal } from '@/components/CustomAlertModal';
import Skeleton from '@/components/Skeleton';
import { AlertProvider } from '@/context/AlertContext';
import { AppProvider, useAppContext } from '@/context/AppContext';

function AuthGuard() {
  const { user, initialLoading } = useAppContext();
  const pathname = usePathname();

  useEffect(() => {
    if (initialLoading) return;

    const inAuthGroup = pathname.startsWith('/login');

    if (!user && !inAuthGroup) {
      router.replace('/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)/dashboard');
    }
  }, [user, pathname, initialLoading]);

  return null;
}

function InitialLayout() {
  return (
    <>
      <AuthGuard />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="profile"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="user-sales"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="notifications"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="new-product"
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="edit-product/[id]"
          options={{ animation: 'slide_from_right' }}
        />
      </Stack>
    </>
  );
}

function MainContent() {
  const { colorScheme } = useColorScheme();

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView
        edges={[]}
        style={{ flex: 1 }}
        className="bg-background dark:bg-zinc-950"
      >
        <InitialLayout />
        <CustomAlertModal />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export function RootLayout() {
  const [fontsIsLoaded] = useFonts({
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black
  });

  if (!fontsIsLoaded) {
    return <Skeleton />;
  }

  return (
    <AppProvider>
      <AlertProvider>
        <MainContent />
      </AlertProvider>
    </AppProvider>
  );
}

RootLayout.displayName = 'RootLayout';

export default RootLayout;
