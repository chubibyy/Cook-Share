// src/components/common/Button.js
import React from 'react'
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  Dimensions 
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../utils/constants'

const { width: screenWidth } = Dimensions.get('window')

const Button = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline, ghost
  size = 'medium', // small, medium, large
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  ...props
}) => {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style
  ]

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
    disabled && styles.textDisabled,
    textStyle
  ]

  const renderContent = () => (
    <>
      {leftIcon && <span style={styles.leftIcon}>{leftIcon}</span>}
      {loading ? (
        <ActivityIndicator 
          size={size === 'small' ? 16 : 20} 
          color={variant === 'primary' ? COLORS.white : COLORS.primary} 
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
      {rightIcon && <span style={styles.rightIcon}>{rightIcon}</span>}
    </>
  )

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.base, styles[size], fullWidth && styles.fullWidth]}
        {...props}
      >
        <LinearGradient
          colors={disabled ? [COLORS.disabled, COLORS.disabled] : [COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, styles[size]]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={buttonStyles}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.base,
    ...SHADOWS.base,
  },
  
  // Variantes
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  
  // Tailles
  small: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 48,
  },
  large: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    minHeight: 56,
  },
  
  // Gradient style
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.base,
  },
  
  // États
  disabled: {
    backgroundColor: COLORS.disabled,
    opacity: 0.6,
  },
  fullWidth: {
    width: '100%',
  },
  
  // Texte
  text: {
    fontFamily: TYPOGRAPHY.families.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textAlign: 'center',
  },
  text_primary: {
    color: COLORS.textInverse,
  },
  text_secondary: {
    color: COLORS.textInverse,
  },
  text_outline: {
    color: COLORS.primary,
  },
  text_ghost: {
    color: COLORS.primary,
  },
  text_small: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  text_medium: {
    fontSize: TYPOGRAPHY.sizes.base,
  },
  text_large: {
    fontSize: TYPOGRAPHY.sizes.lg,
  },
  textDisabled: {
    color: COLORS.textMuted,
  },
  
  // Icônes
  leftIcon: {
    marginRight: SPACING.sm,
  },
  rightIcon: {
    marginLeft: SPACING.sm,
  }
})

export default Button

