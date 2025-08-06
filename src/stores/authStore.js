// src/stores/authStore.js
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authService } from '../services/auth'
import { supabase,supabaseHelpers } from '../services/supabase'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // État
      user: null,
      session: null,
      loading: false,
      error: null,
      isInitialized: false,

      // Actions
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      
      // Initialisation de l'authentification
      initialize: async () => {
        try {
          set({ loading: true, error: null })
          
          const session = await authService.getSession()
          
          if (session?.user) {
            // Récupérer le profil utilisateur complet
            const profile = await supabaseHelpers.getUserProfile(session.user.id)
            
            set({
              session,
              user: { ...session.user, ...profile },
              isInitialized: true,
              loading: false
            })
          } else {
            set({
              session: null,
              user: null,
              isInitialized: true,
              loading: false
            })
          }
        } catch (error) {
          console.error('Erreur initialisation auth:', error)
          set({ 
            error: error.message, 
            loading: false,
            isInitialized: true 
          })
        }
      },

      // Connexion
      signIn: async (email, password) => {
        try {
          set({ loading: true, error: null })
          
          const { user, session } = await authService.signIn(email, password)
          
          if (user) {
            const profile = await supabaseHelpers.getUserProfile(user.id)
            
            set({
              session,
              user: { ...user, ...profile },
              loading: false,
              error: null
            })
            
            return { success: true }
          }
        } catch (error) {
          set({ 
            error: error.message, 
            loading: false 
          })
          return { success: false, error: error.message }
        }
      },

      // Inscription
      signUp: async (email, password, metadata = {}) => {
        try {
          set({ loading: true, error: null })
          
          const { user } = await authService.signUp(email, password, metadata)
          
          set({ loading: false })
          return { 
            success: true, 
            message: 'Vérifiez votre email pour confirmer votre compte' 
          }
        } catch (error) {
          set({ 
            error: error.message, 
            loading: false 
          })
          return { success: false, error: error.message }
        }
      },

      // Déconnexion
      signOut: async () => {
        try {
          set({ loading: true })
          
          await authService.signOut()
          
          set({
            user: null,
            session: null,
            loading: false,
            error: null
          })
          
          return { success: true }
        } catch (error) {
          set({ 
            error: error.message, 
            loading: false 
          })
          return { success: false, error: error.message }
        }
      },

      // Mise à jour du profil
      updateProfile: async (updates) => {
        try {
          const { user } = get()
          if (!user) throw new Error('Utilisateur non connecté')

          set({ loading: true, error: null })

          // Mise à jour en base
          const { error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', user.id)

          if (error) throw error

          // Mise à jour du store
          set({
            user: { ...user, ...updates },
            loading: false
          })

          return { success: true }
        } catch (error) {
          set({ 
            error: error.message, 
            loading: false 
          })
          return { success: false, error: error.message }
        }
      },

      // Ajouter de l'XP
      addXP: (xpAmount) => {
        const { user } = get()
        if (user) {
          const newXP = user.xp + xpAmount
          set({
            user: { ...user, xp: newXP }
          })
        }
      },

      // Reset de l'erreur
      clearError: () => set({ error: null })
    }),
    {
      name: 'plateup-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isInitialized: state.isInitialized
      })
    }
  )
)

