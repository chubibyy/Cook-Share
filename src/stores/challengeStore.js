// src/stores/challengeStore.js
import { create } from 'zustand'
import { challengesService } from '../services/challenges'
import { useAuthStore } from './authStore'


export const useChallengeStore = create((set, get) => ({
  // État
  challenges: [],
  activeChallenges: [],
  pastChallenges: [],
  userChallenges: [],
  currentChallenge: null,
  loading: false,
  error: null,

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Charger tous les challenges
  loadChallenges: async (status = 'all') => {
    try {
      set({ loading: true, error: null })

      const userId = useAuthStore.getState().user?.id
      const challenges = await challengesService.getChallenges(status, userId)

      if (status === 'all') {
        const active = challenges.filter(c => c.isActive)
        const past = challenges.filter(c => !c.isActive)
        
        set({
          challenges,
          activeChallenges: active,
          pastChallenges: past,
          loading: false
        })
      } else if (status === 'active') {
        set({
          activeChallenges: challenges,
          loading: false
        })
      } else if (status === 'past') {
        set({
          pastChallenges: challenges,
          loading: false
        })
      }
    } catch (error) {
      console.error('Erreur chargement challenges:', error)
      set({
        error: error.message,
        loading: false
      })
    }
  },

  // Charger les challenges de l'utilisateur
  loadUserChallenges: async () => {
    try {
      const userId = useAuthStore.getState().user?.id
      if (!userId) return

      set({ loading: true, error: null })

      const { data, error } = await supabase
        .from('challenge_participants')
        .select(`
          *,
          challenge:challenges(*),
          session:cooking_sessions(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      set({
        userChallenges: data || [],
        loading: false
      })
    } catch (error) {
      console.error('Erreur chargement challenges utilisateur:', error)
      set({
        error: error.message,
        loading: false
      })
    }
  },

  // Participer à un challenge
  participateInChallenge: async (challengeId) => {
    try {
      const userId = useAuthStore.getState().user?.id
      if (!userId) throw new Error('Utilisateur non connecté')

      set({ loading: true, error: null })

      await challengesService.participateInChallenge(challengeId, userId)

      // Mettre à jour les challenges
      const { challenges, activeChallenges } = get()
      
      const updateChallenge = (challenge) => {
        if (challenge.id === challengeId) {
          return {
            ...challenge,
            userParticipation: {
              status: 'en_cours',
              user_id: userId,
              challenge_id: challengeId
            },
            participantsCount: challenge.participantsCount + 1
          }
        }
        return challenge
      }

      set({
        challenges: challenges.map(updateChallenge),
        activeChallenges: activeChallenges.map(updateChallenge),
        loading: false
      })

      return { success: true }
    } catch (error) {
      set({
        error: error.message,
        loading: false
      })
      return { success: false, error: error.message }
    }
  },

  // Soumettre une session pour un challenge
  submitChallengeSession: async (challengeId, sessionId) => {
    try {
      const userId = useAuthStore.getState().user?.id
      if (!userId) throw new Error('Utilisateur non connecté')

      set({ loading: true, error: null })

      await challengesService.submitChallengeSession(challengeId, userId, sessionId)

      // Mettre à jour les challenges
      const { challenges, activeChallenges, userChallenges } = get()
      
      const updateChallenge = (challenge) => {
        if (challenge.id === challengeId) {
          return {
            ...challenge,
            userParticipation: {
              ...challenge.userParticipation,
              status: 'reussi',
              session_id: sessionId
            }
          }
        }
        return challenge
      }

      set({
        challenges: challenges.map(updateChallenge),
        activeChallenges: activeChallenges.map(updateChallenge),
        loading: false
      })

      // Ajouter l'XP à l'utilisateur
      const challenge = challenges.find(c => c.id === challengeId)
      if (challenge?.reward_xp) {
        useAuthStore.getState().addXP(challenge.reward_xp)
      }

      return { success: true }
    } catch (error) {
      set({
        error: error.message,
        loading: false
      })
      return { success: false, error: error.message }
    }
  },

  // Obtenir un challenge par ID
  getChallengeById: async (challengeId) => {
    try {
      set({ loading: true, error: null })

      const userId = useAuthStore.getState().user?.id
      
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          participants:challenge_participants(count),
          user_participation:challenge_participants(*),
          participants_list:challenge_participants(
            *,
            user:users(*),
            session:cooking_sessions(*)
          )
        `)
        .eq('id', challengeId)
        .eq('user_participation.user_id', userId)
        .single()

      if (error) throw error

      const challenge = {
        ...data,
        participantsCount: data.participants?.[0]?.count || 0,
        userParticipation: data.user_participation?.[0] || null,
        isActive: new Date(data.end_date) > new Date(),
        timeLeft: calculateTimeLeft(data.end_date)
      }

      set({
        currentChallenge: challenge,
        loading: false
      })

      return challenge
    } catch (error) {
      set({
        error: error.message,
        loading: false
      })
      throw error
    }
  }
}))

