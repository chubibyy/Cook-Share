// src/navigation/AuthNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { useAuthStore } from '../stores/authStore';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  const { user } = useAuthStore();

  // Si l'utilisateur existe mais n'a pas terminé l'onboarding
  const needsOnboarding = user && !user.onboarding_completed;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
      initialRouteName={needsOnboarding ? 'Onboarding' : 'Welcome'}
    >
      {needsOnboarding ? (
        // Flow d'onboarding
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        // Flow d'authentification
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
export { AuthNavigator};
