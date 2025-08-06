// src/screens/home/HomeScreen.js
import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { SessionCard } from '../../components/cards'
import { Avatar, LoadingSpinner } from '../../components/common'
import { useSessionStore } from '../../stores/sessionStore'
import { useAuthStore } from '../../stores/authStore'
import { useChallengeStore } from '../../stores/challengeStore'
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../utils/constants'
import { getLevelFromXP, getProgressToNextLevel } from '../../utils/constants'

const HomeScreen = ({ navigation }) => {
  const { user } = useAuthStore()
  const { 
    sessions, 
    loading, 
    hasMore, 
    loadFeed, 
    loadMore, 
    toggleLike, 
    toggleSave 
  } = useSessionStore()
  const { activeChallenges, loadChallenges } = useChallengeStore()
  
  const [refreshing, setRefreshing] = useState(false)

  // Chargement initial
  useEffect(() => {
    loadFeed(true)
    loadChallenges('active')
  }, [])

  // Rafraîchissement
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadFeed(true)
    await loadChallenges('active')
    setRefreshing(false)
  }, [])

  // Chargement de plus de sessions
  const onEndReached = useCallback(() => {
    if (hasMore && !loading) {
      loadMore()
    }
  }, [hasMore, loading])

  // Actions sur les sessions
  const handleSessionPress = (session) => {
    navigation.navigate('SessionDetail', { sessionId: session.id })
  }

  const handleUserPress = (user) => {
    navigation.navigate('UserProfile', { userId: user.id })
  }

  const handleLike = (sessionId, liked) => {
    toggleLike(sessionId)
  }

  const handleSave = (sessionId, saved) => {
    toggleSave(sessionId)
  }

  const handleComment = (session) => {
    navigation.navigate('SessionDetail', { 
      sessionId: session.id,
      focusComment: true 
    })
  }

  // Calcul du niveau utilisateur
  const userLevel = getLevelFromXP(user?.xp || 0)
  const { progress, xpToNext, nextLevel } = getProgressToNextLevel(user?.xp || 0)

  // Header avec informations utilisateur
  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.headerGradient}
      >
        <View style={styles.userInfo}>
          <TouchableOpacity
            style={styles.userProfile}
            onPress={() => navigation.navigate('Profile')}
          >
            <Avatar
              source={{ uri: user?.avatar_url }}
              name={user?.username}
              size="medium"
              xp={user?.xp}
              showBadge={true}
            />
            <View style={styles.userDetails}>
              <Text style={styles.greeting}>
                Salut {user?.username || 'Chef'} ! 👋
              </Text>
              <View style={styles.levelInfo}>
                <Text style={styles.levelText}>{userLevel.name}</Text>
                <Text style={styles.xpText}>
                  {nextLevel ? `${xpToNext} XP pour ${nextLevel.name}` : 'Niveau max !'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          
          {/* Barre de progression XP */}
          <View style={styles.xpBar}>
            <View style={styles.xpBarBackground}>
              <View style={[styles.xpBarFill, { width: `${progress * 100}%` }]} />
            </View>
          </View>
        </View>
      </LinearGradient>
      
      {/* Challenges actifs */}
      {activeChallenges?.length > 0 && (
        <View style={styles.challengesSection}>
          <Text style={styles.sectionTitle}>🎯 Défis du moment</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={activeChallenges.slice(0, 3)}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.challengesList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.challengeItem}
                onPress={() => navigation.navigate('Challenges', { 
                  screen: 'ChallengeDetail',
                  params: { challengeId: item.id }
                })}
              >
                <Text style={styles.challengeEmoji}>🏆</Text>
                <Text style={styles.challengeTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.challengeXP}>+{item.reward_xp} XP</Text>
                <Text style={styles.challengeTimer}>{item.timeLeft}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
      
      <Text style={styles.feedTitle}>🍽️ Dernières créations</Text>
    </View>
  )

  // Élément de session dans le feed
  const renderSession = ({ item }) => (
    <SessionCard
      session={item}
      onPress={handleSessionPress}
      onLike={handleLike}
      onSave={handleSave}
      onComment={handleComment}
      onUserPress={handleUserPress}
      style={styles.sessionCard}
    />
  )

  // Footer avec loader
  const renderFooter = () => {
    if (!loading) return null
    return (
      <View style={styles.footer}>
        <LoadingSpinner />
      </View>
    )
  }

  // État vide
  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🍳</Text>
      <Text style={styles.emptyTitle}>Aucune création pour le moment</Text>
      <Text style={styles.emptyText}>
        Soyez le premier à partager vos créations culinaires !
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('Create')}
      >
        <Text style={styles.emptyButtonText}>Créer ma première session</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={sessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={!loading ? renderEmpty : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  headerGradient: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
  },
  userInfo: {
    marginTop: SPACING.sm,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  userDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  greeting: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.white,
    marginRight: SPACING.sm,
  },
  xpText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.white + 'CC',
  },
  xpBar: {
    marginTop: SPACING.sm,
  },
  xpBarBackground: {
    height: 6,
    backgroundColor: COLORS.white + '30',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 3,
  },
  challengesSection: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  challengesList: {
    paddingRight: SPACING.md,
  },
  challengeItem: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.base,
    padding: SPACING.md,
    marginRight: SPACING.sm,
    minWidth: 140,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  challengeEmoji: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  challengeTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  challengeXP: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.accent,
    marginBottom: SPACING.xs,
  },
  challengeTimer: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textMuted,
  },
  feedTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sessionCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  footer: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.base * 1.4,
    marginBottom: SPACING.xl,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.base,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
})

export { HomeScreen }

