// src/stores/authStore.js - Store mis à jour avec les nouveaux services
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authService } from '../services/auth'
import { supabase, supabaseHelpers } from '../services/supabase'

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
      clearError: () => set({ error: null }),
      
      // Initialisation de l'authentification
      initialize: async () => {
        try {
          set({ loading: true, error: null })
          
          const session = await authService.getSession()
          
          if (session?.user) {
            // Créer le profil s'il n'existe pas et le récupérer
            const profile = await supabaseHelpers.ensureUserProfile(session.user)

            set({
              session,
              user: profile ? { ...session.user, ...profile } : session.user,
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

      // Inscription
      signUp: async (email, password, metadata = {}) => {
        try {
          set({ loading: true, error: null })
          
          const result = await authService.signUp(email, password, metadata)
          
          set({ loading: false })
          
          return { 
            success: true, 
            needsEmailConfirmation: result.needsEmailConfirmation,
            message: result.needsEmailConfirmation 
              ? 'Vérifiez votre email pour confirmer votre compte' 
              : 'Compte créé avec succès'
          }
        } catch (error) {
          set({ error: error.message, loading: false })
          return { success: false, error: error.message }
        }
      },

      // Connexion
      signIn: async (email, password) => {
        try {
          set({ loading: true, error: null })
          
          const { user, session } = await authService.signIn(email, password)

          if (user && session) {
            // S'assurer que le profil existe et le récupérer
            const profile = await supabaseHelpers.ensureUserProfile(user)

            set({
              session,
              user: profile ? { ...user, ...profile } : user,
              loading: false,
              error: null
            })

            return { success: true }
          }
        } catch (error) {
          set({ error: error.message, loading: false })
          return { success: false, error: error.message }
        }
      },

      // Déconnexion
      signOut: async () => {
        try {
          set({ loading: true })
          await authService.signOut()
          set({ user: null, session: null, loading: false, error: null })
          return { success: true }
        } catch (error) {
          set({ error: error.message, loading: false })
          return { success: false, error: error.message }
        }
      },

      // Récupération de mot de passe
      resetPassword: async (email) => {
        try {
          set({ loading: true, error: null })
          await authService.resetPassword(email)
          set({ loading: false })
          return { success: true }
        } catch (error) {
          set({ error: error.message, loading: false })
          return { success: false, error: error.message }
        }
      },

      // Mise à jour du profil utilisateur (générique)
      updateProfile: async (updates) => {
        try {
          const { user } = get()
          if (!user) throw new Error('Utilisateur non connecté')

          set({ loading: true, error: null })

          // Upload de l'avatar si fourni
          let avatarUrl = user.avatar_url
          if (updates.avatar && typeof updates.avatar === 'object') {
            const uploadResult = await supabaseHelpers.uploadAvatar(updates.avatar, user.id)
            avatarUrl = uploadResult.url
          }

          // Préparer les données de mise à jour
          const profileData = {
            ...updates,
            avatar_url: avatarUrl
          }
          delete profileData.avatar

          // Mise à jour en base
          const { error } = await supabase
            .from('users')
            .update({
              ...profileData,
              updated_at: new Date().toISOString() // si la colonne n'existe pas, retire cette ligne
            })
            .eq('id', user.id)

          if (error) throw error

          // Mise à jour du store
          set({
            user: { ...user, ...profileData, avatar_url: avatarUrl },
            loading: false
          })

          return { success: true }
        } catch (error) {
          set({ error: error.message, loading: false })
          return { success: false, error: error.message }
        }
      },

      // ✅ Terminer l'onboarding (upload avatar + upsert user + refresh profil)
      completeOnboarding: async ({
        username,
        bio,
        cook_frequency,
        cook_constraints, // string[]
        cooking_level,    // string
        cooking_for,      // string[]
        avatar            // { uri, type, name } | null
      }) => {
        try {
          const { user } = get()
          if (!user?.id) throw new Error('Utilisateur non connecté')

          set({ loading: true, error: null })

          // 1) Upload avatar (optionnel) via helpers existants
          let avatar_url = user.avatar_url || null
          if (avatar && typeof avatar === 'object') {
            const res = await supabaseHelpers.uploadAvatar(avatar, user.id)
            avatar_url = res?.url || avatar_url
          }

          // 2) Upsert du profil utilisateur
          const payload = {
            id: user.id,
            email: user.email,
            username,
            bio,
            cook_frequency,
            cook_constraints,
            cooking_level,
            cooking_for,
            ...(avatar_url ? { avatar_url } : {}),
            onboarding_completed: true,
            last_seen: new Date().toISOString(),
          }

          const { error: upsertErr } = await supabase.from('users').upsert(payload)
          if (upsertErr) throw upsertErr

          // 3) Recharger la ligne users
          const { data: fresh, error: profErr } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()

          if (profErr) throw profErr

          // 4) Mettre à jour le store (on garde session, on remplace profil)
          set({
            user: { ...user, ...fresh },
            loading: false,
            error: null
          })

          return { success: true }
        } catch (error) {
          console.error('Erreur completeOnboarding:', error)
          set({ error: error.message, loading: false })
          return { success: false, error: error.message }
        }
      },

      // Ajouter de l'XP
      addXP: async (xpAmount, reason = 'activity') => {
        try {
          const { user } = get()
          if (!user) return

          const newXP = (user.xp || 0) + xpAmount
          
          // Mettre à jour en base
          const { error } = await supabase
            .from('users')
            .update({ 
              xp: newXP,
              last_activity: new Date().toISOString()
            })
            .eq('id', user.id)

          if (error) throw error

          // Mettre à jour le store
          set({ user: { ...user, xp: newXP } })

          // Optionnel: notification de gain d'XP
          if (xpAmount > 0) {
            await supabase
              .from('notifications')
              .insert([{
                user_id: user.id,
                type: 'xp_gained',
                message: `Vous avez gagné ${xpAmount} XP pour ${reason}`,
                is_read: false
              }])
          }

          return { success: true, newXP, xpGained: xpAmount }
        } catch (error) {
          console.error('Erreur ajout XP:', error)
          return { success: false, error: error.message }
        }
      },

      // Confirmer l'email
      confirmEmail: async (token) => {
        try {
          set({ loading: true, error: null })
          const result = await authService.confirmEmail(token)
          set({ loading: false })
          return { success: true, data: result }
        } catch (error) {
          set({ error: error.message, loading: false })
          return { success: false, error: error.message }
        }
      },

      // Connexion OAuth
      signInWithOAuth: async (provider) => {
        try {
          set({ loading: true, error: null })
          const result = await authService.signInWithOAuth(provider)
          // La redirection se fera automatiquement
          return { success: true, data: result }
        } catch (error) {
          set({ error: error.message, loading: false })
          return { success: false, error: error.message }
        }
      }
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

// Hook personnalisé pour l'authentification
export const useAuth = () => {
  const store = useAuthStore()
  return {
    ...store,
    isAuthenticated: !!(store.user && store.session),
    isProfileComplete: !!(store.user?.username && store.user?.onboarding_completed),
  }
}
