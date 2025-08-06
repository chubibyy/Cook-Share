// src/navigation/AuthNavigator.js
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { 
  LoginScreen, 
  RegisterScreen, 
  ForgotPasswordScreen,
  WelcomeScreen 
} from '../screens/auth'

const Stack = createStackNavigator()

const AuthNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Welcome"
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: true 
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  )
}

export default AuthNavigator

