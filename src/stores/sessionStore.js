// src/stores/sessionStore.js
import { create } from 'zustand'
import { sessionsService } from '../services/session.js'
import { useAuthStore } from './authStore'

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
    const userId = useAuthStore.getState().user?.id
    if (!userId) throw new Error('Utilisateur non connecté')

    const { sessions, currentSession } = get()
    const originalSessions = [...sessions]
    const originalCurrentSession = currentSession ? { ...currentSession } : null

    // Optimistic update
    const updateSessionState = (session) => {
      if (!session) return null
      const isLiked = !session.isLiked
      return {
        ...session,
        isLiked,
        likesCount: session.likesCount + (isLiked ? 1 : -1)
      }
    }

    const updatedSessions = sessions.map(s => s.id === sessionId ? updateSessionState(s) : s)
    const updatedCurrentSession = currentSession?.id === sessionId ? updateSessionState(currentSession) : currentSession

    set({ sessions: updatedSessions, currentSession: updatedCurrentSession })

    try {
      // API call
      await sessionsService.toggleLike(sessionId, userId)
    } catch (error) {
      console.error('Erreur toggle like:', error)
      // Revert on error
      set({ sessions: originalSessions, currentSession: originalCurrentSession })
    }
  },

  // Toggle save
  toggleSave: async (sessionId) => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) throw new Error('Utilisateur non connecté')

    const { sessions, currentSession } = get()
    const originalSessions = [...sessions]
    const originalCurrentSession = currentSession ? { ...currentSession } : null

    // Optimistic update
    const updateSessionState = (session) => {
      if (!session) return null
      return { ...session, isSaved: !session.isSaved }
    }

    const updatedSessions = sessions.map(s => s.id === sessionId ? updateSessionState(s) : s)
    const updatedCurrentSession = currentSession?.id === sessionId ? updateSessionState(currentSession) : currentSession
    
    set({ sessions: updatedSessions, currentSession: updatedCurrentSession })

    try {
      // API call
      await sessionsService.toggleSave(sessionId, userId)
    } catch (error) {
      console.error('Erreur toggle save:', error)
      // Revert on error
      set({ sessions: originalSessions, currentSession: originalCurrentSession })
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
  },

  // Supprimer un commentaire
  deleteComment: async (sessionId, commentId) => {
    try {
      const userId = useAuthStore.getState().user?.id
      if (!userId) throw new Error('Utilisateur non connecté')

      await sessionsService.deleteComment(commentId, userId)

      // Mettre à jour le state local
      const { sessions, currentSession } = get()
      
      // Mettre à jour le compteur de commentaires dans les sessions
      const updatedSessions = sessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            commentsCount: Math.max(0, session.commentsCount - 1)
          }
        }
        return session
      })

      set({ sessions: updatedSessions })

      // Si c'est la session actuelle, supprimer le commentaire de la liste
      if (currentSession?.id === sessionId) {
        const updatedComments = currentSession.comments?.filter(comment => comment.id !== commentId) || []
        set({
          currentSession: {
            ...currentSession,
            comments: updatedComments,
            commentsCount: Math.max(0, currentSession.commentsCount - 1)
          }
        })
      }

      return { success: true }
    } catch (error) {
      console.error('Erreur suppression commentaire:', error)
      throw error
    }
  }
}))

