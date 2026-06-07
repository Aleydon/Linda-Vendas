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
import { Stack, useRouter, useSegments } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { Loading } from '@/components/Loading';
import { AppProvider, useAppContext } from '@/context/AppContext';

function InitialLayout() {
  const { user, loading } = useAppContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'login';

    if (!user && !inAuthGroup) {
      router.replace('/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)/dashboard');
    }
  }, [user, segments, loading]);

  if (loading) {
    return <Loading />;
  }

  return (
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
        options={{ animation: 'slide_from_bottom' }}
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
  );
}

function MainContent() {
  const { colorScheme } = useColorScheme();

  return (
    <>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaProvider>
        <SafeAreaView
          edges={[]}
          style={{ flex: 1 }}
          className="bg-background dark:bg-zinc-950"
        >
          <InitialLayout />
        </SafeAreaView>
      </SafeAreaProvider>
    </>
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
    return <Loading />;
  }

  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

RootLayout.displayName = 'RootLayout';

export default RootLayout;
