import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRoute } from '@react-navigation/native'
import { useClubStore } from '../../stores/clubStore'
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
  } = useClubStore()

  const [tab, setTab] = useState('feed') // 'feed' | 'chat'
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadClubById(clubId)
    loadClubFeed(clubId, true)
  }, [clubId, loadClubById, loadClubFeed])

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

  const renderFeedItem = ({ item }) => (
    <SessionCard
      session={{
        ...item,
        user: item.user || {},
        likesCount: item.likesCount || 0,
        commentsCount: item.commentsCount || 0,
        timeAgo: new Date(item.created_at).toLocaleDateString('fr-FR'),
      }}
      onPress={(session) => navigation.navigate('SessionDetail', { sessionId: session.id })}
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
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
          <Text style={styles.title}>{currentClub?.name || 'Club'}</Text>
          {currentClub?.userMembership?.role === 'owner' ? (
            <View />
          ) : (
            <TouchableOpacity onPress={handleToggleMembership}>
              <Text style={styles.joinBtn}>{currentClub?.userMembership ? 'Quitter' : 'Rejoindre'}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setTab('feed')} style={[styles.tab, tab==='feed' && styles.tabActive]}>
            <Text style={[styles.tabText, tab==='feed' && styles.tabTextActive]}>Feed</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab('chat')} style={[styles.tab, tab==='chat' && styles.tabActive]}>
            <Text style={[styles.tabText, tab==='chat' && styles.tabTextActive]}>Chat</Text>
          </TouchableOpacity>
          {/* Bouton +Session retiré par design */}
          {(currentClub?.userMembership?.role === 'admin' || currentClub?.userMembership?.role === 'owner') && (
            <TouchableOpacity onPress={() => navigation.navigate('EditClub', { clubId })} style={styles.editButton}>
              <Text style={styles.editButtonText}>Éditer</Text>
            </TouchableOpacity>
          )}
        </View>

        {tab === 'feed' ? (
          <FlatList
            data={clubFeed}
            renderItem={renderFeedItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            onEndReached={() => clubFeedHasMore && loadClubFeed(clubId)}
            onEndReachedThreshold={0.2}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  back: { fontSize: 22, color: COLORS.primary },
  title: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text },
  joinBtn: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.primary },
  tabs: { flexDirection: 'row', paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  tab: { paddingVertical: SPACING.sm, marginRight: SPACING.md },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.primary, fontWeight: TYPOGRAPHY.weights.semibold },
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

