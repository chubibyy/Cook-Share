import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';
import { useChallengeStore } from '../../stores/challengeStore';
import { usersService } from '../../services/users';
import { supabase } from '../../services/supabase';
import { SessionCard } from '../../components/cards/SessionCard';
import { Avatar, Button } from '../../components/common';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../utils/constants';

export const ProfileScreen = ({ navigation }) => {
  const { user, signOut, loading: authLoading, isInitialized: authInitialized } = useAuthStore();
  const { userStats, loadUserStats } = useChallengeStore();
  const [sessions, setSessions] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      const { data: sessionsData } = await supabase
        .from('cooking_sessions')
        .select('*')
        .eq('user_id', user.id);
      // Ensure each session includes the current user
      setSessions((sessionsData || []).map((s) => ({ ...s, user })));
      const userBadges = await usersService.getUserBadges(user.id);
      setBadges(userBadges);
      await loadUserStats(user.id);
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données du profil.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, loadUserStats]);

  useFocusEffect(
    useCallback(() => {
      if (authInitialized && user?.id) {
        setLoading(true);
        fetchData();
      } else if (authInitialized && !user?.id) {
        setLoading(false);
      }
    }, [authInitialized, user?.id, fetchData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleEditProfile = () => navigation.navigate('EditProfileScreen');
  const handleSignOut = () => {
    Alert.alert('Se déconnecter', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: signOut },
    ]);
  };

  const renderSessionItem = ({ item }) => (
    <SessionCard session={item.user ? item : { ...item, user }} />
  );

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
      <Text style={styles.sectionTitle}>Ma collection de Badges ({badges.length})</Text>
      {badges.length === 0 ? (
        <Text style={styles.emptySubtext}>Aucun badge gagné. Participez à des challenges !</Text>
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

  const ListHeader = ({ user }) => {
    // The parent component (ProfileScreen) ensures 'user' is defined before rendering ListHeader
    // If for some reason user is still undefined here, return null to prevent errors
    if (!user) {
      return null;
    }
    return (
      <View style={styles.profileHeader}>
        <View style={styles.profileInfo}>
          <Avatar source={{ uri: user.avatar_url }} size="large" name={user.username} userId={user.id} />
          <View style={styles.userInfo}>
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.bio} numberOfLines={2}>{user.bio || 'Aucune bio'}</Text>
            <Text style={styles.xp}>✨ {user.xp || 0} XP</Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <Button title="Modifier le profil" onPress={handleEditProfile} style={styles.editButton} />
          <Button title="Se déconnecter" onPress={handleSignOut} style={styles.signOutButton} variant="outline" />
        </View>
        <ChallengeStatsSection />
        <BadgesSection />
        <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>Mes Sessions ({sessions.length})</Text>
      </View>
    );
  };

  if (loading || authLoading || !authInitialized) {
    return <SafeAreaView style={styles.container}><ActivityIndicator style={{flex: 1}} size="large" color={COLORS.primary} /></SafeAreaView>;
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyProfileContainer}>
          <Text style={styles.emptyProfileText}>Veuillez vous connecter pour voir votre profil.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={sessions}
        renderItem={renderSessionItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<ListHeader user={user} />}
        ListEmptyComponent={() => <Text style={styles.emptySubtext}>Partagez votre première création culinaire !</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  contentContainer: { flexGrow: 1, paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl },
  profileHeader: { marginBottom: SPACING.md },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  userInfo: { flex: 1, marginLeft: SPACING.md },
  username: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text, marginBottom: SPACING.xs },
  bio: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  xp: { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.accent, fontWeight: 'bold' },
  actionButtons: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  editButton: { flex: 1 },
  signOutButton: { flex: 1 },
  sectionContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text, marginBottom: SPACING.sm },
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
  emptySubtext: { color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.md },
  badgeImage: { width: 60, height: 60, borderRadius: 30, marginRight: SPACING.md, backgroundColor: COLORS.borderLight },
  emptyProfileContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  emptyProfileText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  loadingProfileText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
});
