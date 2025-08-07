// src/navigation/AppNavigator.js
import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import TabNavigator from './TabNavigator';

// ⚠️ Pas de NavigationContainer ici, ni de Stack racine.
// ⚠️ Pas d'initialize() ici : App.js s'en charge déjà.

const AppNavigator = () => {
  const user = useAuthStore((s) => s.user);
  const { subscribeToNotifications } = useNotificationStore();

  useEffect(() => {
    if (user?.id) {
      const sub = subscribeToNotifications();
      return () => sub?.unsubscribe?.();
    }
  }, [user, subscribeToNotifications]);

  return <TabNavigator />;
};

export default AppNavigator;
