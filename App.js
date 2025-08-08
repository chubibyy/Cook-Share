// App.js
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { LogBox, Alert, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuthStore } from './src/stores/authStore';
import AuthNavigator from './src/navigation/AuthNavigator';
import AppNavigator from './src/navigation/AppNavigator';
import { OnboardingScreen } from './src/screens/auth/OnboardingScreen';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { ENV } from './src/utils/env';
import { COLORS } from './src/utils/constants';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'AsyncStorage has been extracted from react-native',
  'Require cycle:',
]);

const Stack = createNativeStackNavigator();

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    (async () => {
      try {
        ENV.validate?.();
        await initialize();
      } catch (e) {
        console.error('Init error:', e);
        Alert.alert('Config Supabase', 'Vérifie tes variables EXPO_PUBLIC_… dans app.json/.env');
      }
    })();
  }, []);

  if (!isInitialized) return null;

  const isAuthenticated = !!user;
  const onboardingDone = !!user?.onboarding_completed;

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
              {!isAuthenticated ? (
                <Stack.Screen name="Auth" component={AuthNavigator} />
              ) : onboardingDone ? (
                <Stack.Screen name="App" component={AppNavigator} />
              ) : (
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
