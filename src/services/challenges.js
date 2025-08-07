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