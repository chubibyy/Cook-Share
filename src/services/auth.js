// src/services/auth.js - Service d'authentification complet
import { supabase } from './supabase'

export const authService = {
  // Inscription avec email/password
  async signUp(email, password, metadata = {}) {
    try {
      // 1. Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...metadata,
            email_confirm: false
          }
        }
      })
      
      if (authError) throw authError

      // 2. Si l'utilisateur est créé, créer son profil dans la table users
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            email: email,
            username: metadata.username || email.split('@')[0],
            bio: metadata.bio || '',
            avatar_url: null,
            cook_frequency: null,
            cook_constraints: [],
            xp: 0,
            is_private: false,
            onboarding_completed: false,
            created_at: new Date().toISOString(),
            last_seen: new Date().toISOString()
          }])

        if (profileError) {
          console.warn('Erreur création profil:', profileError)
          // On continue même si le profil n'est pas créé
        }
      }

      return {
        user: authData.user,
        session: authData.session,
        needsEmailConfirmation: !authData.session
      }
    } catch (error) {
      console.error('Erreur inscription:', error)
      throw this.handleAuthError(error)
    }
  },

  // Connexion avec email/password
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error

      // Mettre à jour last_seen
      if (data.user) {
        await supabase
          .from('users')
          .update({ last_seen: new Date().toISOString() })
          .eq('id', data.user.id)
      }

      return {
        user: data.user,
        session: data.session
      }
    } catch (error) {
      console.error('Erreur connexion:', error)
      throw this.handleAuthError(error)
    }
  },

  // Déconnexion
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur déconnexion:', error)
      throw error
    }
  },

  // Récupération mot de passe
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur reset password:', error)
      throw this.handleAuthError(error)
    }
  },

  // Mise à jour du mot de passe
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur update password:', error)
      throw this.handleAuthError(error)
    }
  },

  // Récupération de la session actuelle
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error('Erreur récupération session:', error)
      return null
    }
  },

  // Récupération de l'utilisateur actuel
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error)
      return null
    }
  },

  // Écouter les changements d'authentification
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Confirmer l'email (après inscription)
  async confirmEmail(token) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token,
        type: 'signup'
      })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur confirmation email:', error)
      throw this.handleAuthError(error)
    }
  },

  // Renvoyer email de confirmation
  async resendConfirmation(email) {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      })
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur renvoi confirmation:', error)
      throw this.handleAuthError(error)
    }
  },

  // Connexion avec fournisseur OAuth (Google, Apple, etc.)
  async signInWithOAuth(provider) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error(`Erreur connexion ${provider}:`, error)
      throw this.handleAuthError(error)
    }
  },

  // Gestion des erreurs d'authentification
  handleAuthError(error) {
    const errorMessages = {
      'Invalid login credentials': 'Email ou mot de passe incorrect',
      'Email not confirmed': 'Veuillez confirmer votre email avant de vous connecter',
      'User not found': 'Aucun compte associé à cet email',
      'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
      'User already registered': 'Un compte existe déjà avec cet email',
      'Invalid email': 'Format d\'email invalide',
      'Signup disabled': 'Les inscriptions sont temporairement désactivées',
      'Email rate limit exceeded': 'Trop de tentatives, veuillez patienter',
      'Password too weak': 'Mot de passe trop faible',
    }

    const message = errorMessages[error.message] || error.message || 'Une erreur est survenue'
    
    return new Error(message)
  }
}

