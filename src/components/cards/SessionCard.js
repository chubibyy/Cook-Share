// src/components/cards/SessionCard.js
import React, { useState, useRef, useEffect } from 'react'
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  Animated 
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Avatar, Badge } from '../common'
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../utils/constants'

const { width: screenWidth } = Dimensions.get('window')
const CARD_WIDTH = screenWidth - (SPACING.md * 2)

const SessionCard = ({
  session,
  onPress,
  onLike,
  onComment,
  onSave,
  onUserPress,
  style,
  ...props
}) => {
  const [liked, setLiked] = useState(session.isLiked || false)
  const [saved, setSaved] = useState(session.isSaved || false)
  const [likesCount, setLikesCount] = useState(session.likesCount || 0)
  const [commentsCount, setCommentsCount] = useState(session.commentsCount || 0)
  
  const likeAnimation = useRef(new Animated.Value(1)).current

  // Synchroniser les compteurs avec les props de session
  useEffect(() => {
    setLikesCount(session.likesCount || 0)
    setCommentsCount(session.commentsCount || 0)
    setLiked(session.isLiked || false)
    setSaved(session.isSaved || false)
  }, [session.likesCount, session.commentsCount, session.isLiked, session.isSaved])

  const handleLike = () => {
    const newLikedState = !liked
    setLiked(newLikedState)
    setLikesCount(prevCount => newLikedState ? prevCount + 1 : prevCount - 1)
    
    // Animation de like
    Animated.sequence([
      Animated.timing(likeAnimation, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnimation, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start()
    
    onLike?.(session.id, newLikedState)
  }

  const handleSave = () => {
    setSaved(!saved)
    onSave?.(session.id, !saved)
  }

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h${mins}min` : `${hours}h`
  }

  return (
    <TouchableOpacity 
      style={[styles.card, style]} 
      onPress={() => onPress?.(session)}
      activeOpacity={0.95}
      {...props}
    >
      {/* Image principale avec overlay */}
      <View style={styles.imageContainer}>
        {session.photo_url ? (
          <Image 
            source={{ uri: session.photo_url }} 
            style={styles.image}
            resizeMode="cover"
            onError={(error) => {
              console.error('Image load error for session:', session.id)
              console.error('Photo URL:', session.photo_url)
              console.error('Error details:', error.nativeEvent)
            }}
            onLoad={() => {
              console.log('Image loaded successfully for session:', session.id)
              console.log('Loaded URL:', session.photo_url)
            }}
            onLoadStart={() => {
              console.log('Started loading image:', session.photo_url)
            }}
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>📷</Text>
            <Text style={styles.placeholderSubText}>Pas d'image</Text>
          </View>
        )}
        
        {/* Overlay gradient pour lisibilité */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
          style={styles.imageOverlay}
        />
        
        {/* Badge difficulté */}
        <View style={styles.difficultyBadge}>
          <Badge 
            text={`${session.difficulty}/5`} 
            variant="warning"
            size="small"
          />
        </View>
        
        {/* Durée */}
        <View style={styles.durationContainer}>
          <Text style={styles.durationText}>
            ⏱️ {formatDuration(session.duration)}
          </Text>
        </View>
      </View>
      
      {/* Contenu de la carte */}
      <View style={styles.content}>
        {/* Header avec utilisateur */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.userInfo}
            onPress={() => onUserPress?.(session)}
          >
            <Avatar 
              source={{ uri: session.user.avatar_url }}
              size="small"
              name={session.user.username}
              xp={session.user.xp}
              showBadge={true}
            />
            <View style={styles.userDetails}>
              <Text style={styles.username}>{session.user.username}</Text>
              <Text style={styles.timeAgo}>{session.timeAgo}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleSave}>
            <Text style={[styles.actionIcon, saved && styles.savedIcon]}>
              {saved ? '🔖' : '📑'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Titre */}
        <Text style={styles.title} numberOfLines={2}>
          {session.title}
        </Text>
        
        {/* Tags cuisine */}
        <View style={styles.tagsContainer}>
          {session.cuisine_type && (
            <Badge 
              text={session.cuisine_type} 
              variant="secondary" 
              size="small" 
            />
          )}
          {session.tags?.slice(0, 2).map((tag, index) => (
            <Badge 
              key={index}
              text={`#${tag}`} 
              variant="info" 
              size="small" 
            />
          ))}
        </View>
        
        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.action} onPress={handleLike}>
            <Animated.Text 
              style={[
                styles.actionIcon, 
                liked && styles.likedIcon,
                { transform: [{ scale: likeAnimation }] }
              ]}
            >
              {liked ? '❤️' : '🤍'}
            </Animated.Text>
            <Text style={styles.actionText}>{likesCount}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.action} 
            onPress={() => onComment?.(session)}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>{commentsCount}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.action}>
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.actionText}>Partager</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.sm,
    overflow: 'hidden',
    ...SHADOWS.base,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 48,
    opacity: 0.3,
  },
  placeholderSubText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  difficultyBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  durationContainer: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  durationText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  username: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
  },
  timeAgo: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    lineHeight: TYPOGRAPHY.sizes.lg * 1.3,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: SPACING.xs,
  },
  likedIcon: {
    transform: [{ scale: 1.2 }],
  },
  savedIcon: {
    transform: [{ scale: 1.1 }],
  },
  actionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
})

export { SessionCard }
