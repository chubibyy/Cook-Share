// src/navigation/TabNavigator.js - Version simplifiée pour démarrer
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ChallengesScreen } from '../screens/challenges/ChallengesScreen';
import { CreateSessionScreen } from '../screens/create/CreateSessionScreen';
import { ClubsScreen } from '../screens/clubs/ClubsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { COLORS, SPACING, SHADOWS } from '../utils/constants';
import { useNotificationStore } from '../stores/notificationStore';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabIcon = ({ icon, focused, badge = 0 }) => (
  <View style={styles.tabIconContainer}>
    <Text style={[styles.tabIcon, { color: focused ? COLORS.primary : COLORS.textMuted }]}>
      {icon}
    </Text>
    {badge > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    )}
  </View>
);

const CreateButton = ({ onPress }) => (
  <TouchableOpacity style={styles.createButton} onPress={onPress}>
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.createButtonGradient}
    >
      <Text style={styles.createButtonText}>+</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
  </Stack.Navigator>
);

const ChallengesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ChallengesScreen" component={ChallengesScreen} />
  </Stack.Navigator>
);

const ClubsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ClubsScreen" component={ClubsScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
  </Stack.Navigator>
);

const TabNavigator = () => {
  const { unreadCount } = useNotificationStore();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏠" focused={focused} />
          )
        }}
      />

      <Tab.Screen
        name="Challenges"
        component={ChallengesStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🎯" focused={focused} />
          )
        }}
      />

      <Tab.Screen
        name="Create"
        component={CreateSessionScreen}
        options={{
          tabBarButton: (props) => (
            <CreateButton onPress={props.onPress} />
          )
        }}
      />

      <Tab.Screen
        name="Clubs"
        component={ClubsStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👥" focused={focused} />
          )
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" focused={focused} badge={unreadCount} />
          )
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 80,
    paddingBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  tabIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  createButton: {
    top: -20,
    alignSelf: 'center',
  },
  createButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: 'bold',
  },
});

export default TabNavigator;

