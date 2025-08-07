// src/screens/home/HomeScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';
import { Header } from '../../components/layout/Header';
import Button from '../../components/common/Button';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../utils/constants';

export const HomeScreen = ({ navigation }) => {
  const { user, signOut, addXP } = useAuthStore();

  const handleTestXP = async () => {
    const result = await addXP(50, 'test');
    if (result.success) {
      Alert.alert('XP Gagné!', `+${result.xpGained} XP`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="PlateUp"
        subtitle="Bienvenue dans votre communauté culinaire"
        user={user}
        showAvatar={true}
        showXPBar={true}
        rightIcon={<Text style={{ fontSize: 20 }}>🔔</Text>}
        onRightPress={() => navigation.navigate('Notifications')}
        onAvatarPress={() => navigation.navigate('Profile')}
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            Salut {user?.username || 'Chef'} ! 👋
          </Text>
          <Text style={styles.welcomeText}>
            Votre profil est maintenant configuré. Il est temps de commencer votre aventure culinaire !
          </Text>
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>🚀 Premiers pas</Text>
          
          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>📸 Partagez votre première création</Text>
            <Text style={styles.actionDescription}>
              Prenez une photo de votre plat et partagez-la avec la communauté
            </Text>
            <Button
              title="Créer ma première session"
              onPress={() => navigation.navigate('Create')}
              style={styles.actionButton}
            />
          </View>

          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>🎯 Relevez un défi</Text>
            <Text style={styles.actionDescription}>
              Participez aux challenges culinaires et gagnez de l'XP
            </Text>
            <Button
              title="Voir les défis"
              variant="outline"
              onPress={() => navigation.navigate('Challenges')}
              style={styles.actionButton}
            />
          </View>

          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>👥 Rejoignez un club</Text>
            <Text style={styles.actionDescription}>
              Trouvez des passionnés qui partagent vos goûts culinaires
            </Text>
            <Button
              title="Explorer les clubs"
              variant="secondary"
              onPress={() => navigation.navigate('Clubs')}
              style={styles.actionButton}
            />
          </View>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📊 Vos statistiques</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user?.xp || 0}</Text>
              <Text style={styles.statLabel}>XP Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Défis</Text>
            </View>
          </View>
        </View>

        {/* Section debug pour développement */}
        {__DEV__ && (
          <View style={styles.debugSection}>
            <Text style={styles.sectionTitle}>🔧 Debug (Dev only)</Text>
            <Button
              title="Test +50 XP"
              onPress={handleTestXP}
              variant="outline"
              size="small"
              style={{ marginBottom: SPACING.sm }}
            />
            <Button
              title="Se déconnecter"
              onPress={signOut}
              variant="outline"
              size="small"
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  welcomeSection: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginVertical: SPACING.md,
  },
  welcomeTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  welcomeText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.sizes.base * 1.4,
  },
  actionsSection: {
    marginVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  actionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  actionTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  actionDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.4,
  },
  actionButton: {
    alignSelf: 'flex-start',
  },
  statsSection: {
    marginVertical: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  debugSection: {
    marginVertical: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.warning + '10',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.warning + '30',
  },
});