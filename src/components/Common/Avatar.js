// src/components/common/Avatar.js
import React from 'react'
import { 
  View, 
  Image, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../utils/constants'
import { getLevelFromXP } from '../../utils/constants'

const Avatar = ({
  source,
  size = 'medium', // small, medium, large, xl
  name,
  xp = 0,
  showBadge = false,
  onPress,
  style,
  ...props
}) => {
  const sizeValue = sizes[size]
  const level = getLevelFromXP(xp)
  
  const avatarStyles = [
    styles.avatar,
    { width: sizeValue, height: sizeValue, borderRadius: sizeValue / 2 },
    style
  ]

  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'

  const AvatarContent = () => (
    <View style={styles.container}>
      {source && source.uri ? (
        <Image source={source} style={avatarStyles} {...props} />
      ) : (
        <LinearGradient
          colors={level ? level.gradient : [COLORS.disabled, COLORS.textMuted]}
          style={avatarStyles}
        >
          <Text style={[styles.initials, { fontSize: sizeValue * 0.4 }]}>
            {initials}
          </Text>
        </LinearGradient>
      )}
      
      {showBadge && level && (
        <View style={[styles.badge, badgeSizes[size]]}>
          <Text style={[styles.badgeText, badgeTextSizes[size]]}>
            {level.icon}
          </Text>
        </View>
      )}
    </View>
  )

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress}>
        <AvatarContent />
      </TouchableOpacity>
    )
  }

  return <AvatarContent />
}

const sizes = {
  small: 32,
  medium: 48,
  large: 64,
  xl: 96
}

const badgeSizes = {
  small: { width: 16, height: 16 },
  medium: { width: 20, height: 20 },
  large: { width: 24, height: 24 },
  xl: { width: 32, height: 32 }
}

const badgeTextSizes = {
  small: { fontSize: 8 },
  medium: { fontSize: 10 },
  large: { fontSize: 12 },
  xl: { fontSize: 16 }
}

const avatarStyles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontFamily: TYPOGRAPHY.families.primary,
  },
  badge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.white,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  badgeText: {
    textAlign: 'center',
  }
})

export { Avatar }

