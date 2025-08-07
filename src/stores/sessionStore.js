// src/stores/sessionStore.js
import { create } from 'zustand'
import { sessionsService } from '../services/sessions.js'

export const useSessionStore = create((set, get) => ({
  // État
  sessions: [],
  currentSession: null,
  loading: false,
  error: null,
  hasMore: true,
  currentPage: 0,

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Charger le feed
  loadFeed: async (refresh = false) => {
    try {
      const { loading, currentPage, sessions } = get()
      if (loading) return

      set({ loading: true, error: null })

      const page = refresh ? 0 : currentPage
      const userId = useAuthStore.getState().user?.id

      const newSessions = await sessionsService.getFeed(page, 10, userId)

      if (refresh) {
        set({
          sessions: newSessions,
          currentPage: 1,
          hasMore: newSessions.length === 10,
          loading: false
        })
      } else {
        set({
          sessions: [...sessions, ...newSessions],
          currentPage: page + 1,
          hasMore: newSessions.length === 10,
          loading: false
        })
      }
    } catch (error) {
      console.error('Erreur chargement feed:', error)
      set({
        error: error.message,
        loading: false
      })
    }
  },

  // Charger plus de sessions
  loadMore: async () => {
    const { hasMore } = get()
    if (!hasMore) return
    await get().loadFeed(false)
  },

  // Actualiser le feed
  refresh: async () => {
    await get().loadFeed(true)
  },

  // Créer une session
  createSession: async (sessionData) => {
    try {
      set({ loading: true, error: null })

      const userId = useAuthStore.getState().user?.id
      if (!userId) throw new Error('Utilisateur non connecté')

      const newSession = await sessionsService.createSession({
        ...sessionData,
        user_id: userId
      })

      // Ajouter au début de la liste
      const { sessions } = get()
      set({
        sessions: [newSession, ...sessions],
        loading: false
      })

      return { success: true, session: newSession }
    } catch (error) {
      set({
        error: error.message,
        loading: false
      })
      return { success: false, error: error.message }
    }
  },

  // Obtenir une session par ID
  getSessionById: async (sessionId) => {
    try {
      set({ loading: true, error: null })

      const userId = useAuthStore.getState().user?.id
      const session = await sessionsService.getSessionById(sessionId, userId)

      set({
        currentSession: session,
        loading: false
      })

      return session
    } catch (error) {
      set({
        error: error.message,
        loading: false
      })
      throw error
    }
  },

  // Toggle like
  toggleLike: async (sessionId) => {
    try {
      const userId = useAuthStore.getState().user?.id
      if (!userId) throw new Error('Utilisateur non connecté')

      const { sessions } = get()
      
      // Optimistic update
      const updatedSessions = sessions.map(session => {
        if (session.id === sessionId) {
          const newLiked = !session.isLiked
          return {
            ...session,
            isLiked: newLiked,
            likesCount: session.likesCount + (newLiked ? 1 : -1)
          }
        }
        return session
      })

      set({ sessions: updatedSessions })

      // Requête API
      await sessionsService.toggleLike(sessionId, userId)
    } catch (error) {
      // Revert optimistic update on error
      get().refresh()
      console.error('Erreur toggle like:', error)
    }
  },

  // Toggle save
  toggleSave: async (sessionId) => {
    try {
      const userId = useAuthStore.getState().user?.id
      if (!userId) throw new Error('Utilisateur non connecté')

      const { sessions } = get()
      
      // Optimistic update
      const updatedSessions = sessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            isSaved: !session.isSaved
          }
        }
        return session
      })

      set({ sessions: updatedSessions })

      // Requête API
      await sessionsService.toggleSave(sessionId, userId)
    } catch (error) {
      // Revert optimistic update on error
      get().refresh()
      console.error('Erreur toggle save:', error)
    }
  },

  // Ajouter un commentaire
  addComment: async (sessionId, content, parentId = null) => {
    try {
      const userId = useAuthStore.getState().user?.id
      if (!userId) throw new Error('Utilisateur non connecté')

      const comment = await sessionsService.addComment(sessionId, userId, content, parentId)

      // Mettre à jour le compteur de commentaires
      const { sessions, currentSession } = get()
      
      const updatedSessions = sessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            commentsCount: session.commentsCount + 1
          }
        }
        return session
      })

      set({ sessions: updatedSessions })

      // Si c'est la session actuelle, ajouter le commentaire
      if (currentSession?.id === sessionId) {
        set({
          currentSession: {
            ...currentSession,
            comments: [...(currentSession.comments || []), comment],
            commentsCount: currentSession.commentsCount + 1
          }
        })
      }

      return comment
    } catch (error) {
      console.error('Erreur ajout commentaire:', error)
      throw error
    }
  }
}))

