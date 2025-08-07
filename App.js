
// App.js Final - Version Production Complète
import React, { useEffect } from 'react';
import { LogBox, Alert, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { useAuthStore } from './src/stores/authStore';
import { ENV } from './src/utils/env';
import { COLORS } from './src/utils/constants';

// Configuration des logs de développement
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'AsyncStorage has been extracted from react-native',
  'Require cycle:', // Cycles de dépendances - common en développement
]);

export default function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log(`🚀 Démarrage de ${ENV.APP_NAME} v${ENV.APP_VERSION}`);
      
      // Vérifier la configuration
      ENV.validate();
      
      // Initialiser l'authentification
      await initialize();
      
      console.log('✅ Application initialisée avec succès');
    } catch (error) {
      console.error('❌ Erreur initialisation app:', error);
      
      Alert.alert(
        'Erreur de configuration',
        'Vérifiez votre configuration Supabase dans les variables d\'environnement.',
        [
          { text: 'Réessayer', onPress: initializeApp },
          { text: 'Quitter', style: 'destructive' }
        ]
      );
    }
  };

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar 
            barStyle="dark-content" 
            backgroundColor={COLORS.background}
            translucent={false}
          />
          <AppNavigator />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
