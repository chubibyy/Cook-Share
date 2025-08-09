// src/navigation/TabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import { HomeScreen } from '../screens/home/HomeScreen';
import { SessionDetailScreen } from '../screens/home/SessionDetailScreen';
import { ChallengesScreen } from '../screens/challenges/ChallengesScreen';
import ChallengeDetailScreen from '../screens/challenges/ChallengeDetailScreen';
import { ClubsScreen } from '../screens/clubs/ClubsScreen';
import ClubDetailScreen from '../screens/clubs/ClubDetailScreen';
import CreateCLubScreen from '../screens/clubs/CreateCLubScreen';
import EditClubScreen from '../screens/clubs/EditClubScreen';
import JoinRequestsScreen from '../screens/clubs/JoinRequestsScreen';
import ClubMembersScreen from '../screens/clubs/ClubMembersScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { UserProfileScreen } from '../screens/profile/UserProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
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

const CreateButton = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={styles.createButton}
      onPress={() => navigation.navigate('CreateSession')}
    >
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.createButtonGradient}
      >
        <Text style={styles.createButtonText}>+</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
    <Stack.Screen name="SessionDetail" component={SessionDetailScreen} />
    <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
  </Stack.Navigator>
);

const ChallengesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ChallengesScreen" component={ChallengesScreen} />
    <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} />
    <Stack.Screen name="SessionDetail" component={SessionDetailScreen} />
    <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
  </Stack.Navigator>
);

const ClubsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ClubsScreen" component={ClubsScreen} />
    <Stack.Screen name="ClubDetail" component={ClubDetailScreen} />
    <Stack.Screen name="CreateClub" component={CreateCLubScreen} />
    <Stack.Screen name="EditClub" component={EditClubScreen} />
    <Stack.Screen name="JoinRequests" component={JoinRequestsScreen} />
    <Stack.Screen name="ClubMembers" component={ClubMembersScreen} />
    <Stack.Screen name="SessionDetail" component={SessionDetailScreen} />
    <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
    <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
  </Stack.Navigator>
);

const Dummy = () => null; // placeholder pour l’onglet central

const TabNavigator = () => {
  const { unreadCount } = useNotificationStore();

  const tabScreenListeners = ({ navigation, route }) => ({
    tabPress: (e) => {
      const state = navigation.getState();
      const isFocused = state.routes[state.index].name === route.name;

      if (isFocused) {
        // If the tab is already focused, reset its stack to the initial route.
        navigation.navigate(route.name, {
          screen: `${route.name}Screen` // Assumes root screen is named like 'HomeScreen', 'ChallengesScreen'
        });
      }
    },
  });

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
        listeners={tabScreenListeners}
      />

      <Tab.Screen
        name="Challenges"
        component={ChallengesStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🎯" focused={focused} />,
        }}
        listeners={tabScreenListeners}
      />

      {/* Onglet central -> ouvre la modale CreateSession */}
      <Tab.Screen
        name="Create"
        component={Dummy}
        options={{
          tabBarButton: () => <CreateButton />,
        }}
      />

      <Tab.Screen
        name="Clubs"
        component={ClubsStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="👥" focused={focused} />,
        }}
        listeners={tabScreenListeners}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" focused={focused} badge={unreadCount} />
          ),
        }}
        listeners={tabScreenListeners}
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
