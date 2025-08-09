import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'
import { useChallengeStore } from '../../stores/challengeStore'
import { useAuthStore } from '../../stores/authStore'
import { ChallengeCard } from '../../components/cards/ChallengeCard'
import { Badge } from '../../components/common'
import { ClubSelectionModal } from '../../components/modals/ClubSelectionModal'
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../utils/constants'

export const ChallengesScreen = ({ navigation }) => {
  const { 
    userChallenges, 
    clubChallenges, 
    userStats,
    loading, 
    loadUserChallenges, 
    loadClubChallenges,
    loadUserStats,
    participateInChallenge,
    abandonChallenge,
    participateClubsInChallenge,
    removeClubFromChallenge
  } = useChallengeStore()
  
  const user = useAuthStore((s) => s.user)
  const [activeTab, setActiveTab] = useState('user') // 'user' | 'club'
  const [refreshing, setRefreshing] = useState(false)
  const [participatingChallenges, setParticipatingChallenges] = useState(new Set())
  const [clubSelectionModal, setClubSelectionModal] = useState({
    visible: false,
    challenge: null
  })

  useEffect(() => {
    if (user?.id) {
      loadUserChallenges(user.id)
      loadClubChallenges(user.id)
      loadUserStats(user.id)
    }
  }, [user?.id])

  // Refresh automatique à chaque fois que l'écran reçoit le focus
  useFocusEffect(
    useCallback(() => {
      console.log('🏆 [FOCUS] ChallengesScreen reçoit le focus - refresh automatique')
      if (user?.id) {
        loadUserChallenges(user.id)
        loadClubChallenges(user.id)
        loadUserStats(user.id)
      }
    }, [user?.id, loadUserChallenges, loadClubChallenges, loadUserStats])
  )

  const onRefresh = useCallback(async () => {
    if (!user?.id) return
    setRefreshing(true)
    try {
      await Promise.all([
        loadUserChallenges(user.id),
        loadClubChallenges(user.id),
        loadUserStats(user.id)
      ])
    } catch (error) {
      console.error('Error refreshing challenges:', error)
    } finally {
      setRefreshing(false)
    }
  }, [user?.id, loadUserChallenges, loadClubChallenges, loadUserStats])

  const handleParticipate = async (challenge) => {
    if (!user?.id) {
      return Alert.alert('Connexion requise', 'Veuillez vous connecter pour participer aux challenges')
    }
    
    // Éviter les clics multiples
    if (participatingChallenges.has(challenge.id)) {
      return
    }
    
    const isParticipating = challenge.userParticipation?.status === 'en_cours'
    
    if (isParticipating) {
      // Abandonner le challenge
      Alert.alert(
        'Abandonner le challenge',
        `Êtes-vous sûr de vouloir abandonner le challenge "${challenge.title}" ? Cette action est irréversible.`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Abandonner',
            style: 'destructive',
            onPress: async () => {
              setParticipatingChallenges(prev => new Set(prev).add(challenge.id))
              try {
                const result = await abandonChallenge(challenge.id, user.id)
                if (result.success) {
                  Alert.alert('Challenge abandonné', 'Vous ne participez plus à ce challenge')
                  // Refresh les données pour avoir les vrais compteurs
                  await Promise.all([
                    loadUserChallenges(user.id),
                    loadClubChallenges(user.id)
                  ])
                } else {
                  Alert.alert('Erreur', result.error || 'Impossible d\'abandonner le challenge')
                }
              } catch (error) {
                Alert.alert('Erreur', 'Une erreur est survenue lors de l\'abandon')
              } finally {
                setParticipatingChallenges(prev => {
                  const newSet = new Set(prev)
                  newSet.delete(challenge.id)
                  return newSet
                })
              }
            }
          }
        ]
      )
    } else {
      // Participer au challenge
      setParticipatingChallenges(prev => new Set(prev).add(challenge.id))
      try {
        const result = await participateInChallenge(challenge.id, user.id)
        if (result.success) {
          Alert.alert('🎉 Participation confirmée !', `Vous participez maintenant au challenge "${challenge.title}"`)
          // Refresh les données pour avoir les vrais compteurs
          await Promise.all([
            loadUserChallenges(user.id),
            loadClubChallenges(user.id)
          ])
        } else {
          Alert.alert('Erreur', result.error || 'Impossible de participer au challenge')
        }
      } catch (error) {
        Alert.alert('Erreur', 'Une erreur est survenue lors de la participation')
      } finally {
        setParticipatingChallenges(prev => {
          const newSet = new Set(prev)
          newSet.delete(challenge.id)
          return newSet
        })
      }
    }
  }

  const handleClubChallengeParticipate = async (challenge) => {
    if (!user?.id) {
      return Alert.alert('Connexion requise', 'Veuillez vous connecter pour gérer les challenges de club')
    }

    // Vérifier si l'utilisateur possède des clubs
    if (!challenge.ownedClubs || challenge.ownedClubs.length === 0) {
      return Alert.alert(
        'Aucun club possédé',
        'Vous devez être propriétaire d\'un club pour pouvoir l\'inscrire aux challenges. Créez un club d\'abord !'
      )
    }

    // Ouvrir le modal de sélection des clubs
    setClubSelectionModal({
      visible: true,
      challenge: challenge
    })
  }

  const handleSelectClubs = async (selectedClubIds) => {
    const challenge = clubSelectionModal.challenge
    if (!challenge || !selectedClubIds.length) return

    setParticipatingChallenges(prev => new Set(prev).add(challenge.id))
    try {
      const result = await participateClubsInChallenge(challenge.id, selectedClubIds, user.id)
      if (result.success) {
        const clubNames = selectedClubIds.length === 1 ? 'le club sélectionné' : `${selectedClubIds.length} clubs`
        Alert.alert(
          '🏆 Inscription confirmée !', 
          `${clubNames} participe${selectedClubIds.length > 1 ? 'nt' : ''} maintenant au challenge "${challenge.title}"`
        )
        // Refresh les données
        await Promise.all([
          loadUserChallenges(user.id),
          loadClubChallenges(user.id)
        ])
      } else {
        Alert.alert('Erreur', result.error || 'Impossible d\'inscrire les clubs au challenge')
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'inscription')
    } finally {
      setParticipatingChallenges(prev => {
        const newSet = new Set(prev)
        newSet.delete(challenge.id)
        return newSet
      })
    }
  }

  const handleRemoveClubFromChallenge = async (challenge, clubId) => {
    Alert.alert(
      'Désinscrire le club',
      'Êtes-vous sûr de vouloir retirer ce club du challenge ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Désinscrire',
          style: 'destructive',
          onPress: async () => {
            setParticipatingChallenges(prev => new Set(prev).add(challenge.id))
            try {
              const result = await removeClubFromChallenge(challenge.id, clubId, user.id)
              if (result.success) {
                Alert.alert('Club désinscrit', 'Le club ne participe plus à ce challenge')
                // Refresh les données
                await Promise.all([
                  loadUserChallenges(user.id),
                  loadClubChallenges(user.id)
                ])
              } else {
                Alert.alert('Erreur', result.error || 'Impossible de désinscrire le club')
              }
            } catch (error) {
              Alert.alert('Erreur', 'Une erreur est survenue lors de la désinscription')
            } finally {
              setParticipatingChallenges(prev => {
                const newSet = new Set(prev)
                newSet.delete(challenge.id)
                return newSet
              })
            }
          }
        }
      ]
    )
  }

  const handleChallengePress = (challenge) => {
    navigation.navigate('ChallengeDetail', { 
      challengeId: challenge.id,
      challengeType: activeTab 
    })
  }

  const renderUserStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{userStats?.totalXP || 0}</Text>
        <Text style={styles.statLabel}>XP Total</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{userStats?.completedChallenges || 0}</Text>
        <Text style={styles.statLabel}>Challenges réussis</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{userStats?.badges || 0}</Text>
        <Text style={styles.statLabel}>Badges</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{userStats?.currentStreak || 0}</Text>
        <Text style={styles.statLabel}>Série actuelle</Text>
      </View>
    </View>
  )

  const renderRecentBadges = () => {
    if (!userStats?.recentBadges?.length) return null
    
    return (
      <View style={styles.badgesSection}>
        <Text style={styles.sectionTitle}>🏅 Badges récents</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesScroll}>
          {userStats.recentBadges.map((badge, index) => (
            <View key={index} style={styles.badgeItem}>
              <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
              <Text style={styles.badgeName}>{badge.name}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    )
  }

  const renderChallengeItem = ({ item: challenge }) => (
    <ChallengeCard
      challenge={challenge}
      onPress={() => handleChallengePress(challenge)}
      onParticipate={() => activeTab === 'user' ? handleParticipate(challenge) : handleClubChallengeParticipate(challenge)}
      onRemoveClub={activeTab === 'club' ? handleRemoveClubFromChallenge : undefined}
      type={activeTab}
      isProcessing={participatingChallenges.has(challenge.id)}
    />
  )

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>
        {activeTab === 'user' ? '🎯' : '🏆'}
      </Text>
      <Text style={styles.emptyTitle}>
        {activeTab === 'user' ? 'Aucun challenge personnel' : 'Aucun challenge de club'}
      </Text>
      <Text style={styles.emptyText}>
        {activeTab === 'user' 
          ? 'Les challenges personnels vous permettent de gagner de l\'XP et des badges individuels.'
          : 'Les challenges de club vous permettent de collaborer avec votre équipe pour des récompenses communes.'
        }
      </Text>
    </View>
  )

  const currentChallenges = activeTab === 'user' ? userChallenges : clubChallenges

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Challenges</Text>
        <Text style={styles.subtitle}>Relevez des défis et gagnez des récompenses !</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'user' && styles.tabButtonActive]}
          onPress={() => setActiveTab('user')}
        >
          <Text style={[styles.tabText, activeTab === 'user' && styles.tabTextActive]}>
            🎯 Personnels
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'club' && styles.tabButtonActive]}
          onPress={() => setActiveTab('club')}
        >
          <Text style={[styles.tabText, activeTab === 'club' && styles.tabTextActive]}>
            🏆 Clubs
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={currentChallenges}
        renderItem={renderChallengeItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        ListHeaderComponent={
          activeTab === 'user' ? (
            <View>
              {renderUserStats()}
              {renderRecentBadges()}
            </View>
          ) : null
        }
        ListEmptyComponent={!loading ? renderEmptyState : null}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal de sélection des clubs */}
      <ClubSelectionModal
        visible={clubSelectionModal.visible}
        onClose={() => setClubSelectionModal({ visible: false, challenge: null })}
        clubs={clubSelectionModal.challenge?.ownedClubs || []}
        challenge={clubSelectionModal.challenge}
        onSelectClubs={handleSelectClubs}
        participatingClubIds={clubSelectionModal.challenge?.clubParticipations?.map(p => p.club_id) || []}
        loading={participatingChallenges.has(clubSelectionModal.challenge?.id)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
  },
  tabButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundSecondary,
    marginHorizontal: SPACING.xs,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  tabText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  list: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    alignItems: 'center',
    ...SHADOWS.base,
  },
  statNumber: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  badgesSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  badgesScroll: {
    paddingVertical: SPACING.sm,
  },
  badgeItem: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginRight: SPACING.sm,
    alignItems: 'center',
    minWidth: 80,
    ...SHADOWS.base,
  },
  badgeEmoji: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  badgeName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeights.relaxed,
  },
})

export default ChallengesScreen