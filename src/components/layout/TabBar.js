// src/components/layout/TabBar.js
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../utils/constants'

const TabBar = ({ 
  state, 
  descriptors, 
  navigation,
  notificationBadge = 0 
}) => {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]
        const label = options.tabBarLabel !== undefined 
          ? options.tabBarLabel 
          : options.title !== undefined 
          ? options.title 
          : route.name

        const isFocused = state.index === index
        const isCreateTab = route.name === 'Create'

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          })

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name)
          }
        }

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          })
        }

        // Bouton Create spécial (FAB style)
        if (isCreateTab) {
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.createButton}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.createButtonGradient}
              >
                <Text style={styles.createButtonIcon}>+</Text>
              </LinearGradient>
            </TouchableOpacity>
          )
        }

        // Icônes par défaut selon le nom de la route
        const getTabIcon = (routeName, focused) => {
          const iconColor = focused ? COLORS.primary : COLORS.textMuted
          
          switch (routeName) {
            case 'Home':
              return <Text style={[styles.tabIcon, { color: iconColor }]}>🏠</Text>
            case 'Challenges':
              return <Text style={[styles.tabIcon, { color: iconColor }]}>🎯</Text>
            case 'Clubs':
              return <Text style={[styles.tabIcon, { color: iconColor }]}>👥</Text>
            case 'Profile':
              return (
                <View style={styles.tabIconContainer}>
                  <Text style={[styles.tabIcon, { color: iconColor }]}>👤</Text>
                  {notificationBadge > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationBadgeText}>
                        {notificationBadge > 99 ? '99+' : notificationBadge}
                      </Text>
                    </View>
                  )}
                </View>
              )
            default:
              return <Text style={[styles.tabIcon, { color: iconColor }]}>📱</Text>
          }
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[
              styles.tabButton,
              isFocused && styles.tabButtonFocused
            ]}
          >
            {getTabIcon(route.name, isFocused)}
            <Text style={[
              styles.tabLabel,
              { color: isFocused ? COLORS.primary : COLORS.textMuted }
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.sm,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.base,
    marginHorizontal: SPACING.xs,
  },
  tabButtonFocused: {
    backgroundColor: COLORS.primaryAlpha,
  },
  tabIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginTop: 2,
  },
  createButton: {
    position: 'absolute',
    top: -20,
    left: '50%',
    marginLeft: -30, // Half of button width
    zIndex: 10,
  },
  createButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  createButtonIcon: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  notificationBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: 'center',
  },
})

export { TabBar }