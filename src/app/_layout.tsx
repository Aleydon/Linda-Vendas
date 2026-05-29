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
import { Slot, useRouter, useSegments } from 'expo-router';
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

  return <Slot />;
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
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaProvider>
        <SafeAreaView edges={[]} style={{ flex: 1 }}>
          <InitialLayout />
        </SafeAreaView>
      </SafeAreaProvider>
    </AppProvider>
  );
}

RootLayout.displayName = 'RootLayout';

export default RootLayout;
