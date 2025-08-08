// src/navigation/AppNavigator.js
import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import TabNavigator from './TabNavigator';

// ⚠️ assure-toi que ce fichier exporte bien par défaut
// export default function CreateSessionScreen() {...}
import { CreateSessionScreen } from '../screens/create/CreateSessionScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const user = useAuthStore((s) => s.user);
  const { subscribeToNotifications } = useNotificationStore();

  useEffect(() => {
    if (user?.id) {
      const sub = subscribeToNotifications();
      return () => sub?.unsubscribe?.();
    }
  }, [user, subscribeToNotifications]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Tes tabs */}
      <Stack.Screen name="Tabs" component={TabNavigator} />
      {/* Le create en modal plein écran */}
      <Stack.Screen
        name="CreateSession"
        component={CreateSessionScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
