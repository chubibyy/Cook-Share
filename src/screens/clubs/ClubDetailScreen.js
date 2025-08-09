import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, RefreshControl, Modal, Share } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRoute, useFocusEffect } from '@react-navigation/native'
import { useClubStore } from '../../stores/clubStore'
import { useSessionStore } from '../../stores/sessionStore'
import { SessionCard } from '../../components/cards/SessionCard'
import Button from '../../components/common/Button'
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../utils/constants'

export const ClubDetailScreen = ({ navigation }) => {
  const route = useRoute()
  const { clubId } = route.params
  const {
    currentClub,
    clubFeed,
    clubFeedHasMore,
    loading,
    loadClubById,
    loadClubFeed,
    joinClub,
    leaveClub,
    chatMessages,
    loadChatMessages,
    sendChatMessage,
    subscribeToChat,
    unsubscribeFromChat,
    stopChatPolling,
    startChatPolling,
    deleteClub,
    checkJoinRequestStatus,
    loadJoinRequests,
  } = useClubStore()

  const { toggleLike, toggleSave } = useSessionStore()

  const [tab, setTab] = useState('feed') // 'feed' | 'chat'
  const [joinRequestStatus, setJoinRequestStatus] = useState(null)
  const [message, setMessage] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [showOwnerMenu, setShowOwnerMenu] = useState(false)
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0)

  // Vérifier si l'utilisateur est membre du club
  const isMember = currentClub?.userMembership !== null && currentClub?.userMembership !== undefined

  useEffect(() => {
    console.log('🏠 [SCREEN] Montage du ClubDetailScreen pour clubId:', clubId)
    loadClubById(clubId)
    loadClubFeed(clubId, true)
  }, [clubId, loadClubById, loadClubFeed])

  // Recharger automatiquement quand on change d'onglet vers Feed
  useEffect(() => {
    if (tab === 'feed') {
      console.log('📋 [SCREEN] Onglet FEED actif - rechargement du feed')
      loadClubFeed(clubId, true)
    }
  }, [tab, clubId, loadClubFeed])

  // Charger le feed dès que currentClub est disponible
  useEffect(() => {
    if (currentClub && tab === 'feed') {
      console.log('🏗️ [SCREEN] Club chargé et tab Feed - chargement initial du feed')
      loadClubFeed(clubId, true)
    }
  }, [currentClub, tab, clubId, loadClubFeed])

  useEffect(() => {
    // Vérifier le statut de demande d'adhésion si l'utilisateur n'est pas membre d'un club privé
    if (currentClub?.is_private && !currentClub?.userMembership) {
      checkJoinRequestStatus(clubId).then(setJoinRequestStatus)
    }
  }, [currentClub, clubId, checkJoinRequestStatus])

  useEffect(() => {
    // Charger le nombre de demandes en attente si l'utilisateur est propriétaire d'un club privé
    if (currentClub?.userMembership?.role === 'owner' && currentClub?.is_private) {
      loadJoinRequests(clubId).then(requests => {
        setPendingRequestsCount(requests?.length || 0)
      }).catch(() => {
        setPendingRequestsCount(0)
      })
    }
  }, [currentClub, clubId, loadJoinRequests])

  // Recharger les données quand l'écran reçoit le focus (retour depuis SessionDetail)
  useFocusEffect(
    useCallback(() => {
      console.log('👀 [FOCUS] Écran reçoit le focus, tab actuel:', tab)
      // Toujours recharger le club et le feed au focus
      loadClubById(clubId)
      if (tab === 'feed') {
        console.log('👀 [FOCUS] Rechargement du feed car onglet Feed actif')
        loadClubFeed(clubId, true)
      }
    }, [tab, clubId, loadClubById, loadClubFeed])
  )

  // Gérer la subscription du chat pour les membres
  useEffect(() => {
    if (isMember && currentClub) {
      console.log('🎯 [SCREEN] Membre détecté pour club:', currentClub.name)
      console.log('🎯 [SCREEN] ClubId:', clubId)
      console.log('🎯 [SCREEN] isMember:', isMember)
      console.log('🚀 [SCREEN] Démarrage subscription...')
      subscribeToChat(clubId)
    } else {
      console.log('❌ [SCREEN] Pas membre ou club pas chargé:', { isMember, clubName: currentClub?.name })
    }
    
    // Cleanup seulement quand on quitte le composant ou n'est plus membre
    return () => {
      if (!isMember) {
        console.log('🧹 [SCREEN] Plus membre - nettoyage subscription chat')
        unsubscribeFromChat()
      }
    }
  }, [clubId, isMember, currentClub, subscribeToChat, unsubscribeFromChat])

  // Charger les messages et gérer le polling quand on change d'onglet
  useEffect(() => {
    if (tab === 'chat' && isMember) {
      console.log('📱 [SCREEN] Onglet CHAT actif - chargement messages et démarrage polling')
      loadChatMessages(clubId)
      startChatPolling(clubId) // Démarrer le polling quand on va sur Chat
    } else {
      console.log('📱 [SCREEN] Onglet FEED ou pas membre - arrêt complet du polling')
      stopChatPolling() // Arrêter complètement le polling
    }
  }, [tab, clubId, isMember, loadChatMessages, startChatPolling, stopChatPolling])

  // Cleanup général seulement quand on quitte complètement le composant
  useEffect(() => {
    return () => {
      console.log('Nettoyage général - sortie du ClubDetailScreen')
      unsubscribeFromChat()
    }
  }, [])

  const handleToggleMembership = async () => {
    if (!currentClub) return
    if (currentClub.userMembership) {
      await leaveClub(currentClub.id)
    } else {
      await joinClub(currentClub.id)
    }
  }

  const handleEditClub = () => {
    navigation.navigate('EditClub', { clubId })
  }

  const handleViewRequests = () => {
    setShowOwnerMenu(false)
    navigation.navigate('JoinRequests', { 
      clubId, 
      clubName: currentClub?.name 
    })
  }

  const handleEditFromMenu = () => {
    setShowOwnerMenu(false)
    handleEditClub()
  }

  const handleDeleteFromMenu = () => {
    setShowOwnerMenu(false)
    handleDeleteClub()
  }

  const handleDeleteClub = () => {
    Alert.alert(
      'Supprimer le club',
      `Êtes-vous sûr de vouloir supprimer définitivement le club "${currentClub?.name}" ? Cette action est irréversible et supprimera tous les messages du club.`,
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteClub(clubId)
              Alert.alert('Club supprimé', 'Le club a été supprimé avec succès')
              navigation.goBack()
            } catch (error) {
              Alert.alert('Erreur', error.message)
            }
          }
        }
      ]
    )
  }

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await loadClubById(clubId)
      await loadClubFeed(clubId, true) // refresh = true pour recharger depuis le début
    } catch (error) {
      console.error('Error refreshing club feed:', error)
    } finally {
      setRefreshing(false)
    }
  }, [clubId, loadClubById, loadClubFeed])

  const handleSessionPress = (session) => {
    navigation.navigate('SessionDetail', { sessionId: session.id })
  }

  const handleUserPress = (session) => {
    navigation.navigate('SessionDetail', { sessionId: session.id })
  }

  const handleLike = async (sessionId) => {
    try {
      await toggleLike(sessionId)
      // Recharger le feed du club pour synchroniser les compteurs
      await loadClubFeed(clubId, true)
    } catch (error) {
      console.error('Error liking session:', error)
    }
  }

  const handleSave = async (sessionId) => {
    try {
      await toggleSave(sessionId)
      // Recharger le feed du club pour synchroniser les compteurs
      await loadClubFeed(clubId, true)
    } catch (error) {
      console.error('Error saving session:', error)
    }
  }

  const handleComment = (session) => {
    navigation.navigate('SessionDetail', { 
      sessionId: session.id, 
      focusComment: true 
    })
  }

  const handleShare = async (sessionId) => {
    if (!sessionId) return
    
    // Trouver la session dans le feed
    const session = clubFeed.find(s => s.id === sessionId)
    if (!session) return
    
    try {
      await Share.share({
        message: `Découvrez cette session de cuisine sur CookShare: ${session.title}\n#CookShareApp`,
      })
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager la session.')
    }
  }

  const renderFeedItem = ({ item }) => (
    <SessionCard
      session={item}
      onPress={() => handleSessionPress(item)}
      onUserPress={handleUserPress}
      onLike={handleLike}
      onSave={handleSave}
      onComment={handleComment}
      onShare={handleShare}
    />
  )

  const renderChatItem = ({ item }) => (
    <View style={styles.chatItem}>
      <Text style={styles.chatAuthor}>{item.user?.username || 'User'}</Text>
      <Text style={styles.chatContent}>{item.content}</Text>
      <Text style={styles.chatDate}>{new Date(item.created_at).toLocaleString('fr-FR')}</Text>
    </View>
  )

  const sendMessage = async () => {
    const content = message.trim()
    if (!content) return
    
    try {
      console.log('Envoi message:', content)
      const result = await sendChatMessage(clubId, content)
      if (result) {
        console.log('Message envoyé avec succès:', result)
        setMessage('')
      } else {
        console.error('Échec envoi message')
      }
    } catch (error) {
      console.error('Erreur envoi message:', error)
    }
  }

  const renderPendingRequestState = () => (
    <View style={styles.pendingContainer}>
      <View style={styles.pendingContent}>
        <Text style={styles.pendingIcon}>⏳</Text>
        <Text style={styles.pendingTitle}>Demande en attente</Text>
        <Text style={styles.pendingMessage}>
          Votre demande d'adhésion au club "{currentClub?.name}" a été envoyée au propriétaire.
          Vous recevrez une notification une fois qu'elle sera traitée.
        </Text>
        <Text style={styles.pendingDate}>
          Demande envoyée le {new Date(joinRequestStatus?.requested_at).toLocaleDateString('fr-FR')}
        </Text>
      </View>
    </View>
  )

  const renderRejectedState = () => (
    <View style={styles.pendingContainer}>
      <View style={styles.pendingContent}>
        <Text style={styles.pendingIcon}>❌</Text>
        <Text style={styles.pendingTitle}>Demande refusée</Text>
        <Text style={styles.pendingMessage}>
          Votre demande d'adhésion au club "{currentClub?.name}" a été refusée par le propriétaire.
        </Text>
      </View>
    </View>
  )

  const renderOwnerMenu = () => (
    <Modal
      visible={showOwnerMenu}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowOwnerMenu(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={() => setShowOwnerMenu(false)}
      >
        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>Actions du propriétaire</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleEditFromMenu}>
            <Text style={styles.menuIcon}>✏️</Text>
            <Text style={styles.menuText}>Éditer le club</Text>
          </TouchableOpacity>
          
          {currentClub?.is_private && (
            <TouchableOpacity style={styles.menuItem} onPress={handleViewRequests}>
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>📋</Text>
                {pendingRequestsCount > 0 && (
                  <View style={styles.requestsBadge}>
                    <Text style={styles.requestsBadgeText}>{pendingRequestsCount}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.menuText}>
                Demandes d'adhésion {pendingRequestsCount > 0 && `(${pendingRequestsCount})`}
              </Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.menuDivider} />
          
          <TouchableOpacity style={[styles.menuItem, styles.dangerItem]} onPress={handleDeleteFromMenu}>
            <Text style={styles.menuIcon}>🗑️</Text>
            <Text style={[styles.menuText, styles.dangerText]}>Supprimer le club</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  )

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.title}>{currentClub?.name || 'Club'}</Text>
            {currentClub?.userMembership?.role && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {currentClub.userMembership.role === 'owner' ? '👑 Propriétaire' : 
                   currentClub.userMembership.role === 'admin' ? '⚡ Admin' : '✅ Membre'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.headerActions}>
            {/* Indicateur de demandes pour owner de club privé */}
            {currentClub?.userMembership?.role === 'owner' && currentClub?.is_private && pendingRequestsCount > 0 && (
              <TouchableOpacity onPress={handleViewRequests} style={styles.requestsIndicator}>
                <View style={styles.requestsBadge}>
                  <Text style={styles.requestsBadgeText}>{pendingRequestsCount}</Text>
                </View>
                <Text style={styles.requestsIndicatorText}>Demandes</Text>
              </TouchableOpacity>
            )}

            {/* Bouton Options pour owner */}
            {currentClub?.userMembership?.role === 'owner' && (
              <TouchableOpacity onPress={() => setShowOwnerMenu(true)} style={styles.optionsButton}>
                <Text style={styles.optionsIcon}>⚙️</Text>
              </TouchableOpacity>
            )}
            
            {/* Bouton Éditer pour admin */}
            {currentClub?.userMembership?.role === 'admin' && (
              <TouchableOpacity onPress={handleEditClub} style={styles.editButton}>
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
            )}
            
            {/* Bouton Rejoindre/Quitter pour les membres non-owner/admin */}
            {!['owner', 'admin'].includes(currentClub?.userMembership?.role) && (
              <TouchableOpacity onPress={handleToggleMembership} style={styles.membershipButton}>
                <Text style={[
                  styles.membershipText,
                  currentClub?.userMembership ? styles.leaveText : styles.joinText
                ]}>
                  {currentClub?.userMembership ? 'Quitter' : 'Rejoindre'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setTab('feed')} style={[styles.tab, tab==='feed' && styles.tabActive]}>
            <Text style={[styles.tabText, tab==='feed' && styles.tabTextActive]}>Feed</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab('chat')} style={[styles.tab, tab==='chat' && styles.tabActive]}>
            <Text style={[styles.tabText, tab==='chat' && styles.tabTextActive]}>Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Afficher l'état approprié selon le statut de l'utilisateur */}
        {currentClub?.is_private && !currentClub?.userMembership ? (
          joinRequestStatus?.status === 'pending' ? (
            renderPendingRequestState()
          ) : joinRequestStatus?.status === 'rejected' ? (
            renderRejectedState()
          ) : (
            // Utilisateur n'est pas membre et n'a pas de demande : afficher un écran "rejoindre d'abord"
            <View style={styles.pendingContainer}>
              <View style={styles.pendingContent}>
                <Text style={styles.pendingIcon}>🔒</Text>
                <Text style={styles.pendingTitle}>Club privé</Text>
                <Text style={styles.pendingMessage}>
                  Ce club est privé. Vous devez faire une demande d'adhésion depuis la liste des clubs pour pouvoir y accéder.
                </Text>
              </View>
            </View>
          )
        ) : tab === 'feed' ? (
          <FlatList
            data={clubFeed}
            renderItem={renderFeedItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            onEndReached={() => clubFeedHasMore && loadClubFeed(clubId)}
            onEndReachedThreshold={0.2}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
          />
        ) : (
          <View style={{ flex: 1 }}>
            <FlatList
              data={chatMessages}
              inverted
              renderItem={renderChatItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.chatList}
            />
            {/* Zone d'input de chat - seulement pour les membres */}
            {isMember ? (
              <View style={styles.chatInputRow}>
                <TextInput 
                  style={styles.chatInput} 
                  value={message} 
                  onChangeText={setMessage} 
                  placeholder="Message..."
                />
                <TouchableOpacity style={styles.chatSend} onPress={sendMessage}>
                  <Text style={styles.chatSendText}>➤</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.chatRestrictionContainer}>
                <Text style={styles.chatRestrictionText}>
                  {currentClub?.is_private 
                    ? "🔒 Vous devez être membre de ce club privé pour participer au chat"
                    : "✨ Rejoignez ce club pour participer au chat"
                  }
                </Text>
                <Button
                  title="Rejoindre le club"
                  variant="primary"
                  size="small"
                  onPress={handleToggleMembership}
                  style={styles.joinChatButton}
                />
              </View>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
      {renderOwnerMenu()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: SPACING.md, 
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.surface
  },
  backButton: {
    padding: SPACING.sm,
    borderRadius: RADIUS.base,
    backgroundColor: COLORS.backgroundSecondary
  },
  backIcon: { 
    fontSize: 20, 
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.bold
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.md
  },
  title: { 
    fontSize: TYPOGRAPHY.sizes.lg, 
    fontWeight: TYPOGRAPHY.weights.bold, 
    color: COLORS.text,
    textAlign: 'center'
  },
  roleBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginTop: SPACING.xs
  },
  roleText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.semibold
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm
  },
  optionsButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  optionsIcon: {
    fontSize: 18,
    color: COLORS.primary,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  editIcon: {
    fontSize: 16,
    color: COLORS.white,
  },
  requestsIndicator: {
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  requestsIndicatorText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginTop: SPACING.xs,
  },
  requestsBadge: {
    backgroundColor: COLORS.error,
    borderRadius: RADIUS.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 1,
  },
  requestsBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  membershipButton: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.base,
    borderWidth: 1,
    borderColor: COLORS.borderLight
  },
  membershipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold
  },
  joinText: {
    color: COLORS.primary
  },
  leaveText: {
    color: COLORS.error
  },
  tabs: { 
    flexDirection: 'row', 
    paddingHorizontal: SPACING.md, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.background
  },
  tab: { 
    paddingVertical: SPACING.sm, 
    marginRight: SPACING.md,
    paddingHorizontal: SPACING.md
  },
  tabActive: { 
    borderBottomWidth: 2, 
    borderBottomColor: COLORS.primary 
  },
  tabText: { 
    fontSize: TYPOGRAPHY.sizes.base, 
    color: COLORS.textSecondary 
  },
  tabTextActive: { 
    color: COLORS.primary, 
    fontWeight: TYPOGRAPHY.weights.semibold 
  },
  list: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl },
  chatList: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.md },
  chatItem: { backgroundColor: COLORS.surface, borderRadius: RADIUS.base, padding: SPACING.md, marginVertical: SPACING.xs },
  chatAuthor: { fontWeight: TYPOGRAPHY.weights.semibold, marginBottom: 2, color: COLORS.text },
  chatContent: { color: COLORS.text },
  chatDate: { color: COLORS.textMuted, marginTop: 4, fontSize: TYPOGRAPHY.sizes.xs },
  chatInputRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.borderLight, backgroundColor: COLORS.surface },
  chatInput: { flex: 1, backgroundColor: COLORS.backgroundSecondary, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.base, color: COLORS.text },
  chatSend: { marginLeft: SPACING.sm, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.base },
  chatSendText: { color: COLORS.white, fontWeight: TYPOGRAPHY.weights.bold },
  pendingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  pendingContent: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.base,
  },
  pendingIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  pendingTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  pendingMessage: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeights.relaxed,
    marginBottom: SPACING.md,
  },
  pendingDate: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  // Styles pour le modal du menu propriétaire
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  menuContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 320,
    ...SHADOWS.lg,
  },
  menuTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.base,
    marginBottom: SPACING.xs,
  },
  menuIconContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  menuIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  menuText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text,
    flex: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  dangerItem: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  dangerText: {
    color: COLORS.error,
  },
  // Styles pour la restriction du chat
  chatRestrictionContainer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    alignItems: 'center',
  },
  chatRestrictionText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: TYPOGRAPHY.lineHeights.relaxed,
  },
  joinChatButton: {
    minWidth: 150,
  },
})

export default ClubDetailScreen

