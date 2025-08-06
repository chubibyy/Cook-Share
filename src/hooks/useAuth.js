// src/hooks/useAuth.js
import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../services/supabase'

export const useAuth = () => {
  const {
    user,
    session,
    loading,
    error,
    isInitialized,
    signIn,
    signUp,
    signOut,
    updateProfile,
    clearError
  } = useAuthStore()

  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    // Écouter les changements d'état d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN' && session) {
        // Utilisateur connecté
        useAuthStore.getState().setSession(session)
        useAuthStore.getState().setUser(session.user)
      } else if (event === 'SIGNED_OUT') {
        // Utilisateur déconnecté
        useAuthStore.getState().setSession(null)
        useAuthStore.getState().setUser(null)
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Token rafraîchi
        useAuthStore.getState().setSession(session)
      }
      
      setAuthLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Vérifier si l'utilisateur est connecté
  const isAuthenticated = !!user && !!session

  // Vérifier si l'utilisateur a complété son profil
  const isProfileComplete = user?.username && user?.bio

  return {
    user,
    session,
    loading: loading || authLoading,
    error,
    isInitialized,
    isAuthenticated,
    isProfileComplete,
    signIn,
    signUp,
    signOut,
    updateProfile,
    clearError
  }
}

