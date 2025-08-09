// src/screens/home/HomeScreen.js
import React, { useEffect, useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';
import { useSessionStore } from '../../stores/sessionStore';
import { useChallengeStore } from '../../stores/challengeStore';
import { Header } from '../../components/layout/Header';
import { SessionCard } from '../../components/cards/SessionCard';
import Button from '../../components/common/Button';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../utils/constants';

export const HomeScreen = ({ navigation }) => {
  const { user, signOut, addXP } = useAuthStore();
  const {
    sessions, 
    loading: sessionsLoading, 
    hasMore, 
    loadFeed, 
    loadMore, 
    refresh, 
    toggleLike, 
    toggleSave 
  } = useSessionStore();
  const { popularChallenge, loading: challengeLoading, loadPopularChallenge } = useChallengeStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFeed(true);
    loadPopularChallenge();
  }, [loadFeed, loadPopularChallenge]);

  // Refresh automatique à chaque fois que l'écran reçoit le focus
  useFocusEffect(
    useCallback(() => {
      console.log('🏠 [FOCUS] HomeScreen reçoit le focus - refresh automatique')
      refresh()
      loadPopularChallenge()
    }, [refresh, loadPopularChallenge])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refresh(), loadPopularChallenge()]);
    setRefreshing(false);
  }, [refresh, loadPopularChallenge]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !sessionsLoading) {
      loadMore();
    }
  }, [hasMore, sessionsLoading, loadMore]);

  const handleSessionPress = (session) => {
    navigation.navigate('SessionDetail', { sessionId: session.id });
  };

  const handleUserPress = (session) => {
    navigation.navigate('UserProfileScreen', { userId: session.user_id });
  };

  const handleLike = async (sessionId) => {
    await toggleLike(sessionId);
  };

  const handleSave = async (sessionId) => {
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
    const session = sessions.find(s => s.id === sessionId)
    if (!session) return
    
    try {
      await Share.share({
        message: `Découvrez cette session de cuisine sur CookShare: ${session.title}\n#CookShareApp`,
      })
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager la session.')
    }
  };

  const renderSession = ({ item: session }) => (
    <SessionCard
      session={session}
      onPress={handleSessionPress}
      onUserPress={handleUserPress}
      onLike={handleLike}
      onSave={handleSave}
      onComment={handleComment}
      onShare={handleShare}
      style={styles.sessionCard}
    />
  );

  const renderEmptyFeed = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🍳</Text>
      <Text style={styles.emptyTitle}>Votre feed est vide</Text>
      <Text style={styles.emptyText}>
        Soyez le premier à partager une création culinaire !
      </Text>
      <Button
        title="Créer ma première session"
        onPress={() => navigation.navigate('CreateSession')}
        style={styles.createButton}
      />
    </View>
  );

  const renderFooter = () => {
    if (!sessionsLoading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  const PopularChallenge = () => {
    if (challengeLoading) {
      return <View style={styles.popularChallengeCard}><ActivityIndicator color={COLORS.primary} /></View>
    }

    if (!popularChallenge) {
      return (
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Bonjour {user?.username || 'Chef'} ! 👋
          </Text>
        </View>
      )
    }

    return (
      <TouchableOpacity 
        style={styles.popularChallengeCard}
        onPress={() => navigation.navigate('Challenges', { 
          screen: 'ChallengeDetail', 
          params: { challengeId: popularChallenge.id, challengeType: 'user' } 
        })}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.popularChallengeLabel}>🔥 Challenge du moment</Text>
          <Text style={styles.popularChallengeName} numberOfLines={1}>{popularChallenge.title}</Text>
          <Text style={styles.popularChallengeParticipants}>
            {popularChallenge.participantsCount} participant{popularChallenge.participantsCount > 1 ? 's' : ''}
          </Text>
        </View>
        <Text style={styles.popularChallengeCta}>→</Text>
      </TouchableOpacity>
    )
  }

  const renderHeader = () => (
    <View style={styles.feedHeader}>
      <PopularChallenge />
      
      {sessions.length > 0 && (
        <Text style={styles.sectionTitle}>🔥 Dernières créations</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="PlateUp"
        subtitle="Votre communauté culinaire"
        user={user}
        showAvatar={true}
        showXPBar={true}
        rightIcon={<Text style={{ fontSize: 20 }}>🔔</Text>}
        onRightPress={() => navigation.navigate('Notifications')}
        onAvatarPress={() => navigation.navigate('Profile')}
      />
      
      <FlatList
        data={sessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!sessionsLoading ? renderEmptyFeed : null}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  feedContainer: {
    flexGrow: 1,
    paddingHorizontal: SPACING.md,
  },
  feedHeader: {
    paddingVertical: SPACING.md,
  },
  welcomeSection: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    ...SHADOWS.sm,
    marginBottom: SPACING.lg,
  },
  welcomeText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
  },
  popularChallengeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primaryAlpha,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  popularChallengeLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  popularChallengeName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  popularChallengeParticipants: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  popularChallengeCta: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.light,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  sessionCard: {
    marginVertical: SPACING.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: TYPOGRAPHY.sizes.base * 1.4,
  },
  createButton: {
    alignSelf: 'center',
  },
  footerLoader: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
});
