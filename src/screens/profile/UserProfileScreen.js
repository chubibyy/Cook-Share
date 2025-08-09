// src/screens/profile/UserProfileScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Share,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';
import { useSessionStore } from '../../stores/sessionStore';
import { useChallengeStore } from '../../stores/challengeStore';
import { Header } from '../../components/layout/Header';
import { SessionCard } from '../../components/cards/SessionCard';
import { Avatar } from '../../components/common';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, getLevelFromXP } from '../../utils/constants';
import { usersService } from '../../services/users';

export const UserProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const { user: currentUser } = useAuthStore();
  const { sessions, loading, loadFeed, refresh } = useSessionStore();
  const { userStats, loadUserStats } = useChallengeStore();

  const [userLoading, setUserLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [badges, setBadges] = useState([]);

  // Filter sessions to show only this user's sessions
  const userSessions = sessions.filter(session => session.user_id === userId);

  useEffect(() => {
    loadUserProfile();
    if (userId) {
      loadFeed(0, 50, userId);
    }
  }, [userId]);

  // Refresh automatique à chaque fois que l'écran reçoit le focus
  useFocusEffect(
    useCallback(() => {
      console.log('👤 [FOCUS] UserProfileScreen reçoit le focus - refresh automatique')
      if (userId) {
        refresh()
        loadUserProfile()
      }
    }, [userId, refresh])
  );

  const loadUserProfile = async () => {
    try {
      const userBadges = await usersService.getUserBadges(userId);
      setBadges(userBadges);
      await loadUserStats(userId);
    } catch (error) {
      console.error('Erreur récupération badges utilisateur:', error);
      Alert.alert('Erreur', "Impossible de charger les badges de l'utilisateur.");
    } finally {
      setUserLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
      await loadUserProfile();
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSessionPress = (session) => {
    navigation.navigate('SessionDetail', { sessionId: session.id });
  };

  const handleUserPress = (session) => {
    navigation.navigate('SessionDetail', { sessionId: session.id });
  };

  const handleLike = async (sessionId) => {
    const { toggleLike } = useSessionStore.getState();
    await toggleLike(sessionId);
  };

  const handleSave = async (sessionId) => {
    const { toggleSave } = useSessionStore.getState();
    await toggleSave(sessionId);
  };

  const handleComment = (session) => {
    navigation.navigate('SessionDetail', { 
      sessionId: session.id, 
      focusComment: true 
    });
  };

  const handleShare = async (sessionId) => {
    if (!sessionId) return
    
    // Trouver la session dans userSessions
    const session = userSessions.find(s => s.id === sessionId)
    if (!session) return
    
    try {
      await Share.share({
        message: `Découvrez cette session de cuisine sur CookShare: ${session.title}\n#CookShareApp`,
      })
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager la session.')
    }
  };

  const ChallengeStatsSection = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Statistiques Challenges</Text>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userStats?.totalXP || 0}</Text>
          <Text style={styles.statLabel}>XP Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userStats?.completedChallenges || 0}</Text>
          <Text style={styles.statLabel}>Perso remportés</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userStats?.clubChallengesWon || 0}</Text>
          <Text style={styles.statLabel}>Clubs remportés</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userStats?.currentStreak || 0}</Text>
          <Text style={styles.statLabel}>Série</Text>
        </View>
      </View>
    </View>
  );

  const BadgesSection = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Collection de Badges ({badges.length})</Text>
      {badges.length === 0 ? (
        <Text style={styles.emptySubtext}>Cet utilisateur n'a pas encore gagné de badge.</Text>
      ) : (
        <FlatList
          data={badges}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => Alert.alert(item.challenge?.title || 'Badge', `Gagné le ${new Date(item.earned_at).toLocaleDateString()}`)}>
              <Image source={{ uri: item.badge_image_url }} style={styles.badgeImage} />
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingVertical: SPACING.sm }}
        />
      )}
    </View>
  );

  const handleGoBack = () => {
    navigation.goBack();
  };

  const renderSessionItem = ({ item }) => (
    <SessionCard
      session={item}
      onPress={() => handleSessionPress(item)}
      onUserPress={handleUserPress}
      onLike={handleLike}
      onSave={handleSave}
      onComment={handleComment}
      onShare={handleShare}
    />
  );

  // Get user info from first session if available
  const displayUser = userSessions.length > 0 ? userSessions[0].user : null;
  const displayLevel = displayUser ? getLevelFromXP(displayUser.xp || 0) : null;

  if (userLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header 
          title="Profil utilisateur" 
          onBackPress={handleGoBack}
          showBackButton={true}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Profil utilisateur" 
        onBackPress={handleGoBack}
        showBackButton={true}
      />
      <FlatList
        data={userSessions}
        renderItem={renderSessionItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
              <Avatar
                source={{ uri: displayUser?.avatar_url }}
                size="large"
                name={displayUser?.username || 'Utilisateur'}
                xp={displayUser?.xp || 0}
                userId={displayUser?.id || userId}
              />
              <View style={styles.userInfo}>
                <Text style={styles.username}>
                  {displayUser?.username || 'Nom d\'utilisateur'}
                </Text>
                <Text style={styles.cookingLevel}>
                  Niveau: {displayLevel?.name || 'Non défini'}
                </Text>
              </View>
            </View>
            <ChallengeStatsSection />
            <BadgesSection />
            <View style={styles.statsContainer}>
              <Text style={styles.sectionTitle}>
                Sessions ({userSessions.length})
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucune session trouv�e</Text>
              <Text style={styles.emptySubtext}>
                Cet utilisateur n'a pas encore publi� de sessions.
              </Text>
            </View>
          )
        }
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  profileHeader: {
    marginBottom: SPACING.lg,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  userInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  username: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  cookingLevel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  statsContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
  },
  sectionContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.sm,
    marginBottom: SPACING.md,
  },
  statsRow: { flexDirection: 'row', marginTop: SPACING.sm },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  statNumber: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.xxxl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  badgeImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: SPACING.md,
    backgroundColor: COLORS.borderLight,
  },
});