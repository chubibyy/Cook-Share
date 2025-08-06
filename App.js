// App.js - Test des composants Layout (version corrigée)
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Button from './src/components/common/Button';
import { SafeContainer } from './src/components/layout/SafeContainer';
import { Header } from './src/components/layout/Header';
import { COLORS, SPACING, TYPOGRAPHY } from './src/utils/constants';

const Tab = createBottomTabNavigator();

// Mock user pour tester
const mockUser = {
  id: '1',
  username: 'Chef Marie',
  avatar_url: null,
  xp: 850,
};

function HomeScreen() {
  return (
    <SafeContainer>
      <Header
        title="PlateUp"
        subtitle="Dress your plate, share the taste"
        user={mockUser}
        showAvatar={true}
        showXPBar={true}
        rightIcon={<Text style={{ fontSize: 20 }}>🔔</Text>}
        onRightPress={() => alert('Notifications')}
        onAvatarPress={() => alert('Profile')}
      />
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Layout Components Test</Text>
          <Text style={styles.description}>
            Header avec avatar, XP bar, et notifications
          </Text>
          <Button 
            title="Test Button" 
            onPress={() => alert('Button dans SafeContainer!')} 
          />
        </View>
      </ScrollView>
    </SafeContainer>
  );
}

function ChallengesScreen() {
  return (
    <SafeContainer>
      <Header
        title="Challenges"
        leftIcon={<Text style={{ fontSize: 20 }}>←</Text>}
        onLeftPress={() => alert('Back')}
      />
      <View style={styles.centerContent}>
        <Text style={styles.title}>🎯 Challenges</Text>
        <Text style={styles.subtitle}>Bientôt disponible</Text>
      </View>
    </SafeContainer>
  );
}

function CreateScreen() {
  return (
    <SafeContainer backgroundColor={COLORS.primary}>
      <Header
        title="Nouvelle Session"
        leftIcon={<Text style={{ fontSize: 20, color: COLORS.white }}>×</Text>}
        style={{ backgroundColor: COLORS.primary }}
        onLeftPress={() => alert('Close')}
      />
      <View style={styles.centerContent}>
        <Text style={[styles.title, { color: COLORS.white }]}>➕ Create</Text>
        <Text style={[styles.subtitle, { color: COLORS.white }]}>
          Partagez votre création
        </Text>
      </View>
    </SafeContainer>
  );
}

function ProfileScreen() {
  return (
    <SafeContainer>
      <Header
        user={mockUser}
        showAvatar={true}
        showXPBar={true}
        rightIcon={<Text style={{ fontSize: 20 }}>⚙️</Text>}
        onRightPress={() => alert('Settings')}
      />
      <View style={styles.centerContent}>
        <Text style={styles.title}>👤 Profile</Text>
        <Text style={styles.subtitle}>Chef Marie • 850 XP</Text>
      </View>
    </SafeContainer>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textMuted,
          tabBarStyle: styles.tabBar,
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            tabBarLabel: 'Accueil',
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>
          }}
        />
        <Tab.Screen 
          name="Challenges" 
          component={ChallengesScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🎯</Text>
          }}
        />
        <Tab.Screen 
          name="Create" 
          component={CreateScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>➕</Text>
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.textSecondary,
  },
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 80,
    paddingBottom: 10,
  }
});