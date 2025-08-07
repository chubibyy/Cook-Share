// App.js - PlateUp Test Global (Version Clean)
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  FlatList,
  Alert,
  StatusBar 
} from 'react-native';

// Composants
import Button from './src/components/common/Button';
import { SafeContainer } from './src/components/layout/SafeContainer';
import { Header } from './src/components/layout/Header';
import { SessionCard } from './src/components/cards/SessionCard';
import { ChallengeCard } from './src/components/cards/ChallengeCard';
import { ClubCard } from './src/components/cards/ClubCard';
import { UserCard } from './src/components/cards/UserCard';
import { Avatar, Badge, Input, LoadingSpinner } from './src/components/common';

// Constants
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from './src/utils/constants';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// =============================================================================
// MOCK DATA POUR TESTS
// =============================================================================

const mockUser = {
  id: '1',
  username: 'Chef Marie',
  email: 'marie@plateup.com',
  avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b8ae?w=150',
  bio: 'Passionnée de cuisine française et de pâtisserie 👩‍🍳',
  xp: 1250,
  cook_frequency: 'daily',
  cook_constraints: ['Végétarien', 'Sans gluten'],
  sessionsCount: 42,
  followersCount: 156,
  challengesCompleted: 8,
  isVerified: true
};

const mockSessions = [
  {
    id: '1',
    title: 'Risotto aux champignons et parmesan',
    photo_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
    duration: 45,
    difficulty: 3,
    cuisine_type: 'Italienne',
    tags: ['comfort food', 'végétarien'],
    ingredients: ['Riz arborio', 'Champignons', 'Parmesan', 'Bouillon'],
    user: mockUser,
    likesCount: 24,
    commentsCount: 8,
    isLiked: false,
    isSaved: true,
    timeAgo: '2h',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    title: 'Tarte aux pommes caramelisées',
    photo_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
    duration: 90,
    difficulty: 4,
    cuisine_type: 'Française',
    tags: ['dessert', 'automne'],
    user: { ...mockUser, username: 'Baker Tom', id: '2' },
    likesCount: 31,
    commentsCount: 12,
    isLiked: true,
    isSaved: false,
    timeAgo: '5h',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  }
];

const mockChallenges = [
  {
    id: '1',
    title: 'Défi Zéro Déchet',
    description: 'Créez un plat en utilisant uniquement des restes ou des épluchures',
    challenge_img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
    constraint_text: 'Aucun nouvel ingrédient acheté',
    reward_xp: 150,
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    participantsCount: 89,
    userParticipation: null,
    timeLeft: '7 jours'
  },
  {
    id: '2',
    title: 'Master Chef Végétalien',
    description: 'Impressionnez avec un plat 100% végétal et gourmand',
    challenge_img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    constraint_text: 'Aucun produit animal',
    reward_xp: 200,
    end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    participantsCount: 156,
    userParticipation: { status: 'en_cours' },
    timeLeft: '3 jours'
  }
];

const mockClubs = [
  {
    id: '1',
    name: 'Cuisine Française Authentique',
    description: 'Redécouvrons ensemble les classiques de la gastronomie française',
    avatar_url: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=200',
    is_private: false,
    membersCount: 234,
    sessionsCount: 89,
    userMembership: { role: 'member' },
    recentMembers: [mockUser],
    tags: ['française', 'traditionnelle']
  },
  {
    id: '2',
    name: 'Healthy & Fit Cooking',
    description: 'Des recettes saines et équilibrées pour prendre soin de soi',
    avatar_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=200',
    is_private: true,
    membersCount: 67,
    sessionsCount: 45,
    userMembership: null,
    recentMembers: [],
    tags: ['healthy', 'fitness', 'bio']
  }
];

// =============================================================================
// SCREENS DE TEST
// =============================================================================

// Test des composants Cards
function CardsTestScreen() {
  const [likedSessions, setLikedSessions] = useState({});
  const [savedSessions, setSavedSessions] = useState({});

  const handleLike = (sessionId, liked) => {
    setLikedSessions(prev => ({ ...prev, [sessionId]: liked }));
    Alert.alert('Like', `Session ${liked ? 'likée' : 'unlikée'}`);
  };

  const handleSave = (sessionId, saved) => {
    setSavedSessions(prev => ({ ...prev, [sessionId]: saved }));
    Alert.alert('Save', `Session ${saved ? 'sauvegardée' : 'supprimée'}`);
  };

  return (
    <SafeContainer>
      <Header title="Test des Cards" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Session Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🍽️ Session Cards</Text>
          {mockSessions.map(session => (
            <SessionCard
              key={session.id}
              session={{
                ...session,
                isLiked: likedSessions[session.id] ?? session.isLiked,
                isSaved: savedSessions[session.id] ?? session.isSaved
              }}
              onPress={(session) => Alert.alert('Session', `Ouvrir: ${session.title}`)}
              onLike={handleLike}
              onSave={handleSave}
              onComment={(session) => Alert.alert('Comment', `Commenter: ${session.title}`)}
              onUserPress={(user) => Alert.alert('User', `Profil: ${user.username}`)}
              style={styles.card}
            />
          ))}
        </View>

        {/* Challenge Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Challenge Cards</Text>
          {mockChallenges.map(challenge => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onPress={(challenge) => Alert.alert('Challenge', `Ouvrir: ${challenge.title}`)}
              onParticipate={(challenge) => Alert.alert('Participate', `Participer: ${challenge.title}`)}
              style={styles.card}
            />
          ))}
        </View>

        {/* Club Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Club Cards</Text>
          {mockClubs.map(club => (
            <ClubCard
              key={club.id}
              club={club}
              onPress={(club) => Alert.alert('Club', `Ouvrir: ${club.name}`)}
              onJoin={(clubId) => Alert.alert('Join', `Rejoindre club ${clubId}`)}
              onLeave={(clubId) => Alert.alert('Leave', `Quitter club ${clubId}`)}
              style={styles.card}
            />
          ))}
        </View>

        {/* User Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 User Cards</Text>
          <UserCard
            user={mockUser}
            variant="default"
            onPress={(user) => Alert.alert('User', `Profil: ${user.username}`)}
            onFollow={(userId, following) => Alert.alert('Follow', `${following ? 'Suivre' : 'Ne plus suivre'} ${userId}`)}
            onMessage={(userId) => Alert.alert('Message', `Message à ${userId}`)}
            showFollowButton={true}
            showMessageButton={true}
            style={styles.card}
          />
          
          <UserCard
            user={{ ...mockUser, id: '2', username: 'Quick User' }}
            variant="compact"
            showFollowButton={true}
            style={styles.card}
          />
        </View>
      </ScrollView>
    </SafeContainer>
  );
}

// Test des composants communs
function ComponentsTestScreen() {
  const [inputValue, setInputValue] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const testLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <SafeContainer>
      <Header 
        title="Test Components"
        user={mockUser}
        showAvatar={true}
        showXPBar={true}
        rightIcon={<Text style={{ fontSize: 20 }}>🔔</Text>}
        onRightPress={() => Alert.alert('Notifications', 'Badge: 3 notifications')}
        onAvatarPress={() => Alert.alert('Profile', 'Ouvrir profil')}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        
        {/* Avatars */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Avatars</Text>
          <View style={styles.row}>
            <Avatar source={{ uri: mockUser.avatar_url }} size="small" name={mockUser.username} />
            <Avatar source={{ uri: mockUser.avatar_url }} size="medium" name={mockUser.username} xp={mockUser.xp} showBadge={true} />
            <Avatar source={{ uri: mockUser.avatar_url }} size="large" name={mockUser.username} xp={mockUser.xp} showBadge={true} />
            <Avatar source={null} size="medium" name="No Image" xp={500} showBadge={true} />
          </View>
        </View>

        {/* Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏷️ Badges</Text>
          <View style={styles.row}>
            <Badge text="Primary" variant="primary" size="small" />
            <Badge text="Success" variant="success" size="medium" />
            <Badge text="Warning" variant="warning" size="large" />
            <Badge text="🔥 Hot" variant="error" />
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔘 Buttons</Text>
          <View style={styles.buttonGrid}>
            <Button title="Primary" variant="primary" size="small" onPress={() => Alert.alert('Primary')} />
            <Button title="Secondary" variant="secondary" size="medium" onPress={() => Alert.alert('Secondary')} />
            <Button title="Outline" variant="outline" size="large" onPress={() => Alert.alert('Outline')} />
            <Button title="Loading" loading={loading} onPress={testLoading} />
            <Button title="Disabled" disabled={true} onPress={() => {}} />
            <Button title="Full Width" fullWidth onPress={() => Alert.alert('Full Width')} />
          </View>
        </View>

        {/* Inputs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Inputs</Text>
          <Input
            label="Nom d'utilisateur"
            placeholder="Entrez votre nom"
            value={inputValue}
            onChangeText={setInputValue}
            leftIcon={<Text>👤</Text>}
          />
          <Input
            label="Mot de passe"
            placeholder="Entrez votre mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />
          <Input
            label="Description"
            placeholder="Décrivez votre plat..."
            multiline={true}
            value="Exemple de texte multiligne pour tester l'input en mode textarea"
            onChangeText={() => {}}
          />
          <Input
            label="Avec erreur"
            placeholder="Ce champ a une erreur"
            error="Ce champ est requis"
            value=""
            onChangeText={() => {}}
          />
        </View>

        {/* Loading Spinner */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏳ Loading Spinner</Text>
          <View style={styles.row}>
            <LoadingSpinner size={30} />
            <LoadingSpinner size={40} color={COLORS.secondary} />
            <LoadingSpinner size={50} color={COLORS.warning} />
          </View>
        </View>
      </ScrollView>
    </SafeContainer>
  );
}

// Simulation HomeScreen
function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <SafeContainer>
      <Header
        title="PlateUp"
        subtitle="Dress your plate, share the taste"
        user={mockUser}
        showAvatar={true}
        showXPBar={true}
        rightIcon={<Text style={{ fontSize: 20 }}>🔔</Text>}
        onRightPress={() => Alert.alert('Notifications')}
        onAvatarPress={() => Alert.alert('Profile')}
      />
      <FlatList
        data={mockSessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SessionCard
            session={item}
            onPress={(session) => Alert.alert('Session Detail', session.title)}
            onLike={(id, liked) => Alert.alert('Like', `${liked ? 'Liked' : 'Unliked'}`)}
            onComment={(session) => Alert.alert('Comment', session.title)}
            onUserPress={(user) => Alert.alert('User Profile', user.username)}
            style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.md }}
          />
        )}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={{ paddingVertical: SPACING.md }}
        ListHeaderComponent={() => (
          <View style={{ padding: SPACING.md }}>
            <Text style={styles.feedTitle}>🍽️ Dernières créations</Text>
          </View>
        )}
      />
    </SafeContainer>
  );
}

// Simulation ChallengesScreen
function ChallengesScreen() {
  return (
    <SafeContainer>
      <Header title="Challenges" />
      <FlatList
        data={mockChallenges}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChallengeCard
            challenge={item}
            onPress={(challenge) => Alert.alert('Challenge Detail', challenge.title)}
            onParticipate={(challenge) => Alert.alert('Participate', challenge.title)}
            style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.md }}
          />
        )}
        contentContainerStyle={{ paddingVertical: SPACING.md }}
      />
    </SafeContainer>
  );
}

// Simulation CreateScreen
function CreateScreen() {
  return (
    <SafeContainer backgroundColor={COLORS.primary}>
      <Header
        title="Nouvelle Création"
        leftIcon={<Text style={{ fontSize: 20, color: COLORS.white }}>✕</Text>}
        style={{ backgroundColor: COLORS.primary }}
        onLeftPress={() => Alert.alert('Close')}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.createContent}>
        <View style={styles.createPlaceholder}>
          <Text style={styles.createEmoji}>📸</Text>
          <Text style={styles.createTitle}>Partagez votre création</Text>
          <Text style={styles.createSubtitle}>Prenez une photo de votre plat et partagez votre recette avec la communauté</Text>
          <Button
            title="Prendre une photo"
            variant="secondary"
            onPress={() => Alert.alert('Camera', 'Ouvrir l\'appareil photo')}
            style={{ marginTop: SPACING.lg }}
          />
        </View>
      </ScrollView>
    </SafeContainer>
  );
}

// Simulation ClubsScreen
function ClubsScreen() {
  return (
    <SafeContainer>
      <Header title="Clubs" />
      <FlatList
        data={mockClubs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ClubCard
            club={item}
            onPress={(club) => Alert.alert('Club Detail', club.name)}
            onJoin={(clubId) => Alert.alert('Join Club', clubId)}
            onLeave={(clubId) => Alert.alert('Leave Club', clubId)}
            style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.md }}
          />
        )}
        contentContainerStyle={{ paddingVertical: SPACING.md }}
      />
    </SafeContainer>
  );
}

// Simulation ProfileScreen
function ProfileScreen() {
  return (
    <SafeContainer>
      <Header
        user={mockUser}
        showAvatar={true}
        showXPBar={true}
        rightIcon={<Text style={{ fontSize: 20 }}>⚙️</Text>}
        onRightPress={() => Alert.alert('Settings')}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <UserCard
            user={mockUser}
            variant="default"
            showFollowButton={false}
            showMessageButton={false}
            showStats={true}
            style={styles.profileCard}
          />
          
          <View style={styles.profileActions}>
            <Button title="Modifier le profil" variant="outline" fullWidth onPress={() => Alert.alert('Edit Profile')} />
            <Button title="Mes sessions" variant="primary" fullWidth onPress={() => Alert.alert('My Sessions')} style={{ marginTop: SPACING.sm }} />
          </View>
        </View>
      </ScrollView>
    </SafeContainer>
  );
}

// =============================================================================
// TAB NAVIGATOR
// =============================================================================

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
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
        name="Clubs" 
        component={ClubsScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👥</Text>
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
  );
}

// =============================================================================
// STACK NAVIGATOR POUR TESTS
// =============================================================================

function TestStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true
      }}
    >
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="CardsTest" component={CardsTestScreen} />
      <Stack.Screen name="ComponentsTest" component={ComponentsTestScreen} />
    </Stack.Navigator>
  );
}

// =============================================================================
// APP PRINCIPAL
// =============================================================================

export default function App() {
  const [testMode, setTestMode] = useState('app'); // 'app', 'cards', 'components'

  useEffect(() => {
    // Message d'accueil pour le test
    setTimeout(() => {
      Alert.alert(
        '🎉 PlateUp - Test Global',
        'Application de test avec tous les composants intégrés !\n\n' +
        '• Navigation complète\n' +
        '• Cards interactives\n' +
        '• Composants communs\n' +
        '• Mock data réaliste\n\n' +
        'Explorez toutes les fonctionnalités !',
        [
          { text: 'App Complète', onPress: () => setTestMode('app') },
          { text: 'Test Cards', onPress: () => setTestMode('cards') },
          { text: 'Test Components', onPress: () => setTestMode('components') }
        ]
      );
    }, 1000);
  }, []);

  const getCurrentComponent = () => {
    switch (testMode) {
      case 'cards':
        return <CardsTestScreen />;
      case 'components':
        return <ComponentsTestScreen />;
      default:
        return <TestStack />;
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <NavigationContainer>
        {getCurrentComponent()}
      </NavigationContainer>
    </>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.xxxl,
  },
  section: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  feedTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  card: {
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flexWrap: 'wrap',
  },
  buttonGrid: {
    gap: SPACING.sm,
  },
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 70,
    paddingBottom: SPACING.sm,
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  createContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  createPlaceholder: {
    alignItems: 'center',
    backgroundColor: COLORS.white + '20',
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    width: '100%',
  },
  createEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  createTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  createSubtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.white + 'CC',
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.base * 1.4,
  },
  profileSection: {
    padding: SPACING.md,
  },
  profileCard: {
    marginBottom: SPACING.lg,
  },
  profileActions: {
    gap: SPACING.sm,
  },
});