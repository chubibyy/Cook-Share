// App.js - Test du Design System
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Button from './src/components/common/Button';
import { COLORS, SPACING, TYPOGRAPHY } from './src/utils/constants';

const Tab = createBottomTabNavigator();

function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎨 Design System Test</Text>
        
        <Text style={styles.subtitle}>Buttons</Text>
        <Button title="Primary Button" onPress={() => alert('Primary!')} />
        <View style={styles.spacer} />
        
        <Button 
          title="Secondary Button" 
          variant="secondary" 
          onPress={() => alert('Secondary!')} 
        />
        <View style={styles.spacer} />
        
        <Button 
          title="Outline Button" 
          variant="outline" 
          onPress={() => alert('Outline!')} 
        />
        <View style={styles.spacer} />
        
        <Button 
          title="Loading..." 
          loading={true} 
        />
      </View>
    </ScrollView>
  );
}

function ChallengesScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>🎯 Challenges</Text>
      <Text style={styles.subtitle}>Bientôt disponible</Text>
    </View>
  );
}

function CreateScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>➕ Create</Text>
      <Text style={styles.subtitle}>Bientôt disponible</Text>
    </View>
  );
}

function ProfileScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>👤 Profile</Text>
      <Text style={styles.subtitle}>Bientôt disponible</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textMuted,
          headerShown: false,
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
        <Tab.Screen name="Challenges" component={ChallengesScreen} />
        <Tab.Screen name="Create" component={CreateScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  section: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  spacer: {
    height: SPACING.md,
  },
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 80,
    paddingBottom: 10,
  }
});