// src/stores/challengeStore.js
import { create } from 'zustand'
import { challengesService } from '../services/challenges'
import { supabase } from '../services/supabase'
import { useAuthStore } from './authStore'

// Helper pour calculer le temps restant
const calculateTimeLeft = (endDate) => {
  if (!endDate) return 'N/A'
  const diff = new Date(endDate).getTime() - new Date().getTime()
  if (diff <= 0) return 'Terminé'
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days === 1) return '1 jour'
  return `${days} jours`
}

export const useChallengeStore = create((set, get) => ({
  // État
  challenges: [],
  activeChallenges: [],
  pastChallenges: [],
  userChallenges: [],
  clubChallenges: [],
  userStats: null,
  currentChallenge: null,
  popularChallenge: null,
  loading: false,
  error: null,

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  loadPopularChallenge: async () => {
    try {
      set({ loading: true, error: null });
      const challenge = await challengesService.getPopularChallenge();
      set({ popularChallenge: challenge, loading: false });
    } catch (error) {
      console.error('Erreur chargement challenge populaire:', error);
      set({ error: error.message, loading: false });
    }
  },

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

  // Charger les challenges personnels de l'utilisateur
  loadUserChallenges: async (userId) => {
    try {
      if (!userId) return

      set({ loading: true, error: null })

      const userChallenges = await challengesService.getUserChallenges(userId)

      set({
        userChallenges: userChallenges || [],
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

  // Charger les challenges des clubs de l'utilisateur
  loadClubChallenges: async (userId) => {
    try {
      if (!userId) return

      set({ loading: true, error: null })

      const clubChallenges = await challengesService.getClubChallenges(userId)

      set({
        clubChallenges: clubChallenges || [],
        loading: false
      })
    } catch (error) {
      console.error('Erreur chargement challenges clubs:', error)
      set({
        error: error.message,
        loading: false
      })
    }
  },

  // Charger les statistiques de l'utilisateur
  loadUserStats: async (userId) => {
    try {
      if (!userId) return

      set({ loading: true, error: null })

      const userStats = await challengesService.getUserStats(userId)

      set({
        userStats: userStats,
        loading: false
      })
    } catch (error) {
      console.error('Erreur chargement statistiques utilisateur:', error)
      set({
        error: error.message,
        loading: false
      })
    }
  },

  // Participer à un challenge
  participateInChallenge: async (challengeId, userId) => {
    try {
      if (!userId) throw new Error('Utilisateur non connecté')

      set({ loading: true, error: null })

      await challengesService.participateInChallenge(challengeId, userId)

      // Mettre à jour les challenges
      const { challenges, activeChallenges, userChallenges, clubChallenges } = get()
      
      const updateChallenge = (challenge) => {
        if (challenge.id === challengeId) {
          return {
            ...challenge,
            userParticipation: {
              status: 'en_cours',
              user_id: userId,
              challenge_id: challengeId
            },
            participantsCount: (challenge.participantsCount || 0) + 1
          }
        }
        return challenge
      }

      set({
        challenges: challenges.map(updateChallenge),
        activeChallenges: activeChallenges.map(updateChallenge),
        userChallenges: userChallenges.map(updateChallenge),
        clubChallenges: clubChallenges.map(updateChallenge),
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

  // Abandonner un challenge
  abandonChallenge: async (challengeId, userId) => {
    try {
      if (!userId) throw new Error('Utilisateur non connecté')

      set({ loading: true, error: null })

      await challengesService.abandonChallenge(challengeId, userId)

      // Mettre à jour les challenges
      const { challenges, activeChallenges, userChallenges, clubChallenges } = get()
      
      const updateChallenge = (challenge) => {
        if (challenge.id === challengeId) {
          return {
            ...challenge,
            userParticipation: null,
            participantsCount: Math.max(0, (challenge.participantsCount || 0) - 1)
          }
        }
        return challenge
      }

      set({
        challenges: challenges.map(updateChallenge),
        activeChallenges: activeChallenges.map(updateChallenge),
        userChallenges: userChallenges.map(updateChallenge),
        clubChallenges: clubChallenges.map(updateChallenge),
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

      // Mettre à jour les challenges et le challenge courant
      const { challenges, activeChallenges, userChallenges, currentChallenge } = get()
      
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

      const newCurrentChallenge = currentChallenge?.id === challengeId 
        ? updateChallenge(currentChallenge)
        : currentChallenge;

      set({
        challenges: challenges.map(updateChallenge),
        activeChallenges: activeChallenges.map(updateChallenge),
        userChallenges: userChallenges.map(updateChallenge),
        currentChallenge: newCurrentChallenge,
        loading: false
      })

      // Ajouter l'XP à l'utilisateur
      let challengeForXp = null

      if (currentChallenge?.id === challengeId) {
        challengeForXp = currentChallenge
      } else {
        const allChallenges = [...challenges, ...activeChallenges, ...userChallenges]
        challengeForXp = allChallenges.find(c => c.id === challengeId)
      }

      if (challengeForXp?.reward_xp) {
        useAuthStore.getState().addXP(challengeForXp.reward_xp)
      }

      // Ajouter le badge à la collection de l'utilisateur
      if (challengeForXp?.badge_image_url) {
        await supabase.from('user_badges').insert({
          user_id: userId,
          challenge_id: challengeId,
          badge_image_url: challengeForXp.badge_image_url
        }, { onConflict: 'user_id,challenge_id' });
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

  // Inscrire des clubs à un challenge
  participateClubsInChallenge: async (challengeId, clubIds, userId) => {
    try {
      if (!userId) throw new Error('Utilisateur non connecté')

      set({ loading: true, error: null })

      await challengesService.participateClubsInChallenge(challengeId, clubIds, userId)

      // Mettre à jour les challenges clubs
      const { clubChallenges } = get()
      
      const updateChallenge = (challenge) => {
        if (challenge.id === challengeId) {
          return {
            ...challenge,
            participantsCount: (challenge.participantsCount || 0) + clubIds.length,
            clubParticipations: [
              ...(challenge.clubParticipations || []),
              ...clubIds.map(clubId => {
                // Trouver le club dans la liste des clubs possédés
                const club = challenge.ownedClubs?.find(c => c.id === clubId)
                return {
                  challenge_id: challengeId,
                  club_id: clubId,
                  club: club || null
                }
              })
            ]
          }
        }
        return challenge
      }

      set({
        clubChallenges: clubChallenges.map(updateChallenge),
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

  // Désinscrire un club d'un challenge
  removeClubFromChallenge: async (challengeId, clubId, userId) => {
    try {
      if (!userId) throw new Error('Utilisateur non connecté')

      set({ loading: true, error: null })

      await challengesService.removeClubFromChallenge(challengeId, clubId, userId)

      // Mettre à jour les challenges clubs
      const { clubChallenges } = get()
      
      const updateChallenge = (challenge) => {
        if (challenge.id === challengeId) {
          return {
            ...challenge,
            participantsCount: Math.max(0, (challenge.participantsCount || 0) - 1),
            clubParticipations: (challenge.clubParticipations || []).filter(
              p => p.club_id !== clubId
            )
          }
        }
        return challenge
      }

      set({
        clubChallenges: clubChallenges.map(updateChallenge),
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

  // Obtenir un challenge par ID
  getChallengeById: async (challengeId) => {
    try {
      set({ loading: true, error: null, currentChallenge: null })

      const userId = useAuthStore.getState().user?.id
      
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          participants:challenge_participants(count),
          participants_list:challenge_participants(
            *,
            user:users(*),
            session:cooking_sessions(*)
          )
        `)
        .eq('id', challengeId)
        .single()

      if (error) throw error

      // Si c'est un challenge de club, récupérer les clubs du user
      let ownedClubs = []
      if (data.is_club_challenge && userId) {
        ownedClubs = await challengesService.getUserOwnedClubs(userId)
      }

      // Trouver la participation de l'utilisateur dans la liste complète
      const userParticipation = data.participants_list?.find(p => p.user_id === userId) || null

      const challenge = {
        ...data,
        participantsCount: data.participants?.[0]?.count || 0,
        userParticipation: userParticipation,
        isActive: new Date(data.end_date) > new Date(),
        timeLeft: calculateTimeLeft(data.end_date),
        ownedClubs: ownedClubs, // Attacher les clubs possédés
      }

      set({
        currentChallenge: challenge,
        loading: false
      })

      return challenge
    } catch (error) {
      console.error("Erreur getChallengeById:", error)
      set({
        error: error.message,
        loading: false
      })
    }
  }
}))

