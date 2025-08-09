import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { useChallengeStore } from '../../stores/challengeStore';
import { useAuthStore } from '../../stores/authStore';
import Button from '../../components/common/Button';
import { Avatar } from '../../components/common';
import { SessionSelectionModal } from '../../components/modals/SessionSelectionModal';
import { ClubSelectionModal } from '../../components/modals/ClubSelectionModal';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../utils/constants';

const ChallengeDetailScreen = ({ navigation }) => {
  const route = useRoute();
  const { challengeId, challengeType } = route.params;
  const user = useAuthStore(s => s.user);
  const {
    currentChallenge,
    loading,
    getChallengeById,
    participateInChallenge,
    abandonChallenge,
    submitChallengeSession,
    participateClubsInChallenge,
    removeClubFromChallenge
  } = useChallengeStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSessionModalVisible, setIsSessionModalVisible] = useState(false);
  const [isClubModalVisible, setIsClubModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (challengeId) {
        getChallengeById(challengeId);
      }
    }, [challengeId, getChallengeById])
  );

  const handleParticipate = async () => {
    if (!user?.id) return;
    setIsSubmitting(true);
    try {
      const result = await participateInChallenge(challengeId, user.id);
      if (result.success) {
        Alert.alert('Participation confirmée', 'Bonne chance pour ce challenge !');
        getChallengeById(challengeId);
      } else {
        Alert.alert('Erreur', result.error || 'Impossible de participer.');
      }
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAbandon = async () => {
    if (!user?.id) return;
    Alert.alert(
      'Abandonner le challenge',
      'Êtes-vous sûr de vouloir abandonner ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Abandonner',
          style: 'destructive',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              const result = await abandonChallenge(challengeId, user.id);
              if (result.success) {
                Alert.alert('Challenge abandonné', 'Vous ne participez plus à ce challenge.');
                getChallengeById(challengeId);
              } else {
                Alert.alert('Erreur', result.error || 'Impossible d\'abandonner.');
              }
            } catch (error) {
              Alert.alert('Erreur', error.message);
            } finally {
              setIsSubmitting(false);
            }
          }
        }
      ]
    );
  };

  const handleSessionSelected = async (sessionId) => {
    if (!sessionId) return;
    setIsSubmitting(true);
    try {
      const result = await submitChallengeSession(challengeId, sessionId);
      if (result.success) {
        Alert.alert('Participation soumise', 'Votre création a bien été soumise pour ce challenge !');
      } else {
        Alert.alert('Erreur de soumission', result.error || 'Une erreur est survenue.');
      }
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManageClubs = async (newlySelectedClubIds) => {
    if (!currentChallenge) return;

    const originalParticipatingIds = new Set(currentChallenge.clubParticipations?.map(p => p.club_id) || []);
    const newSelectedIds = new Set(newlySelectedClubIds);

    const clubsToAdd = newlySelectedClubIds.filter(id => !originalParticipatingIds.has(id));
    const clubsToRemove = Array.from(originalParticipatingIds).filter(id => !newSelectedIds.has(id));

    if (clubsToAdd.length === 0 && clubsToRemove.length === 0) return;

    setIsSubmitting(true);
    try {
      const promises = [];
      if (clubsToAdd.length > 0) {
        promises.push(participateClubsInChallenge(challengeId, clubsToAdd, user.id));
      }
      if (clubsToRemove.length > 0) {
        clubsToRemove.forEach(clubId => {
          promises.push(removeClubFromChallenge(challengeId, clubId, user.id));
        });
      }
      await Promise.all(promises);
      Alert.alert('Succès', 'Les participations des clubs ont été mises à jour.');
      getChallengeById(challengeId);
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !currentChallenge) {
    return <SafeAreaView style={styles.container}><ActivityIndicator style={{ flex: 1 }} color={COLORS.primary} size="large" /></SafeAreaView>;
  }

  const { 
    title, description, constraint_text, reward_xp, challenge_img, 
    participantsCount, timeLeft, isActive, userParticipation, 
    participants_list, ownedClubs, clubParticipations
  } = currentChallenge;

  const isParticipating = !!userParticipation;
  const isCompleted = userParticipation?.status === 'reussi';

  const renderActionButton = () => {
    if (!isActive) return <Text style={styles.statusText}>Challenge terminé</Text>;

    if (challengeType === 'club') {
      if (ownedClubs && ownedClubs.length > 0) {
        return <Button title="Gérer la participation des clubs" onPress={() => setIsClubModalVisible(true)} loading={isSubmitting} />;
      }
      return <Text style={styles.statusText}>Seuls les propriétaires de clubs peuvent participer.</Text>;
    }

    if (isCompleted) {
      return <View style={styles.completedContainer}><Text style={styles.statusText}>✅ Défi réussi !</Text></View>;
    }
    if (isParticipating) {
      return (
        <View>
          <Button title="Soumettre ma participation" onPress={() => setIsSessionModalVisible(true)} style={{ marginBottom: SPACING.sm }} loading={isSubmitting} />
          <Button title="Abandonner" variant="outline" onPress={handleAbandon} loading={isSubmitting} />
        </View>
      );
    }
    return <Button title="Participer au Challenge" onPress={handleParticipate} loading={isSubmitting} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <SessionSelectionModal visible={isSessionModalVisible} onClose={() => setIsSessionModalVisible(false)} onSelectSession={handleSessionSelected} />
      <ClubSelectionModal 
        visible={isClubModalVisible} 
        onClose={() => setIsClubModalVisible(false)} 
        onSelectClubs={handleManageClubs}
        clubs={ownedClubs || []}
        participatingClubIds={clubParticipations?.map(p => p.club_id) || []}
        challenge={currentChallenge}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Text style={styles.backButtonText}>←</Text></TouchableOpacity>
        </View>
        <Image source={{ uri: challenge_img }} style={styles.bannerImage} />
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <View style={styles.infoGrid}>
            <InfoBox label="Temps restant" value={timeLeft} icon="⏰" />
            <InfoBox label="Statut" value={isActive ? 'Actif' : 'Terminé'} icon="⚡️" />
          </View>
          <Section title="📜 Contrainte"><Text style={styles.constraintText}>{constraint_text}</Text></Section>
          <Section title="🏆 Récompenses">
            <View style={styles.rewardsContainer}>
              <RewardItem label="Points d'Expérience" value={`+${reward_xp} XP`} icon="✨" />
              {currentChallenge.badge_image_url ? (
                <View style={styles.rewardItem}>
                  <Text style={styles.rewardLabel}>Badge à gagner</Text>
                  <Image source={{ uri: currentChallenge.badge_image_url }} style={styles.badgeImage} />
                </View>
              ) : (
                <RewardItem label="Badge à gagner" value="Aucun" icon="🏅" />
              )}
            </View>
          </Section>
          <Section title="👥 Participants" subtitle={`${participantsCount || 0} participant(s)`}>
            <View style={styles.participantsList}>
              {(participants_list || []).slice(0, 5).map(p => (
                <Avatar
                  key={p.user.id}
                  source={{ uri: p.user.avatar_url }}
                  name={p.user.username}
                  size="medium"
                  style={styles.participantAvatar}
                  userId={p.user.id}
                />
              ))}
              {(participants_list?.length || 0) > 5 && <Text style={styles.moreParticipants}>+{(participants_list.length || 0) - 5}</Text>}
            </View>
          </Section>
        </View>
      </ScrollView>
      <View style={styles.footer}>{renderActionButton()}</View>
    </SafeAreaView>
  );
};

const Section = ({ title, subtitle, children }) => (
  <View style={styles.sectionContainer}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
    {children}
  </View>
);

const InfoBox = ({ label, value, icon }) => (
  <View style={styles.infoBox}>
    <Text style={styles.infoBoxLabel}>{icon} {label}</Text>
    <Text style={styles.infoBoxValue}>{value}</Text>
  </View>
);

const RewardItem = ({ label, value, icon }) => (
  <View style={styles.rewardItem}>
    <Text style={styles.rewardIcon}>{icon}</Text>
    <View>
      <Text style={styles.rewardLabel}>{label}</Text>
      <Text style={styles.rewardValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContainer: { paddingBottom: 120 },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    padding: SPACING.md,
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: { color: COLORS.white, fontSize: 24, fontWeight: 'bold' },
  bannerImage: { width: '100%', height: 250, backgroundColor: COLORS.borderLight },
  content: { padding: SPACING.md },
  title: { fontSize: TYPOGRAPHY.sizes.xxl, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text, marginBottom: SPACING.sm },
  description: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.textSecondary, lineHeight: TYPOGRAPHY.lineHeights.relaxed, marginBottom: SPACING.lg },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.lg },
  infoBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flex: 1,
    marginHorizontal: SPACING.xs,
    ...SHADOWS.sm,
  },
  infoBoxLabel: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  infoBoxValue: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text },
  sectionContainer: { marginBottom: SPACING.lg },
  sectionHeader: { marginBottom: SPACING.md },
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text },
  sectionSubtitle: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  constraintText: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text, fontStyle: 'italic' },
  rewardsContainer: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, ...SHADOWS.sm },
  rewardItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, justifyContent: 'space-between' },
  rewardIcon: { fontSize: 24, marginRight: SPACING.md },
  rewardLabel: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.textSecondary },
  rewardValue: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text },
  badgeImage: {
    width: 40,
    height: 40,
    marginRight: SPACING.md,
    resizeMode: 'contain',
  },
  participantsList: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  participantAvatar: { marginRight: -SPACING.sm, borderWidth: 2, borderColor: COLORS.background },
  moreParticipants: { marginLeft: SPACING.lg, color: COLORS.textSecondary },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    ...SHADOWS.lg,
  },
  statusText: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.textMuted, textAlign: 'center' },
  completedContainer: { alignItems: 'center' },
});

export default ChallengeDetailScreen;
