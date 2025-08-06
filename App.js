// App.js
import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { Platform } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as SplashScreen from 'expo-splash-screen'
import * as Font from 'expo-font'
import * as Notifications from 'expo-notifications'
import AppNavigator from './src/navigation/AppNavigator'
import { COLORS } from './src/utils/constants'

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

// Prévenir le splash screen de se cacher automatiquement
SplashScreen.preventAutoHideAsync()

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false)

  useEffect(() => {
    async function prepare() {
      try {
        // Charger les ressources nécessaires
        await loadFonts()
        await setupNotifications()
        
        // Simuler un temps de chargement minimum pour une UX fluide
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (e) {
        console.warn('Erreur lors du chargement des ressources:', e)
      } finally {
        setAppIsReady(true)
      }
    }

    prepare()
  }, [])

  const loadFonts = async () => {
    // Chargement des polices personnalisées si nécessaire
    // Pour l'instant, on utilise les fonts système
    return Promise.resolve()
  }

  const setupNotifications = async () => {
    // Demander les permissions de notification
    const { status } = await Notifications.requestPermissionsAsync()
    
    if (status !== 'granted') {
      console.log('Permission de notification refusée')
      return
    }

    // Configuration pour Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'PlateUp',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: COLORS.primary,
        sound: 'default',
        description: 'Notifications PlateUp pour les likes, commentaires et défis'
      })
    }
  }

  const onLayoutRootView = React.useCallback(async () => {
    if (appIsReady) {
      // Cacher le splash screen une fois que l'app est prête
      await SplashScreen.hideAsync()
    }
  }, [appIsReady])

  if (!appIsReady) {
    return null
  }

  return (
    <GestureHandlerRootView 
      style={{ flex: 1 }} 
      onLayout={onLayoutRootView}
    >
      <StatusBar 
        style="dark" 
        backgroundColor={COLORS.background}
        translucent={Platform.OS === 'android'}
      />
      <AppNavigator />
    </GestureHandlerRootView>
  )
}

