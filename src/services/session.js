// src/services/sessions.js
import { supabase } from './supabase'
import { formatTimeAgo } from '../utils/helpers'

export const sessionsService = {
  // Récupérer le feed principal avec pagination
  async getFeed(page = 0, limit = 10, userId = null) {
    try {
      // Base query for sessions with user info
      let query = supabase
        .from('cooking_sessions')
        .select(`
          *,
          user:users(username, avatar_url, cooking_level)
        `)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1)

      const { data: sessions, error } = await query

      if (error) throw error

      if (!sessions) return []

      // Get session IDs for counting interactions
      const sessionIds = sessions.map(s => s.id)

      // Count likes for all sessions
      const { data: likeCounts } = await supabase
        .from('likes')
        .select('session_id')
        .in('session_id', sessionIds)

      // Count comments for all sessions  
      const { data: commentCounts } = await supabase
        .from('comments')
        .select('session_id')
        .in('session_id', sessionIds)

      // Create count maps
      const likeCountMap = {}
      const commentCountMap = {}

      likeCounts?.forEach(like => {
        likeCountMap[like.session_id] = (likeCountMap[like.session_id] || 0) + 1
      })

      commentCounts?.forEach(comment => {
        commentCountMap[comment.session_id] = (commentCountMap[comment.session_id] || 0) + 1
      })

      // If user is provided, get their specific interactions
      let userLikes = []
      let userSaves = []

      if (userId) {
        const sessionIds = sessions.map(s => s.id)
        
        // Get user's likes for these sessions
        const { data: likesData } = await supabase
          .from('likes')
          .select('session_id')
          .eq('user_id', userId)
          .in('session_id', sessionIds)
        
        userLikes = likesData?.map(l => l.session_id) || []

        // Get user's saves for these sessions
        const { data: savesData } = await supabase
          .from('saved_sessions')
          .select('session_id')
          .eq('user_id', userId)
          .in('session_id', sessionIds)
        
        userSaves = savesData?.map(s => s.session_id) || []
      }

      return sessions.map(session => ({
        id: session.id,
        user_id: session.user_id,
        club_id: session.club_id,
        title: session.title,
        photo_url: session.photo_url,
        ingredients: session.ingredients,
        duration: session.duration,
        cuisine_type: session.cuisine_type,
        difficulty: session.difficulty,
        tags: session.tags,
        created_at: session.created_at,
        user: {
          username: session.user?.username,
          avatar_url: session.user?.avatar_url,
          cooking_level: session.user?.cooking_level
        },
        likesCount: likeCountMap[session.id] || 0,
        commentsCount: commentCountMap[session.id] || 0,
        isLiked: userLikes.includes(session.id),
        isSaved: userSaves.includes(session.id),
        timeAgo: formatTimeAgo(session.created_at)
      }))
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
      // Get session with user info
      const { data: session, error } = await supabase
        .from('cooking_sessions')
        .select(`
          *,
          user:users(username, avatar_url, cooking_level)
        `)
        .eq('id', sessionId)
        .single()

      if (error) throw error

      // Count likes for this session
      const { count: likesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId)

      // Fetch comments separately
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select(`*, user:users(*)`)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (commentsError) {
        console.error('Error fetching comments:', commentsError)
      }

      // Check user-specific interactions if userId provided
      let isLiked = false
      let isSaved = false

      if (userId) {
        // Check if user liked this session
        const { data: likeData } = await supabase
          .from('likes')
          .select('id')
          .eq('session_id', sessionId)
          .eq('user_id', userId)
          .single()
        
        isLiked = !!likeData

        // Check if user saved this session
        const { data: saveData } = await supabase
          .from('saved_sessions')
          .select('id')
          .eq('session_id', sessionId)
          .eq('user_id', userId)
          .single()
        
        isSaved = !!saveData
      }

      return {
        id: session.id,
        user_id: session.user_id,
        club_id: session.club_id,
        title: session.title,
        photo_url: session.photo_url,
        ingredients: session.ingredients,
        duration: session.duration,
        cuisine_type: session.cuisine_type,
        difficulty: session.difficulty,
        tags: session.tags,
        created_at: session.created_at,
        user: {
          username: session.user?.username,
          avatar_url: session.user?.avatar_url,
          cooking_level: session.user?.cooking_level
        },
        likesCount: likesCount || 0,
        commentsCount: comments?.length || 0,
        isLiked,
        isSaved,
        comments: comments || [],
        timeAgo: formatTimeAgo(session.created_at)
      }
    } catch (error) {
      console.error('Erreur récupération session:', error)
      throw error
    }
  },

  // Liker/Unliker une session
  async toggleLike(sessionId, userId) {
    try {
      const { data, error } = await supabase.rpc('toggle_like', { 
        p_session_id: sessionId, 
        p_user_id: userId 
      })
      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur toggle like:', error)
      throw error
    }
  },

  // Sauvegarder/Unsauvegarder une session
  async toggleSave(sessionId, userId) {
    try {
      const { data, error } = await supabase.rpc('toggle_save', { 
        p_session_id: sessionId, 
        p_user_id: userId 
      })
      if (error) throw error
      return data
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
  },

  // Supprimer un commentaire
  async deleteComment(commentId, userId) {
    try {
      // Vérifier que l'utilisateur est le propriétaire du commentaire
      const { data: comment, error: fetchError } = await supabase
        .from('comments')
        .select('user_id')
        .eq('id', commentId)
        .single()

      if (fetchError) throw fetchError

      if (comment.user_id !== userId) {
        throw new Error('Vous ne pouvez supprimer que vos propres commentaires')
      }

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error
      
      return { success: true }
    } catch (error) {
      console.error('Erreur suppression commentaire:', error)
      throw error
    }
  }
}