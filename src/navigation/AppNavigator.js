// src/navigation/AppNavigator.js - Navigateur principal mis à jour
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import { LoadingSpinner } from '../components/common';
import { View } from 'react-native';
import { COLORS } from '../utils/constants';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, isInitialized, initialize } = useAuthStore();
  const { subscribeToNotifications } = useNotificationStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (user?.id) {
      // S'abonner aux notifications en temps réel
      const subscription = subscribeToNotifications();
      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [user]);

  // Écran de chargement
  if (!isInitialized) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: COLORS.background 
      }}>
        <LoadingSpinner size={50} color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor={COLORS.background} />
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          gestureEnabled: false // Désactiver les gestes pour éviter les retours non désirés
        }}
      >
        {user && user.onboarding_completed ? (
          // Utilisateur connecté et onboardé -> App principale
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : (
          // Pas connecté ou pas onboardé -> Flow d'auth
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export { AppNavigator };
