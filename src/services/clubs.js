
// src/services/clubs.js
import { supabase, supabaseHelpers } from './supabase'

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

  // Feed des sessions d'un club
  async getClubFeed(clubId, page = 0, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('club_sessions')
        .select(`
          created_at,
          session:cooking_sessions(*, user:users(username, avatar_url, xp))
        `)
        .eq('club_id', clubId)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1)

      if (error) throw error
      return (data || []).map((row) => ({ ...row.session }))
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

// Fonctions utilitaires déplacées dans helpers.js mais importées ici pour compatibilité
const formatTimeAgo = (timestamp) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInSeconds = Math.floor((now - time) / 1000)

  if (diffInSeconds < 60) return 'À l\'instant'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}j`
  
  return time.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short' 
  })
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