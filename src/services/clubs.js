
// src/services/clubs.js
import { supabase, supabaseHelpers } from './supabase'
import { formatTimeAgo } from '../utils/helpers'

export const clubsService = {
  // Récupérer les clubs avec statut utilisateur
  async getClubs(userId = null) {
    try {
      let query = supabase
        .from('clubs')
        .select(`
          *,
          members_count:club_members(count),
          sessions_count:cooking_sessions(count),
          user_membership:club_members(*),
          recent_members:club_members(
            user:users(id, username, avatar_url)
          )
        `)
        .order('created_at', { ascending: false })

      // Si utilisateur connecté, récupérer son membership
      if (userId) {
        query = query.eq('user_membership.user_id', userId)
      }

      const { data, error } = await query
      if (error) throw error

      return data?.map(club => ({
        ...club,
        membersCount: club.members_count?.[0]?.count || 0,
        sessionsCount: club.sessions_count?.[0]?.count || 0,
        userMembership: club.user_membership?.[0] || null,
        recentMembers: club.recent_members?.slice(0, 3).map(m => m.user) || []
      })) || []
    } catch (error) {
      console.error('Erreur récupération clubs:', error)
      throw error
    }
  },

  // Chat / forum de club
  async getClubMessages(clubId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('club_messages')
        .select('*, user:users(*)')
        .eq('club_id', clubId)
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Erreur getClubMessages:', err)
      throw err
    }
  },

  async sendClubMessage(clubId, userId, content) {
    try {
      const { data, error } = await supabase
        .from('club_messages')
        .insert([{ club_id: clubId, user_id: userId, content }])
        .select('*, user:users(*)')
        .single()
      if (error) throw error
      return data
    } catch (err) {
      console.error('Erreur sendClubMessage:', err)
      throw err
    }
  },

  subscribeToClubMessages(clubId, callback) {
    return supabase
      .channel(`club_messages_${clubId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'club_messages', filter: `club_id=eq.${clubId}` }, callback)
      .subscribe()
  },

  // Créer un club
  async createClub({ name, description = '', is_private = false, avatar = null }, userId) {
    try {
      // 1) Créer le club (sans avatar)
      const { data: club, error } = await supabase
        .from('clubs')
        .insert([
          {
            name,
            description,
            is_private,
            created_by: userId,
          },
        ])
        .select('*')
        .single()

      if (error) throw error

      // 2) Uploader l'avatar si fourni
      let avatar_url = null
      if (avatar) {
        const upload = await supabaseHelpers.uploadClubImage(avatar, club.id, 'avatar')
        avatar_url = upload?.url || null
        if (avatar_url) {
          await supabase.from('clubs').update({ avatar_url }).eq('id', club.id)
        }
      }

      // 3) Ajouter le créateur comme membre (owner)
      await supabase
        .from('club_members')
        .insert([{ club_id: club.id, user_id: userId, role: 'owner' }])

      return { ...club, avatar_url }
    } catch (err) {
      console.error('Erreur createClub:', err)
      throw err
    }
  },

  // Mettre à jour un club (réservé admin)
  async updateClub(clubId, { name, description, is_private, avatar = null }) {
    try {
      const updates = { }
      if (typeof name === 'string') updates.name = name
      if (typeof description === 'string') updates.description = description
      if (typeof is_private === 'boolean') updates.is_private = is_private

      if (avatar) {
        const upload = await supabaseHelpers.uploadClubImage(avatar, clubId, 'avatar')
        if (upload?.url) updates.avatar_url = upload.url
      }

      const { data, error } = await supabase
        .from('clubs')
        .update(updates)
        .eq('id', clubId)
        .select('*')
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Erreur updateClub:', err)
      throw err
    }
  },

  // Détails d'un club + stats
  async getClubById(clubId, userId = null) {
    try {
      let query = supabase
        .from('clubs')
        .select(
          `*,
           members:club_members(*, user:users(*)),
           sessions_count:cooking_sessions(count),
           user_membership:club_members(*)
          `
        )
        .eq('id', clubId)
        .maybeSingle()

      if (userId) query = query.eq('user_membership.user_id', userId)

      const { data, error } = await query
      if (error) throw error
      if (!data) return null
      return {
        ...data,
        membersCount: data.members?.length || 0,
        sessionsCount: data.sessions_count?.[0]?.count || 0,
        userMembership: data.user_membership?.[0] || null,
      }
    } catch (err) {
      console.error('Erreur getClubById:', err)
      throw err
    }
  },

  // Feed des sessions d'un club avec interactions
  async getClubFeed(clubId, page = 0, limit = 10, userId = null) {
    try {
      // D'abord récupérer les sessions du club
      const { data: clubSessions, error: clubError } = await supabase
        .from('club_sessions')
        .select(`
          session_id,
          created_at
        `)
        .eq('club_id', clubId)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1)

      if (clubError) throw clubError
      if (!clubSessions || clubSessions.length === 0) return []

      const sessionIds = clubSessions.map(cs => cs.session_id)

      // Récupérer les sessions avec les données complètes
      const { data: sessions, error: sessionError } = await supabase
        .from('cooking_sessions')
        .select(`
          *,
          user:users(username, avatar_url, cooking_level)
        `)
        .in('id', sessionIds)

      if (sessionError) throw sessionError
      if (!sessions) return []

      // Compter les likes et commentaires
      const { data: likeCounts } = await supabase
        .from('likes')
        .select('session_id')
        .in('session_id', sessionIds)

      const { data: commentCounts } = await supabase
        .from('comments')
        .select('session_id')
        .in('session_id', sessionIds)

      // Créer les maps de comptage
      const likeCountMap = {}
      const commentCountMap = {}

      likeCounts?.forEach(like => {
        likeCountMap[like.session_id] = (likeCountMap[like.session_id] || 0) + 1
      })

      commentCounts?.forEach(comment => {
        commentCountMap[comment.session_id] = (commentCountMap[comment.session_id] || 0) + 1
      })

      // Si userId fourni, récupérer les interactions utilisateur
      let userLikes = []
      let userSaves = []

      if (userId) {
        const { data: likesData } = await supabase
          .from('likes')
          .select('session_id')
          .eq('user_id', userId)
          .in('session_id', sessionIds)
        
        userLikes = likesData?.map(l => l.session_id) || []

        const { data: savesData } = await supabase
          .from('saved_sessions')
          .select('session_id')
          .eq('user_id', userId)
          .in('session_id', sessionIds)
        
        userSaves = savesData?.map(s => s.session_id) || []
      }

      // Assembler les données finales avec l'ordre original
      const sessionMap = {}
      sessions.forEach(session => {
        sessionMap[session.id] = {
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
        }
      })

      // Retourner dans l'ordre du club
      return clubSessions.map(cs => sessionMap[cs.session_id]).filter(Boolean)
    } catch (err) {
      console.error('Erreur getClubFeed:', err)
      throw err
    }
  },

  // Attacher une session à plusieurs clubs
  async attachSessionToClubs(sessionId, clubIds = []) {
    try {
      if (!clubIds.length) return []
      const rows = clubIds.map((club_id) => ({ club_id, session_id: sessionId }))
      const { data, error } = await supabase.from('club_sessions').insert(rows).select('*')
      if (error && error.code !== '23505') throw error
      return data || []
    } catch (err) {
      console.error('Erreur attachSessionToClubs:', err)
      throw err
    }
  },

  // Rejoindre un club
  async joinClub(clubId, userId) {
    try {
      const { data, error } = await supabase
        .from('club_members')
        .insert([{
          club_id: clubId,
          user_id: userId,
          role: 'member'
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur rejoindre club:', error)
      throw error
    }
  },

  // Quitter un club
  async leaveClub(clubId, userId) {
    try {
      const { error } = await supabase
        .from('club_members')
        .delete()
        .eq('club_id', clubId)
        .eq('user_id', userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur quitter club:', error)
      throw error
    }
  }
}

const calculateTimeLeft = (endDate) => {
  const end = new Date(endDate)
  const now = new Date()
  const diffTime = end - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays <= 0) return 'Terminé'
  if (diffDays === 1) return '1 jour'
  if (diffDays < 7) return `${diffDays} jours`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} sem.`
  return `${Math.ceil(diffDays / 30)} mois`
}