// src/screens/profile/UserProfileScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';
import { useSessionStore } from '../../stores/sessionStore';
import { Header } from '../../components/layout/Header';
import { SessionCard } from '../../components/cards/SessionCard';
import { Avatar, Button } from '../../components/common';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../utils/constants';

export const UserProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const { user: currentUser } = useAuthStore();
  const { sessions, loading, loadFeed, refresh } = useSessionStore();
  
  const [userProfile, setUserProfile] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter sessions to show only this user's sessions
  const userSessions = sessions.filter(session => session.user_id === userId);

  useEffect(() => {
    loadUserProfile();
    if (userId) {
      loadFeed(0, 50, userId);
    }
  }, [userId]);

  const loadUserProfile = async () => {
    // This would typically come from a user service
    // For now, we'll use the session data to get user info
    setUserLoading(false);
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
              />
              <View style={styles.userInfo}>
                <Text style={styles.username}>
                  {displayUser?.username || 'Nom d\'utilisateur'}
                </Text>
                <Text style={styles.cookingLevel}>
                  Niveau: {displayUser?.cooking_level || 'Non d�fini'}
                </Text>
              </View>
            </View>
            
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
});