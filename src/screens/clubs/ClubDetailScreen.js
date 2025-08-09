import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, RefreshControl } from 'react-native'
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
    deleteClub,
  } = useClubStore()

  const { toggleLike, toggleSave } = useSessionStore()

  const [tab, setTab] = useState('feed') // 'feed' | 'chat'
  const [message, setMessage] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadClubById(clubId)
    loadClubFeed(clubId, true)
  }, [clubId, loadClubById, loadClubFeed])

  // Recharger les données quand l'écran reçoit le focus (retour depuis SessionDetail)
  useFocusEffect(
    useCallback(() => {
      if (tab === 'feed') {
        loadClubFeed(clubId, true)
      }
    }, [tab, clubId, loadClubFeed])
  )

  useEffect(() => {
    if (tab === 'chat') {
      loadChatMessages(clubId)
      const sub = subscribeToChat(clubId)
      return () => unsubscribeFromChat()
    }
  }, [tab, clubId, loadChatMessages, subscribeToChat, unsubscribeFromChat])

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

  const renderFeedItem = ({ item }) => (
    <SessionCard
      session={item}
      onPress={() => handleSessionPress(item)}
      onUserPress={handleUserPress}
      onLike={handleLike}
      onSave={handleSave}
      onComment={handleComment}
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
    await sendChatMessage(clubId, content)
    setMessage('')
  }

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
            {/* Bouton Éditer pour admin/owner */}
            {(currentClub?.userMembership?.role === 'admin' || currentClub?.userMembership?.role === 'owner') && (
              <TouchableOpacity onPress={handleEditClub} style={styles.editButton}>
                <Text style={styles.editIcon}>✏️</Text>
                <Text style={styles.editText}>Éditer</Text>
              </TouchableOpacity>
            )}
            
            {/* Bouton Supprimer pour owner seulement */}
            {currentClub?.userMembership?.role === 'owner' && (
              <TouchableOpacity onPress={handleDeleteClub} style={styles.deleteButton}>
                <Text style={styles.deleteIcon}>🗑️</Text>
                <Text style={styles.deleteText}>Supprimer</Text>
              </TouchableOpacity>
            )}
            
            {/* Bouton Rejoindre/Quitter pour les membres non-owner */}
            {currentClub?.userMembership?.role !== 'owner' && (
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

        {tab === 'feed' ? (
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
            <View style={styles.chatInputRow}>
              <TextInput style={styles.chatInput} value={message} onChangeText={setMessage} placeholder="Message..."/>
              <TouchableOpacity style={styles.chatSend} onPress={sendMessage}><Text style={styles.chatSendText}>➤</Text></TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
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
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.base,
    ...SHADOWS.small
  },
  editIcon: {
    fontSize: 16,
    marginRight: SPACING.xs
  },
  editText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.base,
    ...SHADOWS.small
  },
  deleteIcon: {
    fontSize: 16,
    marginRight: SPACING.xs
  },
  deleteText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold
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
})

export default ClubDetailScreen

