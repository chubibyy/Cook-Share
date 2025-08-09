// src/screens/profile/ProfileScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  FlatList,
  ActivityIndicator,
  Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';
import { useSessionStore } from '../../stores/sessionStore';
import { Header } from '../../components/layout/Header';
import { SessionCard } from '../../components/cards/SessionCard';
import { Avatar, Button } from '../../components/common';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../utils/constants';

export const ProfileScreen = ({ navigation }) => {
  const { user, signOut } = useAuthStore();
  const { sessions, loading, loadFeed, refresh, toggleLike, toggleSave } = useSessionStore();
  const [refreshing, setRefreshing] = useState(false);

  // Filter sessions to show only current user's sessions
  const userSessions = sessions.filter(session => session.user_id === user?.id);

  useEffect(() => {
    // Load user's sessions on component mount
    if (user?.id) {
      loadFeed(0, 50, user.id);
    }
  }, [user?.id, loadFeed]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfileScreen');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Se d�connecter',
      '�tes-vous s�r de vouloir vous d�connecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Se d�connecter', 
          style: 'destructive',
          onPress: signOut 
        }
      ]
    );
  };

  const handleSessionPress = (session) => {
    navigation.navigate('SessionDetailScreen', { sessionId: session.id });
  };

  const handleUserPress = (session) => {
    navigation.navigate('SessionDetailScreen', { sessionId: session.id });
  };

  const handleLike = async (sessionId) => {
    await toggleLike(sessionId);
  };

  const handleSave = async (sessionId) => {
    await toggleSave(sessionId);
  };

  const handleComment = (session) => {
    navigation.navigate('SessionDetailScreen', { 
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

  if (loading && userSessions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Profil" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Profil" />
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
                source={{ uri: user?.avatar_url }}
                size="large"
                name={user?.username}
              />
              <View style={styles.userInfo}>
                <Text style={styles.username}>{user?.username}</Text>
                <Text style={styles.bio}>{user?.bio || 'Aucune bio'}</Text>
                <Text style={styles.cookingLevel}>
                  Niveau: {user?.cooking_level || 'Non d�fini'}
                </Text>
                <Text style={styles.xp}>XP: {user?.xp || 0}</Text>
              </View>
            </View>
            
            <View style={styles.actionButtons}>
              <Button
                title="Modifier le profil"
                onPress={handleEditProfile}
                style={styles.editButton}
              />
              <Button
                title="Se d�connecter"
                onPress={handleSignOut}
                style={styles.signOutButton}
                variant="outline"
              />
            </View>
            
            <View style={styles.statsContainer}>
              <Text style={styles.sectionTitle}>Mes Sessions ({userSessions.length})</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucune session trouv�e</Text>
              <Text style={styles.emptySubtext}>
                Cr�ez votre premi�re session de cuisine !
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
  bio: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  cookingLevel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginBottom: SPACING.xs,
  },
  xp: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textMuted,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  editButton: {
    flex: 1,
  },
  signOutButton: {
    flex: 1,
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