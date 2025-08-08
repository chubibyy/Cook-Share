// src/screens/home/SessionDetailScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useSessionStore } from '../../stores/sessionStore';
import { useAuthStore } from '../../stores/authStore';
import { Avatar, Badge, Button } from '../../components/common';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, DIFFICULTY_LEVELS } from '../../utils/constants';
import { formatTimeAgo } from '../../utils/helpers';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const SessionDetailScreen = ({ route, navigation }) => {
  const { sessionId } = route.params;
  const { user } = useAuthStore();
  const { 
    currentSession,
    loading,
    getSessionById,
    toggleLike,
    toggleSave,
    addComment
  } = useSessionStore();

  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    if (sessionId) {
      getSessionById(sessionId);
    }
  }, [sessionId, getSessionById]);

  const handleLike = async () => {
    if (currentSession) {
      await toggleLike(currentSession.id);
    }
  };

  const handleSave = async () => {
    if (currentSession) {
      await toggleSave(currentSession.id);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !currentSession) return;

    setCommentLoading(true);
    try {
      await addComment(currentSession.id, commentText.trim());
      setCommentText('');
      Alert.alert('Succès', 'Commentaire ajouté !');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le commentaire');
    } finally {
      setCommentLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h${mins}min` : `${hours}h`;
  };

  const getDifficultyInfo = (level) => {
    return DIFFICULTY_LEVELS[level] || DIFFICULTY_LEVELS[1];
  };

  if (loading || !currentSession) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={[styles.actionIcon, currentSession.isSaved && styles.savedIcon]}>
              {currentSession.isSaved ? '🔖' : '📌'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Hero Image */}
          {currentSession.photo_url ? (
            <View style={styles.heroImageContainer}>
              <Image 
                source={{ uri: currentSession.photo_url }}
                style={styles.heroImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.3)']}
                style={styles.heroOverlay}
              />
            </View>
          ) : (
            <View style={styles.heroPlaceholder}>
              <Text style={styles.heroPlaceholderIcon}>🍽️</Text>
              <Text style={styles.heroPlaceholderText}>Aucune image</Text>
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>
            {/* User Info */}
            <View style={styles.userSection}>
              <Avatar
                source={{ uri: currentSession.user?.avatar_url }}
                size="medium"
                name={currentSession.user?.username}
                xp={currentSession.user?.xp}
                showBadge={true}
              />
              <View style={styles.userInfo}>
                <Text style={styles.username}>{currentSession.user?.username}</Text>
                <Text style={styles.timeAgo}>
                  {formatTimeAgo(currentSession.created_at)}
                </Text>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>{currentSession.title}</Text>

            {/* Info Pills */}
            <View style={styles.infoSection}>
              <View style={styles.infoPill}>
                <Text style={styles.infoPillIcon}>⏱️</Text>
                <Text style={styles.infoPillText}>{formatDuration(currentSession.duration)}</Text>
              </View>
              
              <View style={styles.infoPill}>
                <Text style={styles.infoPillIcon}>{getDifficultyInfo(currentSession.difficulty).icon}</Text>
                <Text style={styles.infoPillText}>{getDifficultyInfo(currentSession.difficulty).name}</Text>
              </View>
              
              {currentSession.cuisine_type && (
                <View style={styles.infoPill}>
                  <Text style={styles.infoPillIcon}>🌍</Text>
                  <Text style={styles.infoPillText}>{currentSession.cuisine_type}</Text>
                </View>
              )}
            </View>

            {/* Ingredients */}
            {currentSession.ingredients && currentSession.ingredients.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🥘 Ingrédients</Text>
                <View style={styles.ingredientsList}>
                  {currentSession.ingredients.map((ingredient, index) => (
                    <View key={index} style={styles.ingredientItem}>
                      <Text style={styles.ingredientBullet}>•</Text>
                      <Text style={styles.ingredientText}>{ingredient}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Tags */}
            {Array.isArray(currentSession.tags) && currentSession.tags.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏷️ Tags</Text>
                <View style={styles.tagsContainer}>
                  {currentSession.tags.map((tag) => (
                    <Badge
                      key={String(tag)}
                      text={`#${tag}`}
                      variant="info"
                      size="small"
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Actions */}
            <View style={styles.actionsSection}>
              <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                <Text style={[styles.actionButtonIcon, currentSession.isLiked && styles.likedIcon]}>
                  {currentSession.isLiked ? '❤️' : '🤍'}
                </Text>
                <Text style={styles.actionButtonText}>
                  {currentSession.likesCount || 0}
                </Text>
              </TouchableOpacity>

              <View style={styles.actionButton}>
                <Text style={styles.actionButtonIcon}>💬</Text>
                <Text style={styles.actionButtonText}>
                  {currentSession.commentsCount || 0}
                </Text>
              </View>

              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonIcon}>📤</Text>
                <Text style={styles.actionButtonText}>Partager</Text>
              </TouchableOpacity>
            </View>

            {/* Comments Section */}
            <View style={styles.commentsSection}>
              <Text style={styles.sectionTitle}>💬 Commentaires</Text>
              
              {/* Add Comment */}
              <View style={styles.addCommentContainer}>
                <Avatar
                  source={{ uri: user?.avatar_url }}
                  size="small"
                  name={user?.username}
                />
                <View style={styles.commentInputContainer}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Ajouter un commentaire..."
                    placeholderTextColor={COLORS.textSecondary}
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                    maxLength={500}
                  />
                  <TouchableOpacity
                    style={[styles.commentButton, (!commentText.trim() || commentLoading) && styles.commentButtonDisabled]}
                    onPress={handleAddComment}
                    disabled={!commentText.trim() || commentLoading}
                  >
                    {commentLoading ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Text style={styles.commentButtonText}>➤</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Comments List */}
              {currentSession.comments && currentSession.comments.length > 0 ? (
                <View style={styles.commentsList}>
                  {currentSession.comments.map((comment) => (
                    <View key={comment.id} style={styles.commentItem}>
                      <Avatar
                        source={{ uri: comment.user?.avatar_url }}
                        size="small"
                        name={comment.user?.username}
                      />
                      <View style={styles.commentContent}>
                        <View style={styles.commentBubble}>
                          <Text style={styles.commentAuthor}>{comment.user?.username}</Text>
                          <Text style={styles.commentText}>{comment.content}</Text>
                        </View>
                        <Text style={styles.commentTime}>
                          {formatTimeAgo(comment.created_at)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.noComments}>
                  <Text style={styles.noCommentsText}>Aucun commentaire pour le moment</Text>
                  <Text style={styles.noCommentsSubtext}>Soyez le premier à commenter !</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  actionIcon: {
    fontSize: 20,
  },
  savedIcon: {
    transform: [{ scale: 1.1 }],
  },
  loadingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  heroImageContainer: {
    height: screenHeight * 0.4,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  heroPlaceholder: {
    height: screenHeight * 0.4,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlaceholderIcon: {
    fontSize: 64,
    opacity: 0.3,
  },
  heroPlaceholderText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  userInfo: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  username: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
  },
  timeAgo: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.lg,
    lineHeight: TYPOGRAPHY.sizes.xxl * 1.3,
  },
  infoSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    ...SHADOWS.sm,
  },
  infoPillIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  infoPillText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  ingredientsList: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  ingredientBullet: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.primary,
    marginRight: SPACING.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  ingredientText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text,
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  actionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.xl,
  },
  actionButtonIcon: {
    fontSize: 18,
    marginRight: SPACING.xs,
  },
  likedIcon: {
    transform: [{ scale: 1.2 }],
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  commentsSection: {
    marginBottom: SPACING.xxxl,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  commentInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginLeft: SPACING.sm,
  },
  commentInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    maxHeight: 100,
  },
  commentButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  commentButtonDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  commentButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  commentsList: {
    gap: SPACING.md,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commentContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  commentBubble: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  commentAuthor: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  commentText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text,
    lineHeight: TYPOGRAPHY.sizes.base * 1.4,
  },
  commentTime: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    marginLeft: SPACING.md,
  },
  noComments: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  noCommentsText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  noCommentsSubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textMuted,
  },
});