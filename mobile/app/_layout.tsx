import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import { initSentry } from '../src/bootstrap/initSentry';
import { QueryClientProvider } from '@tanstack/react-query';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../tamagui.config';
import { queryClient } from '../src/query/queryClient';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold
  });

  useEffect(() => {
    initSentry();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
          <SafeAreaProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </SafeAreaProvider>
        </TamaguiProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

