// src/screens/home/HomeScreen.js
import React, { useEffect, useCallback, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';
import { useSessionStore } from '../../stores/sessionStore';
import { Header } from '../../components/layout/Header';
import { SessionCard } from '../../components/cards/SessionCard';
import Button from '../../components/common/Button';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../utils/constants';

export const HomeScreen = ({ navigation }) => {
  const { user, signOut, addXP } = useAuthStore();
  const { 
    sessions, 
    loading, 
    hasMore, 
    loadFeed, 
    loadMore, 
    refresh, 
    toggleLike, 
    toggleSave 
  } = useSessionStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFeed(true);
  }, [loadFeed]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) {
      loadMore();
    }
  }, [hasMore, loading, loadMore]);

  const handleSessionPress = (session) => {
    console.log('Navigating to session detail:', session.id);
    navigation.navigate('SessionDetail', { sessionId: session.id });
  };

  const handleUserPress = (session) => {
    navigation.navigate('SessionDetail', { sessionId: session.id });
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

  const handleTestXP = async () => {
    const result = await addXP(50, 'test');
    if (result.success) {
      Alert.alert('XP Gagné!', `+${result.xpGained} XP`);
    }
  };

  const renderSession = ({ item: session }) => {
    console.log('Rendering session:', session.id)
    console.log('Session photo_url:', session.photo_url)
    console.log('Full session data:', session)
    
    return (
      <SessionCard
        session={session}
        onPress={handleSessionPress}
        onUserPress={handleUserPress}
        onLike={handleLike}
        onSave={handleSave}
        onComment={handleComment}
        style={styles.sessionCard}
      />
    )
  };

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
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.feedHeader}>
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
          Bonjour {user?.username || 'Chef'} ! 👋
        </Text>
        <TouchableOpacity 
          style={styles.createSessionButton}
          onPress={() => navigation.navigate('CreateSession')}
        >
          <Text style={styles.createSessionText}>➕ Partager une création</Text>
        </TouchableOpacity>
      </View>
      
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
        ListEmptyComponent={!loading ? renderEmptyFeed : null}
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

      {/* Debug section pour développement */}
      {__DEV__ && (
        <View style={styles.debugSection}>
          <Button
            title="Test +50 XP"
            onPress={handleTestXP}
            variant="outline"
            size="small"
            style={{ marginRight: SPACING.sm }}
          />
          <Button
            title="Déconnexion"
            onPress={signOut}
            variant="outline"
            size="small"
          />
        </View>
      )}
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
    marginBottom: SPACING.md,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    ...SHADOWS.sm,
  },
  welcomeText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    flex: 1,
  },
  createSessionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  createSessionText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
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
  debugSection: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    backgroundColor: COLORS.warning + '10',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.warning + '30',
    ...SHADOWS.sm,
  },
});