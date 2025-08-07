// src/navigation/TabNavigator.js - Version simplifiée pour démarrer
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ChallengesScreen } from '../screens/challenges/ChallengesScreen';
import { CreateSessionScreen } from '../screens/create/CreateSessionScreen';
import { ClubsScreen } from '../screens/clubs/ClubsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { COLORS } from '../utils/constants';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Écrans temporaires pour les tabs manquants
const TempChallengesScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
    <Text style={{ fontSize: 20, color: COLORS.text }}>🎯 Challenges</Text>
    <Text style={{ color: COLORS.textMuted, marginTop: 10 }}>Bientôt disponible</Text>
  </View>
);

const TempCreateScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary }}>
    <Text style={{ fontSize: 20, color: COLORS.white }}>➕ Créer</Text>
    <Text style={{ color: COLORS.white + 'CC', marginTop: 10 }}>Partagez votre création</Text>
  </View>
);

const TempClubsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
    <Text style={{ fontSize: 20, color: COLORS.text }}>👥 Clubs</Text>
    <Text style={{ color: COLORS.textMuted, marginTop: 10 }}>Bientôt disponible</Text>
  </View>
);

const TempProfileScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
    <Text style={{ fontSize: 20, color: COLORS.text }}>👤 Profil</Text>
    <Text style={{ color: COLORS.textMuted, marginTop: 10 }}>Bientôt disponible</Text>
  </View>
);
const TabNavigator = () => {
  const { unreadCount } = useNotificationStore()

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
  )
}

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
})

export default TabNavigator

