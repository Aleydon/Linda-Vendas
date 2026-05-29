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
import ToastManager from 'expo-react-native-toastify';
import { Slot } from 'expo-router';
import { StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { Loading } from '@/components/Loading';
import { AppProvider } from '@/context/AppContext';

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
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaProvider>
        <SafeAreaView edges={[]} style={{ flex: 1 }}>
          <Slot />
          <ToastManager />
        </SafeAreaView>
      </SafeAreaProvider>
    </AppProvider>
  );
}

RootLayout.displayName = 'RootLayout';

export default RootLayout;
