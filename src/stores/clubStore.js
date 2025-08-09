// src/stores/clubStore.js
import { create } from 'zustand'
import { clubsService } from '../services/clubs'
import { useAuthStore } from './authStore'

export const useClubStore = create((set, get) => ({
  // State
  clubs: [],
  loading: false,
  error: null,
  currentClub: null,
  clubFeed: [],
  clubFeedPage: 0,
  clubFeedHasMore: true,
  chatMessages: [],
  chatSubscription: null,
  chatPollingInterval: null,
  chatPollingActive: false,
  joinRequests: [],
  requestsLoading: false,

  // Helpers
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Load all clubs
  loadClubs: async () => {
    try {
      set({ loading: true, error: null })
      const userId = useAuthStore.getState().user?.id
      const clubs = await clubsService.getClubs(userId)
      set({ clubs, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  // Create club
  createClub: async (payload) => {
    try {
      set({ loading: true, error: null })
      const userId = useAuthStore.getState().user?.id
      if (!userId) throw new Error('Utilisateur non connecté')
      const club = await clubsService.createClub(payload, userId)
      const { clubs } = get()
      // Le créateur est automatiquement owner/membre
      set({ clubs: [{ ...club, userMembership: { role: 'owner' } }, ...clubs], loading: false })
      return { success: true, club }
    } catch (err) {
      set({ error: err.message, loading: false })
      return { success: false, error: err.message }
    }
  },

  // Update club
  updateClub: async (clubId, payload) => {
    try {
      set({ loading: true, error: null })
      const updated = await clubsService.updateClub(clubId, payload)
      const { clubs, currentClub } = get()
      set({
        loading: false,
        clubs: clubs.map((c) => (c.id === clubId ? { ...c, ...updated } : c)),
        currentClub: currentClub?.id === clubId ? { ...currentClub, ...updated } : currentClub,
      })
      return { success: true, club: updated }
    } catch (err) {
      set({ error: err.message, loading: false })
      return { success: false, error: err.message }
    }
  },

  // Join/Quit
  joinClub: async (clubId) => {
    try {
      const userId = useAuthStore.getState().user?.id
      if (!userId) throw new Error('Utilisateur non connecté')
      await clubsService.joinClub(clubId, userId)
      const { clubs, currentClub } = get()
      // optimistic update
      set({
        clubs: clubs.map((c) => (c.id === clubId ? { ...c, userMembership: { role: 'member' }, membersCount: (c.membersCount || 0) + 1 } : c)),
        currentClub: currentClub?.id === clubId ? { ...currentClub, userMembership: { role: 'member' }, membersCount: (currentClub.membersCount || 0) + 1 } : currentClub,
      })
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  },

  leaveClub: async (clubId) => {
    try {
      const userId = useAuthStore.getState().user?.id
      if (!userId) throw new Error('Utilisateur non connecté')
      await clubsService.leaveClub(clubId, userId)
      const { clubs, currentClub } = get()
      set({
        clubs: clubs.map((c) => (c.id === clubId ? { 
          ...c, 
          userMembership: null, 
          userJoinRequest: null, // Nettoyer aussi les demandes d'adhésion
          membersCount: Math.max(0, (c.membersCount || 0) - 1) 
        } : c)),
        currentClub: currentClub?.id === clubId ? { 
          ...currentClub, 
          userMembership: null, 
          userJoinRequest: null, // Nettoyer aussi les demandes d'adhésion
          membersCount: Math.max(0, (currentClub.membersCount || 0) - 1) 
        } : currentClub,
      })
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  },

  // Club detail + feed
  loadClubById: async (clubId) => {
    try {
      set({ loading: true, error: null })
      const userId = useAuthStore.getState().user?.id
      const club = await clubsService.getClubById(clubId, userId)
      set({ currentClub: club, loading: false })
      return club
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  loadClubFeed: async (clubId, refresh = false) => {
    try {
      const { clubFeedPage, clubFeed, loading } = get()
      
      console.log('📋 [STORE] loadClubFeed appelé:', { clubId, refresh, loading, currentFeedLength: clubFeed.length })
      
      // Si refresh demandé, forcer même si loading
      if (loading && !refresh) {
        console.log('⏸️ [STORE] Loading en cours et pas de refresh forcé, abandon')
        return
      }
      
      set({ loading: true, error: null })
      const page = refresh ? 0 : clubFeedPage
      const userId = useAuthStore.getState().user?.id
      
      console.log('🌐 [STORE] Appel service getClubFeed:', { clubId, page, userId })
      const items = await clubsService.getClubFeed(clubId, page, 10, userId)
      console.log('✅ [STORE] Service retourné:', items.length, 'items')
      
      if (refresh) {
        console.log('🔄 [STORE] REFRESH - remplacement du feed existant')
        set({ clubFeed: items, clubFeedPage: 1, clubFeedHasMore: items.length === 10, loading: false })
      } else {
        console.log('➕ [STORE] AJOUT - ajout au feed existant')
        set({ clubFeed: [...clubFeed, ...items], clubFeedPage: page + 1, clubFeedHasMore: items.length === 10, loading: false })
      }
    } catch (err) {
      console.error('❌ [STORE] Erreur loadClubFeed:', err)
      set({ error: err.message, loading: false })
    }
  },

  // Chat
  loadChatMessages: async (clubId, limit = 50) => {
    try {
      const messages = await clubsService.getClubMessages(clubId, limit)
      set({ chatMessages: messages })
    } catch (err) {
      console.error('Erreur loadChatMessages:', err)
    }
  },

  sendChatMessage: async (clubId, content) => {
    try {
      const userId = useAuthStore.getState().user?.id
      if (!userId) throw new Error('Utilisateur non connecté')
      
      console.log('📤 Envoi du message...')
      const msg = await clubsService.sendClubMessage(clubId, userId, content)
      
      if (msg) {
        console.log('✅ Message envoyé avec succès, refresh immédiat...')
        // Refresh immédiat pour l'expéditeur
        await get().loadChatMessages(clubId)
        // La subscription se chargera de refresh les autres utilisateurs
      }
      
      return msg
    } catch (err) {
      console.error('❌ Erreur sendChatMessage:', err)
      return null
    }
  },

  subscribeToChat: (clubId) => {
    // D'abord nettoyer toute subscription existante
    const { chatSubscription, chatPollingInterval } = get()
    if (chatSubscription) {
      console.log('🧹 [STORE] Nettoyage subscription existante')
      chatSubscription.unsubscribe()
    }
    if (chatPollingInterval) {
      console.log('🧹 [STORE] Nettoyage polling existant')
      clearInterval(chatPollingInterval)
    }

    console.log('🚀 [STORE] Démarrage subscription pour club:', clubId)
    const sub = clubsService.subscribeToClubMessages(clubId, (payload) => {
      console.log('🔥 [STORE] CALLBACK APPELÉ! Message détecté pour club:', clubId)
      console.log('📦 [STORE] Payload dans store:', payload)
      console.log('🔄 [STORE] Déclenchement loadChatMessages...')
      
      // Recharger tous les messages depuis la base avec délai pour être sûr
      setTimeout(() => {
        console.log('⏰ [STORE] Exécution du refresh après délai')
        get().loadChatMessages(clubId)
      }, 500)
    })
    
    set({ 
      chatSubscription: sub
    })
    console.log('💾 [STORE] Subscription sauvée dans le store')
    return sub
  },

  unsubscribeFromChat: () => {
    const { chatSubscription, chatPollingInterval } = get()
    if (chatSubscription) {
      console.log('🧹 [STORE] Désabonnement du chat')
      chatSubscription.unsubscribe()
    }
    if (chatPollingInterval) {
      console.log('🧹 [STORE] Arrêt du polling')
      clearInterval(chatPollingInterval)
    }
    set({ 
      chatSubscription: null, 
      chatPollingInterval: null, 
      chatPollingActive: false 
    })
  },

  // Fonctions pour contrôler le polling
  stopChatPolling: () => {
    const { chatPollingInterval } = get()
    if (chatPollingInterval) {
      console.log('⏹️ [STORE] ARRÊT COMPLET du polling')
      clearInterval(chatPollingInterval)
      set({ chatPollingInterval: null, chatPollingActive: false })
    }
  },

  startChatPolling: (clubId) => {
    const { chatPollingInterval } = get()
    
    // Arrêter le polling existant s'il y en a un
    if (chatPollingInterval) {
      console.log('🧹 [STORE] Nettoyage polling existant avant nouveau démarrage')
      clearInterval(chatPollingInterval)
    }

    console.log('🚀 [STORE] DÉMARRAGE polling pour club:', clubId)
    const pollingInterval = setInterval(() => {
      const currentState = get()
      if (currentState.chatPollingActive) {
        console.log('🔄 [POLLING] Refresh automatique des messages')
        get().loadChatMessages(clubId)
      }
    }, 3000)
    
    set({ 
      chatPollingInterval: pollingInterval, 
      chatPollingActive: true 
    })
  },

  // Supprimer un club
  deleteClub: async (clubId) => {
    try {
      set({ loading: true, error: null })
      const userId = useAuthStore.getState().user?.id
      if (!userId) throw new Error('Utilisateur non connecté')

      await clubsService.deleteClub(clubId, userId)
      
      // Mettre à jour l'état local
      const { clubs } = get()
      const updatedClubs = clubs.filter(club => club.id !== clubId)
      set({ 
        clubs: updatedClubs,
        currentClub: null,
        clubFeed: [],
        loading: false 
      })
      
      return true
    } catch (err) {
      console.error('Erreur suppression club:', err)
      set({ error: err.message, loading: false })
      throw err
    }
  },

  // Demander à rejoindre un club privé
  requestToJoinClub: async (clubId) => {
    try {
      set({ loading: true, error: null })
      const userId = useAuthStore.getState().user?.id
      if (!userId) throw new Error('Utilisateur non connecté')

      const request = await clubsService.requestToJoin(clubId, userId)
      
      // Mettre à jour l'état local du club
      const { clubs } = get()
      const updatedClubs = clubs.map(club => {
        if (club.id === clubId) {
          return { ...club, userJoinRequest: { status: 'pending' } }
        }
        return club
      })
      
      set({ clubs: updatedClubs, loading: false })
      return { success: true, request }
    } catch (err) {
      console.error('Erreur demande adhésion:', err)
      set({ error: err.message, loading: false })
      return { success: false, error: err.message }
    }
  },

  // Récupérer les demandes d'adhésion (propriétaire)
  loadJoinRequests: async (clubId) => {
    try {
      set({ requestsLoading: true, error: null })
      const userId = useAuthStore.getState().user?.id
      if (!userId) throw new Error('Utilisateur non connecté')

      const requests = await clubsService.getClubJoinRequests(clubId, userId)
      set({ joinRequests: requests, requestsLoading: false })
      return requests
    } catch (err) {
      console.error('Erreur chargement demandes:', err)
      set({ error: err.message, requestsLoading: false })
      throw err
    }
  },

  // Approuver/refuser une demande
  handleJoinRequest: async (requestId, action) => {
    try {
      set({ requestsLoading: true, error: null })
      const userId = useAuthStore.getState().user?.id
      if (!userId) throw new Error('Utilisateur non connecté')

      await clubsService.handleJoinRequest(requestId, action, userId)
      
      // Retirer la demande de la liste locale
      const { joinRequests } = get()
      const updatedRequests = joinRequests.filter(req => req.id !== requestId)
      set({ joinRequests: updatedRequests, requestsLoading: false })
      
      return { success: true }
    } catch (err) {
      console.error('Erreur traitement demande:', err)
      set({ error: err.message, requestsLoading: false })
      return { success: false, error: err.message }
    }
  },

  // Vérifier le statut d'une demande
  checkJoinRequestStatus: async (clubId) => {
    try {
      const userId = useAuthStore.getState().user?.id
      if (!userId) return null

      const status = await clubsService.getJoinRequestStatus(clubId, userId)
      return status
    } catch (err) {
      // Si la table n'existe pas, retourner null silencieusement
      if (err.code === '42P01') {
        console.warn('Table club_join_requests does not exist yet')
        return null
      }
      console.error('Erreur vérification statut:', err)
      return null
    }
  },
}))


