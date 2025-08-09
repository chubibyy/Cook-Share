// src/components/cards/ClubCard.js
import React, { useEffect, useState } from 'react'
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Avatar, Badge, Button } from '../common'
import { useClubStore } from '../../stores/clubStore'
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../utils/constants'

const ClubCard = ({
  club,
  onPress,
  onJoin,
  onLeave,
  onRequestJoin,
  onShowPendingRequest,
  style,
  ...props
}) => {
  const { checkJoinRequestStatus } = useClubStore()
  const [requestStatus, setRequestStatus] = useState(null)
  const isMember = club.userMembership?.role !== undefined
  const isAdmin = club.userMembership?.role === 'admin' || club.userMembership?.role === 'owner'
  const isPrivate = club.is_private

  useEffect(() => {
    if (isPrivate && !isMember) {
      checkJoinRequestStatus(club.id).then(setRequestStatus)
    }
  }, [club.id, isPrivate, isMember, checkJoinRequestStatus])

  const getMembershipBadgeText = () => {
    if (club.userMembership?.role === 'owner') return '👑 Owner'
    if (isAdmin) return '🛡️ Admin'
    if (isMember) return '✅ Membre'
    return null
  }

  const getJoinButtonText = () => {
    if (club.userMembership?.role === 'owner') return 'Propriétaire'
    if (isMember) return 'Quitter'
    if (isPrivate) {
      if (requestStatus?.status === 'pending') return '✓ Demandé'
      if (requestStatus?.status === 'rejected') return 'Refusé'
      return 'Demander'
    }
    return 'Rejoindre'
  }

  const handleActionPress = async () => {
    if (club.userMembership?.role === 'owner') return
    if (isMember) {
      onLeave?.(club.id)
    } else if (isPrivate) {
      if (requestStatus?.status === 'pending' || requestStatus?.status === 'rejected') return
      
      // Mettre à jour l'état local immédiatement pour le feedback UX
      setRequestStatus({ 
        status: 'pending', 
        requested_at: new Date().toISOString() 
      })
      
      // Puis appeler la fonction de demande
      await onRequestJoin?.(club.id)
    } else {
      onJoin?.(club.id)
    }
  }

  const handleCardPress = () => {
    // Si l'utilisateur a une demande en attente ou refusée, afficher le popup au lieu d'ouvrir le détail
    if (isPrivate && !isMember && requestStatus?.status === 'pending') {
      onShowPendingRequest?.(club, requestStatus)
    } else if (isPrivate && !isMember && requestStatus?.status === 'rejected') {
      onShowPendingRequest?.(club, requestStatus)
    } else {
      onPress?.(club)
    }
  }

  return (
    <TouchableOpacity 
      style={[styles.clubCard, style]} 
      onPress={handleCardPress}
      activeOpacity={0.9}
      {...props}
    >
      {/* Header avec image de fond */}
      <View style={styles.clubHeader}>
        {club.avatar_url ? (
          <Image 
            source={{ uri: club.avatar_url }} 
            style={styles.clubBackgroundImage}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={[COLORS.secondary, COLORS.secondaryDark]}
            style={styles.clubBackgroundGradient}
          />
        )}
        
        {/* Overlay pour lisibilité */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.clubOverlay}
        />
        
        {/* Badge privé */}
        {isPrivate && (
          <View style={styles.privateBadge}>
            <Badge 
              text="🔒 Privé" 
              variant="warning"
              size="small"
            />
          </View>
        )}
        
        {/* Badge de demande en attente/refusée */}
        {isPrivate && !isMember && requestStatus && (
          <View style={styles.requestStatusBadge}>
            <Badge 
              text={requestStatus.status === 'pending' ? '⏳ En attente' : '❌ Refusé'} 
              variant={requestStatus.status === 'pending' ? "warning" : "error"}
              size="small"
            />
          </View>
        )}

        {/* Badge membership */}
        {getMembershipBadgeText() && (
          <View style={[
            styles.membershipBadge,
            (isPrivate && !isMember && requestStatus) && styles.membershipBadgeShifted
          ]}>
            <Badge 
              text={getMembershipBadgeText()} 
              variant={isAdmin ? "warning" : "success"}
              size="small"
            />
          </View>
        )}
        
        {/* Avatar du club */}
        <View style={styles.clubAvatarContainer}>
          <Avatar
            source={{ uri: club.avatar_url }}
            name={club.name}
            size="large"
            style={styles.clubAvatar}
          />
        </View>
      </View>
      
      {/* Contenu */}
      <View style={styles.clubContent}>
        {/* Nom et statistiques */}
        <View style={styles.clubInfo}>
          <Text style={styles.clubName} numberOfLines={1}>
            {club.name}
          </Text>
          <View style={styles.clubStats}>
            <Text style={styles.clubStatText}>
              👥 {club.membersCount || 0} membres
            </Text>
            <Text style={styles.clubStatSeparator}>•</Text>
            <Text style={styles.clubStatText}>
              🍳 {club.sessionsCount || 0} Posts culinaires
            </Text>
          </View>
        </View>
        
        {/* Description */}
        <Text style={styles.clubDescription} numberOfLines={2}>
          {club.description || 'Aucune description disponible.'}
        </Text>
        
        {/* Tags/Catégories */}
        {club.tags?.length > 0 && (
          <View style={styles.clubTags}>
            {club.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index}
                text={`#${tag}`} 
                variant="info" 
                size="small" 
              />
            ))}
          </View>
        )}
        
        {/* Footer avec action */}
        <View style={styles.clubFooter}>
          {/* Aperçu des membres récents */}
          <View style={styles.recentMembers}>
            {club.recentMembers?.slice(0, 3).map((member, index) => (
              <Avatar
                key={member.id}
                source={{ uri: member.avatar_url }}
                name={member.username}
                size="small"
                userId={member.id}
                style={[
                  styles.memberAvatar,
                  index > 0 && { marginLeft: -8 }
                ]}
              />
            ))}
            {club.membersCount > 3 && (
              <Text style={styles.moreMembers}>
                +{club.membersCount - 3}
              </Text>
            )}
          </View>
          
          {/* Bouton d'action */}
          <Button
            title={getJoinButtonText()}
            variant={isMember ? "outline" : 
                     (isPrivate && requestStatus?.status === 'pending') ? "success" : "primary"}
            size="small"
            onPress={handleActionPress}
            disabled={club.userMembership?.role === 'owner' || 
                      (isPrivate && !isMember && (requestStatus?.status === 'pending' || requestStatus?.status === 'rejected'))}
            style={styles.actionButton}
          />
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  clubCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.sm,
    overflow: 'hidden',
    ...SHADOWS.base,
  },
  clubHeader: {
    position: 'relative',
    height: 120,
  },
  clubBackgroundImage: {
    width: '100%',
    height: '100%',
  },
  clubBackgroundGradient: {
    width: '100%',
    height: '100%',
  },
  clubOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  privateBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
  },
  requestStatusBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  membershipBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  membershipBadgeShifted: {
    top: SPACING.sm * 2 + 30, // Décaler vers le bas si badge de demande présent
  },
  clubAvatarContainer: {
    position: 'absolute',
    bottom: -32,
    left: SPACING.md,
  },
  clubAvatar: {
    borderWidth: 3,
    borderColor: COLORS.surface,
  },
  clubContent: {
    padding: SPACING.md,
    paddingTop: SPACING.xl + SPACING.sm,
  },
  clubInfo: {
    marginBottom: SPACING.sm,
  },
  clubName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  clubStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubStatText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  clubStatSeparator: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textMuted,
    marginHorizontal: SPACING.sm,
  },
  clubDescription: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.sizes.base * 1.4,
    marginBottom: SPACING.md,
  },
  clubTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  clubFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  recentMembers: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  moreMembers: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textMuted,
    marginLeft: SPACING.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  actionButton: {
    minWidth: 100,
  },
})

export { ClubCard }

