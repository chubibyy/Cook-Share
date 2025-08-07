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
        .from('plate-up')  // Un seul bucket pour tout
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: type === 'avatar', // Remplacer l'avatar existant
          contentType: file.type || 'image/jpeg'
        })

      if (error) throw error

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('plate-up')
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
        .from('plate-up')
        .list('avatars', {
          search: userId
        })
      
      if (files?.length > 0) {
        const filesToDelete = files.map(file => `avatars/${file.name}`)
        await supabase.storage
          .from('plate-up')
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
        .from('plate-up')
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
      .from('plate-up')
      .getPublicUrl(`avatars/${userId}-${timestamp}.jpg`)
    return publicUrl
  },

  // Obtenir toutes les images d'un utilisateur
  async getUserImages(userId, type = 'session') {
    try {
      const folder = type === 'session' ? `sessions/${userId}` : `avatars`
      
      const { data: files, error } = await supabase.storage
        .from('plate-up')
        .list(folder, {
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (error) throw error

      return files?.map(file => ({
        name: file.name,
        path: `${folder}/${file.name}`,
        url: supabase.storage
          .from('plate-up')
          .getPublicUrl(`${folder}/${file.name}`).data.publicUrl,
        size: file.metadata?.size,
        createdAt: file.created_at
      })) || []
    } catch (error) {
      console.error('Erreur récupération images utilisateur:', error)
      return []
    }
  },

  // Créer un profil utilisateur s'il n'existe pas
  async ensureUserProfile(user) {
    try {
      if (!user?.id) return null

      // Vérifier si un profil existe déjà
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (error) throw error

      // Insérer le profil par défaut s'il n'existe pas
      if (!data) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            username: user.email?.split('@')[0] || 'user',
            bio: '',
            avatar_url: null,
            cook_frequency: null,
            cook_constraints: [],
            xp: 0,
            is_private: false,
            created_at: new Date().toISOString(),
            last_seen: new Date().toISOString()
          })

        if (insertError) throw insertError
      }

      // Retourner le profil complet avec statistiques
      return await this.getUserProfile(user.id)
    } catch (err) {
      console.error('Erreur ensureUserProfile:', err)
      return null
    }
  },

  // Obtenir le profil utilisateur complet avec stats
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        // Explicit FK reference to avoid ambiguous join on challenge_participants
        .select(`
          *,
          sessions_count:cooking_sessions(count),
          followers_count:followers!followed_id(count),
          following_count:followers!follower_id(count),
          challenges_completed:challenge_participants!user_id(count)
        `)
        .eq('id', userId)
        .maybeSingle()

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