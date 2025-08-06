// src/components/cards/UserCard.js
import React from 'react'
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native'
import { Avatar, Badge, Button } from '../common'
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../utils/constants'
import { getLevelFromXP } from '../../utils/constants'

const UserCard = ({
  user,
  onPress,
  onFollow,
  onMessage,
  showFollowButton = true,
  showMessageButton = false,
  showStats = true,
  variant = 'default', // default, compact, detailed
  style,
  ...props
}) => {
  const isFollowing = user.isFollowing
  const userLevel = getLevelFromXP(user.xp || 0)
  
  const handleFollowPress = () => {
    onFollow?.(user.id, !isFollowing)
  }

  const handleMessagePress = () => {
    onMessage?.(user.id)
  }

  // Version compacte (pour les listes)
  if (variant === 'compact') {
    return (
      <TouchableOpacity 
        style={[styles.userCardCompact, style]} 
        onPress={() => onPress?.(user)}
        {...props}
      >
        <Avatar
          source={{ uri: user.avatar_url }}
          name={user.username}
          size="medium"
          xp={user.xp}
          showBadge={true}
        />
        
        <View style={styles.userInfoCompact}>
          <Text style={styles.usernameCompact} numberOfLines={1}>
            {user.username}
          </Text>
          {user.bio && (
            <Text style={styles.bioCompact} numberOfLines={1}>
              {user.bio}
            </Text>
          )}
          <Text style={styles.levelCompact}>
            {userLevel.icon} {userLevel.name}
          </Text>
        </View>
        
        {showFollowButton && (
          <Button
            title={isFollowing ? "Suivi" : "Suivre"}
            variant={isFollowing ? "outline" : "primary"}
            size="small"
            onPress={handleFollowPress}
          />
        )}
      </TouchableOpacity>
    )
  }

  // Version détaillée (pour les suggestions, recherche)
  return (
    <TouchableOpacity 
      style={[styles.userCard, style]} 
      onPress={() => onPress?.(user)}
      activeOpacity={0.9}
      {...props}
    >
      {/* Header avec avatar et infos principales */}
      <View style={styles.userHeader}>
        <Avatar
          source={{ uri: user.avatar_url }}
          name={user.username}
          size="large"
          xp={user.xp}
          showBadge={true}
        />
        
        <View style={styles.userMainInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.username} numberOfLines={1}>
              {user.username}
            </Text>
            {user.isVerified && (
              <Text style={styles.verifiedBadge}>✓</Text>
            )}
          </View>
          
          {/* Niveau avec progression */}
          <View style={styles.levelContainer}>
            <Badge 
              text={`${userLevel.icon} ${userLevel.name}`}
              variant="secondary"
              size="small"
            />
            <Text style={styles.xpText}>{user.xp || 0} XP</Text>
          </View>
          
          {/* Bio */}
          {user.bio && (
            <Text style={styles.bio} numberOfLines={2}>
              {user.bio}
            </Text>
          )}
        </View>
      </View>
      
      {/* Statistiques */}
      {showStats && (
        <View style={styles.userStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.sessionsCount || 0}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.followersCount || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.challengesCompleted || 0}</Text>
            <Text style={styles.statLabel}>Défis</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {Math.floor((user.xp || 0) / 100)}
            </Text>
            <Text style={styles.statLabel}>Niveau</Text>
          </View>
        </View>
      )}
      
      {/* Contraintes/Préférences culinaires */}
      {user.cookConstraints?.length > 0 && (
        <View style={styles.constraintsContainer}>
          <Text style={styles.constraintsLabel}>Préférences :</Text>
          <View style={styles.constraintsTags}>
            {user.cookConstraints.slice(0, 3).map((constraint, index) => (
              <Badge 
                key={index}
                text={constraint} 
                variant="info" 
                size="small" 
              />
            ))}
            {user.cookConstraints.length > 3 && (
              <Text style={styles.moreConstraints}>
                +{user.cookConstraints.length - 3}
              </Text>
            )}
          </View>
        </View>
      )}
      
      {/* Actions */}
      <View style={styles.userActions}>
        {showFollowButton && (
          <Button
            title={isFollowing ? "✓ Suivi" : "➕ Suivre"}
            variant={isFollowing ? "outline" : "primary"}
            size="medium"
            onPress={handleFollowPress}
            style={[
              styles.actionButton,
              !showMessageButton && styles.fullWidthButton
            ]}
          />
        )}
        
        {showMessageButton && (
          <Button
            title="💬 Message"
            variant="secondary"
            size="medium"
            onPress={handleMessagePress}
            style={styles.actionButton}
          />
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  // Version compacte
  userCardCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.base,
    marginVertical: SPACING.xs,
    ...SHADOWS.sm,
  },
  userInfoCompact: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  usernameCompact: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
  },
  bioCompact: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  levelCompact: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  
  // Version détaillée
  userCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    ...SHADOWS.base,
  },
  userHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  userMainInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  username: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    flex: 1,
  },
  verifiedBadge: {
    fontSize: 16,
    color: COLORS.success,
    marginLeft: SPACING.xs,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  xpText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textMuted,
    marginLeft: SPACING.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  bio: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.4,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  constraintsContainer: {
    marginBottom: SPACING.md,
  },
  constraintsLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  constraintsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    alignItems: 'center',
  },
  moreConstraints: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  userActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  fullWidthButton: {
    flex: 1,
  },
})

export { UserCard }