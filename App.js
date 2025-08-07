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
import AppNavigator from './src/navigation/AppNavigator'; // <-- ne doit PAS avoir son propre NavigationContainer
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
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log(`🚀 Démarrage de ${ENV.APP_NAME} v${ENV.APP_VERSION}`);
      ENV.validate();
      await initialize();
      console.log('✅ Application initialisée avec succès');
    } catch (error) {
      console.error('❌ Erreur initialisation app:', error);
      Alert.alert(
        'Erreur de configuration',
        'Vérifiez votre configuration Supabase dans les variables d’environnement.',
        [
          { text: 'Réessayer', onPress: initializeApp },
          { text: 'Quitter', style: 'destructive' },
        ]
      );
    }
  };

  // Petit splash minimal pendant l’init
  if (!isInitialized) return null;

  const isAuthenticated = !!user;
  const onboardingDone = !!user?.onboarding_completed;

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} translucent={false} />
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
              {!isAuthenticated ? (
                <Stack.Screen name="Auth" component={AuthNavigator} />
              ) : onboardingDone ? (
                // ⚠️ Ce nom "App" doit correspondre à ce que tu utilises dans navigation.reset(...)
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
