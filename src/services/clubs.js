
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
          sessions_count:club_sessions(count),
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

      const processedClubs = data?.map(club => {
        const sessionsCount = club.sessions_count?.[0]?.count || 0
        console.log('🏛️ [SERVICE] Club', club.name, '- Sessions count:', sessionsCount, 'Raw data:', club.sessions_count)
        
        return {
          ...club,
          membersCount: club.members_count?.[0]?.count || 0,
          sessionsCount,
          userMembership: club.user_membership?.[0] || null,
          recentMembers: club.recent_members?.slice(0, 3).map(m => m.user) || []
        }
      }) || []
      
      console.log('🏛️ [SERVICE] Processed clubs:', processedClubs.map(c => ({ name: c.name, sessionsCount: c.sessionsCount })))
      return processedClubs
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
    console.log('🔗 [SUPABASE] Création subscription pour club:', clubId)
    
    // Créer un channel unique avec timestamp pour éviter les conflits
    const channelName = `club_${clubId}_${Date.now()}`
    const channel = supabase.channel(channelName)
    
    console.log('📡 [SUPABASE] Channel créé:', channelName)
    
    channel
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'club_messages', 
        filter: `club_id=eq.${clubId}` 
      }, (payload) => {
        console.log('🔔 [SUPABASE] POSTGRES CHANGE DÉTECTÉ!')
        console.log('📨 [SUPABASE] Payload reçu:', JSON.stringify(payload, null, 2))
        console.log('🏷️ [SUPABASE] Club ID du message:', payload.new?.club_id)
        console.log('🔄 [SUPABASE] Déclenchement du callback...')
        callback(payload)
      })
      .subscribe((status, err) => {
        console.log('📡 [SUPABASE] Changement statut subscription:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ [SUPABASE] SUBSCRIPTION ACTIVE pour club:', clubId)
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ [SUPABASE] ERREUR CHANNEL:', err)
        } else if (status === 'TIMED_OUT') {
          console.error('⏰ [SUPABASE] TIMEOUT pour club:', clubId)
        } else if (status === 'CLOSED') {
          console.log('🔒 [SUPABASE] Channel fermé pour club:', clubId)
        }
      })
    
    return channel
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
           sessions_count:club_sessions(count),
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
      // Supprimer l'utilisateur des membres du club
      const { error } = await supabase
        .from('club_members')
        .delete()
        .eq('club_id', clubId)
        .eq('user_id', userId)

      if (error) throw error

      // Nettoyer aussi les anciennes demandes d'adhésion pour éviter les conflits
      await supabase
        .from('club_join_requests')
        .delete()
        .eq('club_id', clubId)
        .eq('user_id', userId)

      return true
    } catch (error) {
      console.error('Erreur quitter club:', error)
      throw error
    }
  },

  // Supprimer un club (owner seulement)
  async deleteClub(clubId, userId) {
    try {
      // Vérifier que l'utilisateur est bien propriétaire du club
      const { data: membership, error: membershipError } = await supabase
        .from('club_members')
        .select('role')
        .eq('club_id', clubId)
        .eq('user_id', userId)
        .single()

      if (membershipError) throw membershipError
      if (!membership || membership.role !== 'owner') {
        throw new Error('Vous devez être propriétaire du club pour le supprimer')
      }

      // Supprimer d'abord tous les membres du club
      const { error: membersError } = await supabase
        .from('club_members')
        .delete()
        .eq('club_id', clubId)

      if (membersError) throw membersError

      // Supprimer tous les messages du club
      const { error: messagesError } = await supabase
        .from('club_messages')
        .delete()
        .eq('club_id', clubId)

      if (messagesError) throw messagesError

      // Supprimer toutes les associations club-sessions
      const { error: sessionsError } = await supabase
        .from('club_sessions')
        .delete()
        .eq('club_id', clubId)

      if (sessionsError) throw sessionsError

      // Maintenant supprimer le club
      const { error } = await supabase
        .from('clubs')
        .delete()
        .eq('id', clubId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur suppression club:', error)
      throw error
    }
  },

  // Demander à rejoindre un club privé
  async requestToJoin(clubId, userId) {
    try {
      // Vérifier si une demande en attente existe déjà
      const { data: existingRequest, error: checkError } = await supabase
        .from('club_join_requests')
        .select('*')
        .eq('club_id', clubId)
        .eq('user_id', userId)
        .eq('status', 'pending')
        .single()

      if (checkError && checkError.code !== 'PGRST116') throw checkError
      
      if (existingRequest) {
        throw new Error('Vous avez déjà une demande en attente pour ce club')
      }

      // Créer la demande
      const { data, error } = await supabase
        .from('club_join_requests')
        .insert([{
          club_id: clubId,
          user_id: userId,
          status: 'pending',
          requested_at: new Date().toISOString()
        }])
        .select('*')

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Erreur demande adhésion:', error)
      throw error
    }
  },

  // Récupérer les demandes d'adhésion pour un club (propriétaire seulement)
  async getClubJoinRequests(clubId, userId) {
    try {
      // Vérifier que l'utilisateur est propriétaire
      const { data: membership, error: membershipError } = await supabase
        .from('club_members')
        .select('role')
        .eq('club_id', clubId)
        .eq('user_id', userId)
        .single()

      if (membershipError) throw membershipError
      if (!membership || membership.role !== 'owner') {
        throw new Error('Seul le propriétaire peut voir les demandes d\'adhésion')
      }

      // Récupérer les demandes en attente
      const { data, error } = await supabase
        .from('club_join_requests')
        .select(`
          *,
          user:users(id, username, avatar_url, xp)
        `)
        .eq('club_id', clubId)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur récupération demandes:', error)
      throw error
    }
  },

  // Approuver ou refuser une demande d'adhésion
  async handleJoinRequest(requestId, action, userId) {
    try {
      // Récupérer la demande avec les infos du club
      const { data: request, error: requestError } = await supabase
        .from('club_join_requests')
        .select(`
          *,
          club:clubs(*)
        `)
        .eq('id', requestId)
        .single()

      if (requestError) throw requestError

      // Vérifier que l'utilisateur est propriétaire du club
      const { data: membership, error: membershipError } = await supabase
        .from('club_members')
        .select('role')
        .eq('club_id', request.club_id)
        .eq('user_id', userId)
        .single()

      if (membershipError) throw membershipError
      if (!membership || membership.role !== 'owner') {
        throw new Error('Seul le propriétaire peut gérer les demandes')
      }

      if (action === 'approve') {
        // Ajouter l'utilisateur au club
        await supabase
          .from('club_members')
          .insert([{
            club_id: request.club_id,
            user_id: request.user_id,
            role: 'member'
          }])
      }

      // Mettre à jour le statut de la demande
      const { error: updateError } = await supabase
        .from('club_join_requests')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          responded_at: new Date().toISOString()
        })
        .eq('id', requestId)

      if (updateError) throw updateError
      return true
    } catch (error) {
      console.error('Erreur traitement demande:', error)
      throw error
    }
  },

  // Vérifier le statut d'une demande d'adhésion
  async getJoinRequestStatus(clubId, userId) {
    try {
      // Récupérer seulement les demandes en attente ou récemment refusées (moins de 24h)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      
      const { data, error } = await supabase
        .from('club_join_requests')
        .select('status, requested_at, responded_at')
        .eq('club_id', clubId)
        .eq('user_id', userId)
        .or(`status.eq.pending,and(status.eq.rejected,responded_at.gte.${oneDayAgo})`)
        .order('requested_at', { ascending: false })
        .limit(1)

      if (error && error.code !== 'PGRST116') throw error
      return data?.[0] || null
    } catch (error) {
      // Si la table n'existe pas, retourner null silencieusement
      if (error.code === '42P01') {
        console.warn('Table club_join_requests does not exist yet')
        return null
      }
      console.error('Erreur vérification statut demande:', error)
      throw error
    }
  },

  // Récupérer la liste des membres d'un club (propriétaire seulement)
  async getClubMembers(clubId, userId) {
    try {
      // Vérifier que l'utilisateur est propriétaire
      const { data: membership, error: membershipError } = await supabase
        .from('club_members')
        .select('role')
        .eq('club_id', clubId)
        .eq('user_id', userId)
        .single()

      if (membershipError) throw membershipError
      if (!membership || membership.role !== 'owner') {
        throw new Error('Seul le propriétaire peut voir la liste des membres')
      }

      // Récupérer tous les membres avec leurs infos
      const { data, error } = await supabase
        .from('club_members')
        .select(`
          *,
          user:users(id, username, avatar_url, xp, cooking_level, created_at)
        `)
        .eq('club_id', clubId)
        .order('joined_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur récupération membres:', error)
      throw error
    }
  },

  // Révoquer un membre (propriétaire seulement)
  async revokeMember(clubId, memberUserId, ownerUserId) {
    try {
      // Vérifier que l'utilisateur est propriétaire
      const { data: membership, error: membershipError } = await supabase
        .from('club_members')
        .select('role')
        .eq('club_id', clubId)
        .eq('user_id', ownerUserId)
        .single()

      if (membershipError) throw membershipError
      if (!membership || membership.role !== 'owner') {
        throw new Error('Seul le propriétaire peut révoquer des membres')
      }

      // Empêcher l'auto-révocation
      if (memberUserId === ownerUserId) {
        throw new Error('Vous ne pouvez pas vous révoquer vous-même')
      }

      // Supprimer le membre du club
      const { error } = await supabase
        .from('club_members')
        .delete()
        .eq('club_id', clubId)
        .eq('user_id', memberUserId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur révocation membre:', error)
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