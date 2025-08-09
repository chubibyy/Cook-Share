// src/services/challenges.js
import { supabase } from './supabase'

// Local util to avoid missing export; mirrors usage elsewhere
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
        .order('start_date', { ascending: false })

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
      // Vérifier d'abord si l'utilisateur participe déjà
      const { data: existingParticipation, error: checkError } = await supabase
        .from('challenge_participants')
        .select('id, status')
        .eq('challenge_id', challengeId)
        .eq('user_id', userId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingParticipation) {
        throw new Error('Vous participez déjà à ce challenge')
      }

      // Ajouter la participation
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

  // Abandonner un challenge
  async abandonChallenge(challengeId, userId) {
    try {
      const { error } = await supabase
        .from('challenge_participants')
        .delete()
        .eq('challenge_id', challengeId)
        .eq('user_id', userId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Erreur abandon challenge:', error)
      throw error
    }
  },

  // Récupérer le nombre de participants d'un challenge
  async getChallengeParticipantsCount(challengeId) {
    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .select('id')
        .eq('challenge_id', challengeId)

      if (error) throw error
      return data?.length || 0
    } catch (error) {
      console.error('Erreur comptage participants:', error)
      return 0
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
  },

  // Récupérer les challenges personnels de l'utilisateur
  async getUserChallenges(userId) {
    try {
      // Récupérer tous les challenges (pour l'instant tous sont considérés comme personnels)
      const { data: challenges, error } = await supabase
        .from('challenges')
        .select('*')
        .order('id', { ascending: false })

      if (error) throw error

      // Récupérer les participations de l'utilisateur séparément
      const challengeIds = challenges?.map(c => c.id) || []
      let userParticipations = []
      
      if (challengeIds.length > 0) {
        const { data: participationsData, error: participationsError } = await supabase
          .from('challenge_participants')
          .select('*')
          .in('challenge_id', challengeIds)
          .eq('user_id', userId)

        if (participationsError) {
          console.warn('Erreur récupération participations:', participationsError)
        } else {
          userParticipations = participationsData || []
        }
      }

      // Mapper les participations avec les challenges
      const participationsMap = {}
      userParticipations.forEach(p => {
        participationsMap[p.challenge_id] = p
      })

      // Compter les participants pour chaque challenge
      const participantCounts = {}
      if (challengeIds.length > 0) {
        const { data: allParticipants, error: countError } = await supabase
          .from('challenge_participants')
          .select('challenge_id')
          .in('challenge_id', challengeIds)

        if (!countError && allParticipants) {
          allParticipants.forEach(p => {
            participantCounts[p.challenge_id] = (participantCounts[p.challenge_id] || 0) + 1
          })
        }
      }

      return challenges?.map(challenge => ({
        ...challenge,
        participantsCount: participantCounts[challenge.id] || 0,
        userParticipation: participationsMap[challenge.id] || null,
        isActive: new Date(challenge.end_date) > new Date(),
        timeLeft: calculateTimeLeft(challenge.end_date)
      })) || []
    } catch (error) {
      console.error('Erreur récupération challenges utilisateur:', error)
      throw error
    }
  },

  // Récupérer les challenges des clubs de l'utilisateur
  async getClubChallenges(userId) {
    try {
      // Pour l'instant, retourner un tableau vide car il n'y a pas de structure club_challenges dans le schema
      // TODO: Implémenter quand la structure de base de données sera mise à jour
      console.log('🏆 Club challenges pas encore implémentés - structure BD manquante')
      return []
    } catch (error) {
      console.error('Erreur récupération challenges clubs:', error)
      throw error
    }
  },

  // Récupérer les statistiques de l'utilisateur
  async getUserStats(userId) {
    try {
      // Récupérer les statistiques de base
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('xp')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError

      // Compter les challenges complétés
      const { data: completedChallenges, error: completedError } = await supabase
        .from('challenge_participants')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'reussi')

      if (completedError) throw completedError

      // Calculer la série actuelle (challenges consécutifs ce mois)
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data: monthlyCompleted, error: monthlyError } = await supabase
        .from('challenge_participants')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'reussi')

      if (monthlyError) throw monthlyError

      // Récupérer les badges récents (pour l'exemple, on simule quelques badges)
      const recentBadges = [
        { name: 'Premier challenge', emoji: '🎯' },
        { name: 'Cuisinier régulier', emoji: '👨‍🍳' },
        { name: 'Explorateur', emoji: '🗺️' }
      ].slice(0, Math.min(3, Math.floor((completedChallenges?.length || 0) / 2)))

      return {
        totalXP: userProfile?.xp || 0,
        completedChallenges: completedChallenges?.length || 0,
        badges: recentBadges.length,
        currentStreak: monthlyCompleted?.length || 0,
        recentBadges
      }
    } catch (error) {
      console.error('Erreur récupération statistiques utilisateur:', error)
      throw error
    }
  }
}