// src/stores/notificationStore.js
import { create } from 'zustand'
import { supabase } from '../services/supabase'

export const useNotificationStore = create((set, get) => ({
  // État
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Charger les notifications
  loadNotifications: async () => {
    try {
      const userId = useAuthStore.getState().user?.id
      if (!userId) return

      set({ loading: true, error: null })

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          source_user:users!source_user_id(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      const notifications = data || []
      const unreadCount = notifications.filter(n => !n.is_read).length

      set({
        notifications,
        unreadCount,
        loading: false
      })
    } catch (error) {
      set({
        error: error.message,
        loading: false
      })
    }
  },

  // Marquer comme lu
  markAsRead: async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error

      // Mettre à jour le store
      const { notifications, unreadCount } = get()
      const updatedNotifications = notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      )

      set({
        notifications: updatedNotifications,
        unreadCount: Math.max(0, unreadCount - 1)
      })
    } catch (error) {
      console.error('Erreur marquage notification:', error)
    }
  },

  // Marquer toutes comme lues
  markAllAsRead: async () => {
    try {
      const userId = useAuthStore.getState().user?.id
      if (!userId) return

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) throw error

      // Mettre à jour le store
      const { notifications } = get()
      const updatedNotifications = notifications.map(n => ({ ...n, is_read: true }))

      set({
        notifications: updatedNotifications,
        unreadCount: 0
      })
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error)
    }
  },

  // Écouter les notifications en temps réel
  subscribeToNotifications: () => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) return

    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // Ajouter la nouvelle notification
          const { notifications, unreadCount } = get()
          set({
            notifications: [payload.new, ...notifications],
            unreadCount: unreadCount + 1
          })
        }
      )
      .subscribe()

    return subscription
  }
}))

// Fonctions utilitaires
const formatTimeAgo = (timestamp) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInSeconds = Math.floor((now - time) / 1000)

  if (diffInSeconds < 60) return 'À l\'instant'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}j`
  
  return time.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short' 
  })
}

const calculateTimeLeft = (endDate) => {
  const end = new Date(endDate)
  const now = new Date()
  const diffTime = end - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays <= 0) return 'Terminé'
  if (diffDays === 1) return '1 jour'
  if (diffDays < 7) return `${diffDays} jours`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} sem.`
  return `${Math.ceil(diffDays / 30)} mois`
}