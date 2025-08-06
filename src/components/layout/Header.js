// src/components/layout/Header.js
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Avatar, Badge } from '../common'
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../utils/constants'
import { getLevelFromXP, getProgressToNextLevel } from '../../utils/constants'

const Header = ({
  title,
  subtitle,
  user,
  showAvatar = false,
  showXPBar = false,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  onAvatarPress,
  style,
  ...props
}) => {
  const userLevel = user ? getLevelFromXP(user.xp || 0) : null
  const { progress, xpToNext, nextLevel } = user ? getProgressToNextLevel(user.xp || 0) : {}

  return (
    <View style={[styles.container, style]} {...props}>
      {/* Header principal */}
      <View style={styles.header}>
        {/* Left Side */}
        <View style={styles.leftSide}>
          {leftIcon && (
            <TouchableOpacity onPress={onLeftPress} style={styles.iconButton}>
              {leftIcon}
            </TouchableOpacity>
          )}
          
          {showAvatar && user && (
            <TouchableOpacity onPress={onAvatarPress} style={styles.avatarContainer}>
              <Avatar
                source={{ uri: user.avatar_url }}
                name={user.username}
                size="medium"
                xp={user.xp}
                showBadge={true}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Center */}
        <View style={styles.center}>
          {title && (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Side */}
        <View style={styles.rightSide}>
          {rightIcon && (
            <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
              {rightIcon}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Barre XP (optionnelle) */}
      {showXPBar && user && (
        <View style={styles.xpContainer}>
          <View style={styles.xpInfo}>
            <View style={styles.levelBadge}>
              <Badge 
                text={`${userLevel.icon} ${userLevel.name}`}
                variant="primary"
                size="small"
              />
            </View>
            <Text style={styles.xpText}>
              {user.xp || 0} XP
              {nextLevel && ` • ${xpToNext} pour ${nextLevel.name}`}
            </Text>
          </View>
          
          <View style={styles.xpBarContainer}>
            <View style={styles.xpBarBackground}>
              <View 
                style={[
                  styles.xpBarFill, 
                  { 
                    width: `${progress * 100}%`,
                    backgroundColor: userLevel.color 
                  }
                ]} 
              />
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...SHADOWS.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  leftSide: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  center: {
    flex: 2,
    alignItems: 'center',
  },
  rightSide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  iconButton: {
    padding: SPACING.sm,
    borderRadius: RADIUS.base,
  },
  avatarContainer: {
    marginLeft: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  xpContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  xpInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  xpBarContainer: {
    width: '100%',
  },
  xpBarBackground: {
    height: 6,
    backgroundColor: COLORS.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 3,
  },
})

export { Header }