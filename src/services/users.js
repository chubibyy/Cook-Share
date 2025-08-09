// src/services/users.js
import { supabase } from './supabase'

export const usersService = {
  // Obtenir le profil d'un utilisateur par ID
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          sessions_count:cooking_sessions(count),
          followers_count:followers!followed_id(count),
          following_count:followers!follower_id(count),
          clubs_count:club_members(count)
        `)
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur récupération profil utilisateur:', error)
      throw error
    }
  },

  // Mettre à jour le profil d'un utilisateur
  async updateUserProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur mise à jour profil:', error)
      throw error
    }
  },

  // Rechercher des utilisateurs
  async searchUsers(query, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, avatar_url, bio')
        .ilike('username', `%${query}%`)
        .limit(limit)

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur recherche utilisateurs:', error)
      throw error
    }
  },

  // Suivre un utilisateur
  async followUser(followerId, followedId) {
    try {
      if (followerId === followedId) throw new Error('Vous ne pouvez pas vous suivre vous-même')

      const { data, error } = await supabase
        .from('followers')
        .insert([{ follower_id: followerId, followed_id: followedId }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur suivi utilisateur:', error)
      throw error
    }
  },

  // Ne plus suivre un utilisateur
  async unfollowUser(followerId, followedId) {
    try {
      const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', followerId)
        .eq('followed_id', followedId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Erreur unfollow utilisateur:', error)
      throw error
    }
  },

  // Vérifier si un utilisateur en suit un autre
  async checkFollowing(followerId, followedId) {
    try {
      const { data, error } = await supabase
        .from('followers')
        .select('id')
        .eq('follower_id', followerId)
        .eq('followed_id', followedId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      
      return !!data
    } catch (error) {
      console.error('Erreur vérification suivi:', error)
      throw error
    }
  },

  // Obtenir la liste des abonnés (followers)
  async getFollowers(userId) {
    try {
      const { data, error } = await supabase
        .from('followers')
        .select('user:follower_id(*)')
        .eq('followed_id', userId)

      if (error) throw error
      return data?.map(item => item.user) || []
    } catch (error) {
      console.error('Erreur récupération abonnés:', error)
      throw error
    }
  },

  // Obtenir la liste des abonnements (following)
  async getFollowing(userId) {
    try {
      const { data, error } = await supabase
        .from('followers')
        .select('user:followed_id(*)')
        .eq('follower_id', userId)

      if (error) throw error
      return data?.map(item => item.user) || []
    } catch (error) {
      console.error('Erreur récupération abonnements:', error)
      throw error
    }
  },

  // Obtenir les badges d'un utilisateur
  async getUserBadges(userId) {
    try {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('user_badges')
        .select('id, earned_at, badge_image_url, challenge:challenges(title)')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erreur récupération badges utilisateur:', error);
      throw error;
    }
  }
}