// src/services/sessions.js
import { supabase } from './supabase'
import { formatTimeAgo } from '../utils/helpers'

export const sessionsService = {
  // Récupérer le feed principal avec pagination
  async getFeed(page = 0, limit = 10, userId = null) {
    try {
      let query = supabase
        .from('cooking_sessions')
        .select(`
          *,
          user:users(*),
          likes:likes(count),
          comments:comments(count),
          user_like:likes(id),
          user_saved:saved_sessions(id)
        `)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1)

      // Si utilisateur connecté, récupérer ses interactions
      if (userId) {
        query = query
          .eq('user_like.user_id', userId)
          .eq('user_saved.user_id', userId)
      }

      const { data, error } = await query

      if (error) throw error

      // Formatter les données pour l'affichage
      return data?.map(session => ({
        ...session,
        likesCount: session.likes?.[0]?.count || 0,
        commentsCount: session.comments?.[0]?.count || 0,
        isLiked: !!session.user_like?.[0],
        isSaved: !!session.user_saved?.[0],
        timeAgo: formatTimeAgo(session.created_at)
      })) || []
    } catch (error) {
      console.error('Erreur récupération feed:', error)
      throw error
    }
  },

  // Créer une nouvelle session culinaire
  async createSession(sessionData) {
    try {
      const { data, error } = await supabase
        .from('cooking_sessions')
        .insert([sessionData])
        .select(`
          *,
          user:users(*)
        `)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur création session:', error)
      throw error
    }
  },

  // Obtenir une session par ID
  async getSessionById(sessionId, userId = null) {
    try {
      let query = supabase
        .from('cooking_sessions')
        .select(`
          *,
          user:users(*),
          likes:likes(count),
          comments:comments(
            *,
            user:users(*)
          ),
          user_like:likes(id),
          user_saved:saved_sessions(id)
        `)
        .eq('id', sessionId)

      if (userId) {
        query = query
          .eq('user_like.user_id', userId)
          .eq('user_saved.user_id', userId)
      }

      const { data, error } = await query.single()
      if (error) throw error

      return {
        ...data,
        likesCount: data.likes?.[0]?.count || 0,
        isLiked: !!data.user_like?.[0],
        isSaved: !!data.user_saved?.[0],
        timeAgo: formatTimeAgo(data.created_at)
      }
    } catch (error) {
      console.error('Erreur récupération session:', error)
      throw error
    }
  },

  // Liker/Unliker une session
  async toggleLike(sessionId, userId) {
    try {
      // Vérifier si déjà liké
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .single()

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('session_id', sessionId)
          .eq('user_id', userId)
        
        if (error) throw error
        return { liked: false }
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert([{ session_id: sessionId, user_id: userId }])
        
        if (error) throw error
        return { liked: true }
      }
    } catch (error) {
      console.error('Erreur toggle like:', error)
      throw error
    }
  },

  // Sauvegarder/Unsauvegarder une session
  async toggleSave(sessionId, userId) {
    try {
      const { data: existingSave } = await supabase
        .from('saved_sessions')
        .select('id')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .single()

      if (existingSave) {
        const { error } = await supabase
          .from('saved_sessions')
          .delete()
          .eq('session_id', sessionId)
          .eq('user_id', userId)
        
        if (error) throw error
        return { saved: false }
      } else {
        const { error } = await supabase
          .from('saved_sessions')
          .insert([{ session_id: sessionId, user_id: userId }])
        
        if (error) throw error
        return { saved: true }
      }
    } catch (error) {
      console.error('Erreur toggle save:', error)
      throw error
    }
  },

  // Ajouter un commentaire
  async addComment(sessionId, userId, content, parentId = null) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          session_id: sessionId,
          user_id: userId,
          content,
          parent_id: parentId
        }])
        .select(`
          *,
          user:users(*)
        `)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur ajout commentaire:', error)
      throw error
    }
  }
}