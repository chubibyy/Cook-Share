// src/stores/userStore.js
import { create } from 'zustand'
import { supabase, supabaseHelpers } from '../services/supabase'
import { useAuthStore } from './authStore'


export const useUserStore = create((set, get) => ({
  // État
  users: {},
  currentUserProfile: null,
  followers: [],
  following: [],
  loading: false,
  error: null,

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Obtenir un profil utilisateur
  getUserProfile: async (userId) => {
    try {
      const { users } = get()
      
      // Si déjà en cache
      if (users[userId]) {
        return users[userId]
      }

      set({ loading: true, error: null })

      const profile = await supabaseHelpers.getUserProfile(userId)

      set({
        users: {
          ...users,
          [userId]: profile
        },
        loading: false
      })

      return profile
    } catch (error) {
      set({
        error: error.message,
        loading: false
      })
      throw error
    }
  },

  // Suivre/Ne plus suivre un utilisateur
  toggleFollow: async (targetUserId) => {
    try {
      const currentUser = useAuthStore.getState().user
      if (!currentUser) throw new Error('Utilisateur non connecté')

      const { isFollowing } = await supabaseHelpers.checkFollowStatus(
        currentUser.id, 
        targetUserId
      )

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('followers')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('followed_id', targetUserId)

        if (error) throw error
      } else {
        // Follow
        const { error } = await supabase
          .from('followers')
          .insert([{
            follower_id: currentUser.id,
            followed_id: targetUserId
          }])

        if (error) throw error
      }

      // Mettre à jour le cache
      const { users } = get()
      if (users[targetUserId]) {
        set({
          users: {
            ...users,
            [targetUserId]: {
              ...users[targetUserId],
              followers_count: users[targetUserId].followers_count + (isFollowing ? -1 : 1)
            }
          }
        })
      }

      return { success: true, isFollowing: !isFollowing }
    } catch (error) {
      console.error('Erreur toggle follow:', error)
      return { success: false, error: error.message }
    }
  },

  // Obtenir les followers d'un utilisateur
  getFollowers: async (userId) => {
    try {
      set({ loading: true, error: null })

      const { data, error } = await supabase
        .from('followers')
        .select(`
          follower:users!follower_id(*)
        `)
        .eq('followed_id', userId)

      if (error) throw error

      const followers = data?.map(item => item.follower) || []
      
      set({
        followers,
        loading: false
      })

      return followers
    } catch (error) {
      set({
        error: error.message,
        loading: false
      })
      throw error
    }
  },

  // Obtenir les utilisateurs suivis
  getFollowing: async (userId) => {
    try {
      set({ loading: true, error: null })

      const { data, error } = await supabase
        .from('followers')
        .select(`
          followed:users!followed_id(*)
        `)
        .eq('follower_id', userId)

      if (error) throw error

      const following = data?.map(item => item.followed) || []
      
      set({
        following,
        loading: false
      })

      return following
    } catch (error) {
      set({
        error: error.message,
        loading: false
      })
      throw error
    }
  },

  // Rechercher des utilisateurs
  searchUsers: async (query) => {
    try {
      if (!query.trim()) return []

      set({ loading: true, error: null })

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`username.ilike.%${query}%,bio.ilike.%${query}%`)
        .limit(20)

      if (error) throw error

      set({ loading: false })
      return data || []
    } catch (error) {
      set({
        error: error.message,
        loading: false
      })
      return []
    }
  },

  // Obtenir les sessions d'un utilisateur
  getUserSessions: async (userId, page = 0, limit = 10) => {
    try {
      const { data, error } = await supabase
        .from('cooking_sessions')
        .select(`
          *,
          user:users(*),
          likes:likes(count),
          comments:comments(count)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1)

      if (error) throw error

      return data?.map(session => ({
        ...session,
        likesCount: session.likes?.[0]?.count || 0,
        commentsCount: session.comments?.[0]?.count || 0,
        timeAgo: formatTimeAgo(session.created_at)
      })) || []
    } catch (error) {
      console.error('Erreur sessions utilisateur:', error)
      throw error
    }
  },

  // Obtenir les sessions sauvegardées d'un utilisateur
  getSavedSessions: async (userId, page = 0, limit = 10) => {
    try {
      const { data, error } = await supabase
        .from('saved_sessions')
        .select(`
          session:cooking_sessions(
            *,
            user:users(*),
            likes:likes(count),
            comments:comments(count)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1)

      if (error) throw error

      return data?.map(item => ({
        ...item.session,
        likesCount: item.session.likes?.[0]?.count || 0,
        commentsCount: item.session.comments?.[0]?.count || 0,
        timeAgo: formatTimeAgo(item.session.created_at),
        isSaved: true
      })) || []
    } catch (error) {
      console.error('Erreur sessions sauvegardées:', error)
      throw error
    }
  }
}))

