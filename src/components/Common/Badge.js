// src/components/common/Badge.js
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../utils/constants'

const Badge = ({
  text,
  variant = 'primary', // primary, secondary, success, warning, error, info
  size = 'medium', // small, medium, large
  style,
  textStyle,
  ...props
}) => {
  const badgeStyles = [
    styles.base,
    styles[variant],
    styles[size],
    style
  ]

  const badgeTextStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
    textStyle
  ]

  return (
    <View style={badgeStyles} {...props}>
      <Text style={badgeTextStyles}>{text}</Text>
    </View>
  )
}

const badgeStyles = StyleSheet.create({
  base: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  
  // Variantes
  primary: {
    backgroundColor: COLORS.primaryAlpha,
  },
  secondary: {
    backgroundColor: COLORS.secondary + '20',
  },
  success: {
    backgroundColor: COLORS.success + '20',
  },
  warning: {
    backgroundColor: COLORS.warning + '20',
  },
  error: {
    backgroundColor: COLORS.error + '20',
  },
  info: {
    backgroundColor: COLORS.info + '20',
  },
  
  // Tailles
  small: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  medium: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
  },
  large: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  
  // Texte
  text: {
    fontFamily: TYPOGRAPHY.families.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
    textAlign: 'center',
  },
  text_primary: {
    color: COLORS.primary,
  },
  text_secondary: {
    color: COLORS.secondary,
  },
  text_success: {
    color: COLORS.success,
  },
  text_warning: {
    color: COLORS.warning,
  },
  text_error: {
    color: COLORS.error,
  },
  text_info: {
    color: COLORS.info,
  },
  text_small: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  text_medium: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  text_large: {
    fontSize: TYPOGRAPHY.sizes.base,
  }
})

export { Badge }

