
// src/components/cards/ChallengeCard.js
import React from 'react'
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Badge, Button } from '../common'
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../utils/constants'

const ChallengeCard = ({
  challenge,
  onPress,
  onParticipate,
  type = 'user', // 'user' or 'club'
  isProcessing = false,
  style,
  ...props
}) => {
  const isActive = new Date(challenge.end_date) > new Date()
  const isParticipating = challenge.userParticipation?.status === 'en_cours'
  const isCompleted = challenge.userParticipation?.status === 'reussi'
  
  const calculateTimeLeft = () => {
    const endDate = new Date(challenge.end_date)
    const now = new Date()
    const diffTime = endDate - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 0) return 'Terminé'
    if (diffDays === 1) return '1 jour'
    return `${diffDays} jours`
  }

  const getStatusColor = () => {
    if (isCompleted) return COLORS.success
    if (isParticipating) return COLORS.warning
    if (isActive) return COLORS.primary
    return COLORS.textMuted
  }

  const getStatusText = () => {
    if (isCompleted) return '✅ Réussi'
    if (isParticipating) return '🔥 En cours'
    if (isActive) return '🎯 Disponible'
    return '⏰ Terminé'
  }

  return (
    <TouchableOpacity 
      style={[styles.card, style]} 
      onPress={() => onPress?.(challenge)}
      activeOpacity={0.9}
      {...props}
    >
      {/* Header avec image et overlay */}
      <View style={styles.header}>
        <Image 
          source={{ uri: challenge.challenge_img }} 
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
          style={styles.overlay}
        />
        
        {/* Badge XP */}
        <View style={styles.xpBadge}>
          <LinearGradient
            colors={[COLORS.accent, COLORS.accentDark]}
            style={styles.xpBadgeGradient}
          >
            <Text style={styles.xpText}>+{challenge.reward_xp} XP</Text>
          </LinearGradient>
        </View>
        
        {/* Timer */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            ⏰ {calculateTimeLeft()}
          </Text>
        </View>
      </View>
      
      {/* Contenu */}
      <View style={styles.content}>
        {/* Status et titre */}
        <View style={styles.titleSection}>
          <View style={styles.badgeRow}>
            <Badge 
              text={getStatusText()} 
              variant={isCompleted ? 'success' : isParticipating ? 'warning' : 'primary'}
              size="small"
            />
            {type === 'club' && challenge.club && (
              <Badge 
                text={`🏆 ${challenge.club.name}`} 
                variant="info"
                size="small"
              />
            )}
          </View>
          <Text style={styles.title}>{challenge.title}</Text>
        </View>
        
        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {challenge.description}
        </Text>
        
        {/* Contrainte */}
        <View style={styles.constraintContainer}>
          <Text style={styles.constraintLabel}>Contrainte:</Text>
          <Text style={styles.constraintText}>{challenge.constraint_text}</Text>
        </View>
        
        {/* Footer avec participants et action */}
        <View style={styles.footer}>
          <View style={styles.participantsInfo}>
            <Text style={styles.participantsText}>
              👥 {challenge.participantsCount || 0} participants
            </Text>
          </View>
          
          {isActive && !isCompleted && (
            <Button
              title={
                isProcessing ? "..." : 
                isParticipating ? "Abandonner" : "Participer"
              }
              variant={isParticipating ? "outline" : "primary"}
              size="small"
              onPress={() => onParticipate?.(challenge)}
              style={styles.actionButton}
              disabled={isProcessing}
            />
          )}
          
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>🏆 Défi réussi!</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.sm,
    overflow: 'hidden',
    ...SHADOWS.base,
  },
  header: {
    position: 'relative',
    height: 120,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  xpBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  xpBadgeGradient: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  xpText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  timerContainer: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  timerText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  content: {
    padding: SPACING.md,
  },
  titleSection: {
    marginBottom: SPACING.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.sizes.base * 1.4,
    marginBottom: SPACING.sm,
  },
  constraintContainer: {
    backgroundColor: COLORS.primaryAlpha,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
  },
  constraintLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
  },
  constraintText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantsInfo: {
    flex: 1,
  },
  participantsText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  actionButton: {
    minWidth: 100,
  },
  completedBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  completedText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
})

export { ChallengeCard }