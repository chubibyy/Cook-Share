// src/hooks/useNotifications.js
import { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import { useNotificationStore } from '../stores/notificationStore'

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState('')
  const [notification, setNotification] = useState(false)
  const { loadNotifications, markAsRead, markAllAsRead } = useNotificationStore()

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token))

    // Écouter les notifications reçues
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification)
    })

    // Écouter les interactions avec les notifications
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response)
      // Naviguer vers l'écran approprié
      handleNotificationResponse(response)
    })

    return () => {
      Notifications.removeNotificationSubscription(notificationListener)
      Notifications.removeNotificationSubscription(responseListener)
    }
  }, [])

  // Enregistrement pour les push notifications
  async function registerForPushNotificationsAsync() {
    let token

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      })
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    
    if (finalStatus !== 'granted') {
      alert('Impossible d\'obtenir les permissions pour les notifications push!')
      return
    }
    
    token = (await Notifications.getExpoPushTokenAsync()).data
    console.log('Push token:', token)

    return token
  }

  // Gérer les réponses aux notifications
  const handleNotificationResponse = (response) => {
    const data = response.notification.request.content.data
    
    // Naviguer selon le type de notification
    if (data.type === 'like' || data.type === 'comment') {
      // Naviguer vers la session
      navigation.navigate('SessionDetail', { sessionId: data.sessionId })
    } else if (data.type === 'challenge') {
      // Naviguer vers le challenge
      navigation.navigate('ChallengeDetail', { challengeId: data.challengeId })
    } else if (data.type === 'follow') {
      // Naviguer vers le profil
      navigation.navigate('UserProfile', { userId: data.userId })
    }
  }

  // Envoyer une notification locale
  const sendLocalNotification = async (title, body, data = {}) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null,
    })
  }

  return {
    expoPushToken,
    notification,
    sendLocalNotification,
    loadNotifications,
    markAsRead,
    markAllAsRead
  }
}

