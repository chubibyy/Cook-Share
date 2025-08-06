// src/services/supabase.js
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Configuration Supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

// Créer le client Supabase avec configuration optimisée pour React Native
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: AsyncStorage,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Helper functions pour les requêtes communes
export const supabaseHelpers = {
  // Upload d'image générique avec types (VERSION INTÉGRÉE)
  async uploadImage(file, type = 'session', userId = null, additionalPath = '') {
    try {
      const fileExt = file.name?.split('.').pop() || 'jpg'
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2)
      
      let filePath
      
      switch (type) {
        case 'avatar':
          // Avatars utilisateurs : avatars/user-123.jpg
          filePath = `avatars/${userId || 'anonymous'}-${timestamp}.${fileExt}`
          break
          
        case 'session':
          // Sessions culinaires : sessions/user-123/session-456.jpg
          filePath = `sessions/${userId}/${timestamp}-${randomId}.${fileExt}`
          break
          
        case 'club-avatar':
          // Avatars de clubs : clubs/club-123-avatar.jpg
          filePath = `clubs/${additionalPath}-avatar-${timestamp}.${fileExt}`
          break
          
        case 'club-cover':
          // Couvertures de clubs : clubs/club-123-cover.jpg
          filePath = `clubs/${additionalPath}-cover-${timestamp}.${fileExt}`
          break
          
        case 'challenge':
          // Images de challenges : challenges/challenge-123.jpg
          filePath = `challenges/${additionalPath || 'challenge'}-${timestamp}.${fileExt}`
          break
          
        default:
          // Fallback pour ancien code - compatibilité
          const fileName = `${timestamp}-${randomId}.${fileExt}`
          filePath = additionalPath ? `${additionalPath}/${fileName}` : fileName
      }

      // Upload vers le bucket principal
      const { data, error } = await supabase.storage
        .from('cooking-sessions')  // Un seul bucket pour tout
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: type === 'avatar', // Remplacer l'avatar existant
          contentType: file.type || 'image/jpeg'
        })

      if (error) throw error

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('cooking-sessions')
        .getPublicUrl(data.path)

      return { 
        url: publicUrl, 
        path: data.path,
        type,
        fileName: filePath
      }
    } catch (error) {
      console.error('Erreur upload image:', error)
      throw error
    }
  },

  // Upload spécifique avatar utilisateur
  async uploadAvatar(file, userId) {
    // Supprimer l'ancien avatar d'abord
    await this.deleteOldAvatar(userId)
    
    return this.uploadImage(file, 'avatar', userId)
  },

  // Upload spécifique session culinaire  
  async uploadSessionImage(file, userId) {
    return this.uploadImage(file, 'session', userId)
  },

  // Upload spécifique club
  async uploadClubImage(file, clubId, imageType = 'avatar') {
    return this.uploadImage(file, `club-${imageType}`, null, clubId)
  },

  // Upload spécifique challenge
  async uploadChallengeImage(file, challengeId) {
    return this.uploadImage(file, 'challenge', null, challengeId)
  },

  // Supprimer ancien avatar
  async deleteOldAvatar(userId) {
    try {
      // Lister les fichiers avatars de l'utilisateur
      const { data: files } = await supabase.storage
        .from('cooking-sessions')
        .list('avatars', {
          search: userId
        })
      
      if (files?.length > 0) {
        const filesToDelete = files.map(file => `avatars/${file.name}`)
        await supabase.storage
          .from('cooking-sessions')
          .remove(filesToDelete)
      }
    } catch (error) {
      console.error('Erreur suppression ancien avatar:', error)
      // Ne pas faire échouer l'upload pour ça
    }
  },

  // Supprimer une image par path
  async deleteImage(path) {
    try {
      const { error } = await supabase.storage
        .from('cooking-sessions')
        .remove([path])
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur suppression image:', error)
      throw error
    }
  },

  // Obtenir l'URL d'un avatar par userId
  getAvatarUrl(userId, timestamp = Date.now()) {
    // URL avec cache busting pour forcer le refresh
    const { data: { publicUrl } } = supabase.storage
      .from('cooking-sessions')
      .getPublicUrl(`avatars/${userId}-${timestamp}.jpg`)
    return publicUrl
  },

  // Obtenir toutes les images d'un utilisateur
  async getUserImages(userId, type = 'session') {
    try {
      const folder = type === 'session' ? `sessions/${userId}` : `avatars`
      
      const { data: files, error } = await supabase.storage
        .from('cooking-sessions')
        .list(folder, {
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (error) throw error

      return files?.map(file => ({
        name: file.name,
        path: `${folder}/${file.name}`,
        url: supabase.storage
          .from('cooking-sessions')
          .getPublicUrl(`${folder}/${file.name}`).data.publicUrl,
        size: file.metadata?.size,
        createdAt: file.created_at
      })) || []
    } catch (error) {
      console.error('Erreur récupération images utilisateur:', error)
      return []
    }
  },

  // Obtenir le profil utilisateur complet avec stats
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          sessions_count:cooking_sessions(count),
          followers_count:followers!followed_id(count),
          following_count:followers!follower_id(count),
          challenges_completed:challenge_participants!inner(
            count,
            challenges!inner(*)
          )
        `)
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur profil utilisateur:', error)
      throw error
    }
  },

  // Vérifier si l'utilisateur suit un autre utilisateur
  async checkFollowStatus(followerId, followedId) {
    try {
      const { data, error } = await supabase
        .from('followers')
        .select('id')
        .eq('follower_id', followerId)
        .eq('followed_id', followedId)
        .single()

      return { isFollowing: !!data, error }
    } catch (error) {
      return { isFollowing: false, error }
    }
  }
}

// src/services/auth.js
import { supabase } from './supabase'

export const authService = {
  // Connexion avec email/password
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur connexion:', error)
      throw error
    }
  },

  // Inscription
  async signUp(email, password, metadata = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur inscription:', error)
      throw error
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
        redirectTo: 'plateup://reset-password',
      })
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur reset password:', error)
      throw error
    }
  },

  // Obtenir la session actuelle
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error('Erreur session:', error)
      throw error
    }
  },

  // Écouter les changements d'authentification
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

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

// src/services/challenges.js
import { supabase } from './supabase'
import { calculateTimeLeft } from '../utils/helpers'

export const challengesService = {
  // Récupérer les challenges avec statut utilisateur
  async getChallenges(status = 'all', userId = null) {
    try {
      let query = supabase
        .from('challenges')
        .select(`
          *,
          participants:challenge_participants(count),
          user_participation:challenge_participants(*)
        `)
        .order('created_at', { ascending: false })

      // Filtrer par statut
      const now = new Date().toISOString()
      switch (status) {
        case 'active':
          query = query.gte('end_date', now)
          break
        case 'past':
          query = query.lt('end_date', now)
          break
      }

      // Si utilisateur connecté, récupérer sa participation
      if (userId) {
        query = query.eq('user_participation.user_id', userId)
      }

      const { data, error } = await query
      if (error) throw error

      return data?.map(challenge => ({
        ...challenge,
        participantsCount: challenge.participants?.[0]?.count || 0,
        userParticipation: challenge.user_participation?.[0] || null,
        isActive: new Date(challenge.end_date) > new Date(),
        timeLeft: calculateTimeLeft(challenge.end_date)
      })) || []
    } catch (error) {
      console.error('Erreur récupération challenges:', error)
      throw error
    }
  },

  // Participer à un challenge
  async participateInChallenge(challengeId, userId) {
    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .insert([{
          challenge_id: challengeId,
          user_id: userId,
          status: 'en_cours'
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur participation challenge:', error)
      throw error
    }
  },

  // Soumettre une session pour un challenge
  async submitChallengeSession(challengeId, userId, sessionId) {
    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .update({
          session_id: sessionId,
          status: 'reussi'
        })
        .eq('challenge_id', challengeId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      // Ajouter l'XP au profil utilisateur
      const challenge = await supabase
        .from('challenges')
        .select('reward_xp')
        .eq('id', challengeId)
        .single()

      if (challenge.data) {
        await supabase.rpc('add_user_xp', {
          user_id: userId,
          xp_amount: challenge.data.reward_xp
        })
      }

      return data
    } catch (error) {
      console.error('Erreur soumission challenge:', error)
      throw error
    }
  }
}

// src/services/clubs.js
import { supabase } from './supabase'

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