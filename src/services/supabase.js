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
          filePath = `avatars/${userId || 'anonymous'}-${timestamp}.${fileExt}`
          break
        case 'session':
          filePath = `sessions/${userId}/${timestamp}-${randomId}.${fileExt}`
          break
        case 'club-avatar':
          filePath = `clubs/${additionalPath}-avatar-${timestamp}.${fileExt}`
          break
        case 'club-cover':
          filePath = `clubs/${additionalPath}-cover-${timestamp}.${fileExt}`
          break
        case 'challenge':
          filePath = `challenges/${additionalPath || 'challenge'}-${timestamp}.${fileExt}`
          break
        default:
          const fileName = `${timestamp}-${randomId}.${fileExt}`
          filePath = additionalPath ? `${additionalPath}/${fileName}` : fileName
      }

      // Upload vers le bucket principal
      const { data, error } = await supabase.storage
        .from('plate-up')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: type === 'avatar',
          contentType: file.type || 'image/jpeg',
        })
      if (error) throw error

      // Obtenir l'URL publique
      const {
        data: { publicUrl },
      } = supabase.storage.from('plate-up').getPublicUrl(data.path)

      return {
        url: publicUrl,
        path: data.path,
        type,
        fileName: filePath,
      }
    } catch (error) {
      console.error('Erreur upload image:', error)
      throw error
    }
  },

  // Upload spécifique avatar utilisateur
  async uploadAvatar(file, userId) {
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
      const { data: files } = await supabase.storage
        .from('plate-up')
        .list('avatars', { search: userId })
      if (files?.length > 0) {
        const filesToDelete = files.map((file) => `avatars/${file.name}`)
        await supabase.storage.from('plate-up').remove(filesToDelete)
      }
    } catch (error) {
      console.error('Erreur suppression ancien avatar:', error)
    }
  },

  // Supprimer une image par path
  async deleteImage(path) {
    try {
      const { error } = await supabase.storage.from('plate-up').remove([path])
      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur suppression image:', error)
      throw error
    }
  },

  // Obtenir l'URL d'un avatar par userId
  getAvatarUrl(userId, timestamp = Date.now()) {
    const {
      data: { publicUrl },
    } = supabase.storage
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
        .list(folder, { sortBy: { column: 'created_at', order: 'desc' } })
      if (error) throw error
      return (
        files?.map((file) => ({
          name: file.name,
          path: `${folder}/${file.name}`,
          url: supabase.storage.from('plate-up').getPublicUrl(`${folder}/${file.name}`)
            .data.publicUrl,
          size: file.metadata?.size,
          createdAt: file.created_at,
        })) || []
      )
    } catch (error) {
      console.error('Erreur récupération images utilisateur:', error)
      return []
    }
  },

  // Créer un profil utilisateur s'il n'existe pas
  async ensureUserProfile(user) {
    if (!user?.id) return null
    try {
      // Vérifie si le profil existe déjà
      const { data: existing, error: selectError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (selectError) throw selectError

      // Insère un profil par défaut si aucun n'est trouvé
      if (!existing) {
        const { error: insertError } = await supabase.from('users').insert({
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
          last_seen: new Date().toISOString(),
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
  },
}
// Exporter le client Supabase pour utilisation dans l'application
export default supabase;