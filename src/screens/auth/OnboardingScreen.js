// src/screens/auth/OnboardingScreen.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  TextInput,
  Alert,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../../components/common/Button';
import { Avatar } from '../../components/common';
import { useAuthStore } from '../../stores/authStore';
import { useCamera } from '../../hooks/useCamera';
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  RADIUS,
  ONBOARDING_STEPS,
  CUISINE_TYPES,
  DIETARY_OPTIONS,
  COOKING_LEVELS,
  COOKING_FREQUENCIES,
  COOKING_FOR_OPTIONS,
} from '../../utils/constants';

const { width } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    foodPreferences: [],
    dietaryRestrictions: [],
    cookingLevel: '',
    cookingFrequency: '',
    cookingFor: [],
    username: '',
    bio: '',
    avatar: null
  });

  // Récupère juste ce dont on a besoin depuis le store (évite la reactivity foireuse)
  const user = useAuthStore((s) => s.user);
  const completeOnboardingStore = useAuthStore((s) => s.completeOnboarding);

  const { takePhoto, pickImage } = useCamera();
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Nav
  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      Animated.timing(slideAnim, {
        toValue: -(currentStep + 1) * width,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setCurrentStep((s) => s + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      Animated.timing(slideAnim, {
        toValue: -(currentStep - 1) * width,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setCurrentStep((s) => s - 1);
    }
  };

  // Sélections
  const toggleSelection = (category, value) => {
    setUserData((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((v) => v !== value)
        : [...prev[category], value],
    }));
  };

  const selectOption = (category, value) => {
    setUserData((prev) => ({ ...prev, [category]: value }));
  };

  // Avatar
  const handleAvatarPress = () => {
    Alert.alert('Photo de profil', 'Comment souhaitez-vous ajouter votre photo ?', [
      { text: 'Appareil photo', onPress: () => takePhotoForAvatar() },
      { text: 'Galerie', onPress: () => pickImageForAvatar() },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const takePhotoForAvatar = async () => {
    const photo = await takePhoto();
    if (photo) setUserData((p) => ({ ...p, avatar: photo }));
  };

  const pickImageForAvatar = async () => {
    const image = await pickImage();
    if (image) setUserData((p) => ({ ...p, avatar: image }));
  };

  // Finalisation
  const completeOnboarding = async () => {
    try {
      await completeOnboardingStore({
        username: userData.username || user?.email?.split('@')[0],
        bio: userData.bio,
        cook_frequency: userData.cookingFrequency,
        cook_constraints: [
          ...userData.dietaryRestrictions,
          ...userData.foodPreferences,
        ],
        cooking_level: userData.cookingLevel,
        cooking_for: userData.cookingFor,
        avatar: userData.avatar, // { uri, type, name }
      });

      // Aller sur l’app principale (Feed)
      navigation.reset({
        index: 0,
        routes: [{ name: 'App' }], // adapte si ton root s’appelle autrement
      });
    } catch (error) {
      console.error('completeOnboarding error', error);
      Alert.alert('Erreur', "Impossible de terminer l'onboarding");
    }
  };

  // UI fragments
  const renderFoodPreferences = () => (
    <View>
      <Text style={styles.stepTitle}>{ONBOARDING_STEPS[0].title}</Text>
      <Text style={styles.stepSubtitle}>{ONBOARDING_STEPS[0].subtitle}</Text>

      <Text style={styles.sectionTitle}>Types de cuisine préférés</Text>
      <View style={styles.optionsGrid}>
        {CUISINE_TYPES.map((cuisine) => (
          <TouchableOpacity
            key={cuisine.id}
            style={[
              styles.optionCard,
              userData.foodPreferences.includes(cuisine.id) && styles.optionCardSelected,
            ]}
            onPress={() => toggleSelection('foodPreferences', cuisine.id)}
          >
            <Text style={styles.optionEmoji}>{cuisine.emoji}</Text>
            <Text style={styles.optionLabel}>{cuisine.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Restrictions alimentaires</Text>
      <View style={styles.optionsGrid}>
        {DIETARY_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionChip,
              userData.dietaryRestrictions.includes(option.id) && styles.optionChipSelected,
            ]}
            onPress={() => toggleSelection('dietaryRestrictions', option.id)}
          >
            <Text style={styles.optionChipEmoji}>{option.emoji}</Text>
            <Text
              style={[
                styles.optionChipText,
                userData.dietaryRestrictions.includes(option.id) && styles.optionChipTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCookingProfile = () => (
    <View>
      <Text style={styles.stepTitle}>{ONBOARDING_STEPS[1].title}</Text>
      <Text style={styles.stepSubtitle}>{ONBOARDING_STEPS[1].subtitle}</Text>

      <View style={styles.questionSection}>
        <Text style={styles.questionTitle}>Are you more a ...</Text>
        <View style={styles.levelOptions}>
          {COOKING_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.levelCard,
                userData.cookingLevel === level.id && styles.levelCardSelected,
              ]}
              onPress={() => selectOption('cookingLevel', level.id)}
            >
              <Text style={styles.levelLabel}>{level.label}</Text>
              <Text style={styles.levelDescription}>{level.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.questionSection}>
        <Text style={styles.questionTitle}>You cook mostly ...</Text>
        <View style={styles.frequencyOptions}>
          {COOKING_FREQUENCIES.map((freq) => (
            <TouchableOpacity
              key={freq.id}
              style={[
                styles.frequencyCard,
                userData.cookingFrequency === freq.id && styles.frequencyCardSelected,
              ]}
              onPress={() => selectOption('cookingFrequency', freq.id)}
            >
              <Text style={styles.frequencyLabel}>{freq.label}</Text>
              <Text style={styles.frequencyDescription}>{freq.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.questionSection}>
        <Text style={styles.questionTitle}>You cook for ...</Text>
        <View style={styles.cookingForOptions}>
          {COOKING_FOR_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.cookingForCard,
                userData.cookingFor.includes(opt.id) && styles.cookingForCardSelected,
              ]}
              onPress={() => toggleSelection('cookingFor', opt.id)}
            >
              <Text style={styles.cookingForLabel}>{opt.label}</Text>
              <Text style={styles.cookingForDescription}>{opt.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderProfileSetup = () => (
    <View>
      <Text style={styles.stepTitle}>{ONBOARDING_STEPS[2].title}</Text>
      <Text style={styles.stepSubtitle}>{ONBOARDING_STEPS[2].subtitle}</Text>

      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={handleAvatarPress}>
          <Avatar
            source={userData.avatar ? { uri: userData.avatar.uri } : null}
            name={userData.username || user?.email}
            size="xl"
            style={styles.avatarPicker}
          />
          <View style={styles.avatarOverlay}>
            <Text style={styles.avatarOverlayText}>📷</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Nom d'utilisateur</Text>
        <TextInput
          style={styles.usernameInput}
          placeholder="Choisissez votre nom d'utilisateur"
          value={userData.username}
          onChangeText={(t) => setUserData((p) => ({ ...p, username: t }))}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Parlez-nous de vous</Text>
        <TextInput
          style={styles.bioInput}
          placeholder="Ex: Passionné de cuisine française et de pâtisserie..."
          multiline
          numberOfLines={3}
          value={userData.bio}
          onChangeText={(t) => setUserData((p) => ({ ...p, bio: t }))}
        />
        <Text style={styles.characterCount}>
          {userData.bio?.length || 0}/150 caractères
        </Text>
      </View>
    </View>
  );

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` },
          ]}
        />
      </View>
      <Text style={styles.progressText}>
        {currentStep + 1} sur {ONBOARDING_STEPS.length}
      </Text>
    </View>
  );

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return (
          userData.foodPreferences.length > 0 ||
          userData.dietaryRestrictions.length > 0
        );
      case 1:
        return userData.cookingLevel && userData.cookingFrequency;
      case 2:
        return userData.username?.trim();
      default:
        return false;
    }
  };

  return (
    <LinearGradient colors={['#F8F9FA', '#E8F4F8']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          {currentStep > 0 && (
            <TouchableOpacity onPress={prevStep} style={styles.topBackButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          )}
          {renderProgressBar()}
        </View>

        {/* Viewport + Track : une page = toute la largeur */}
        <View style={styles.stepsViewport}>
          <Animated.View
            style={[
              styles.stepsTrack,
              { width: width * ONBOARDING_STEPS.length, transform: [{ translateX: slideAnim }] },
            ]}
          >
            <View style={[styles.step, { width }]}>
              <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
                {renderFoodPreferences()}
              </ScrollView>
            </View>

            <View style={[styles.step, { width }]}>
              <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
                {renderCookingProfile()}
              </ScrollView>
            </View>

            <View style={[styles.step, { width }]}>
              <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
                {renderProfileSetup()}
              </ScrollView>
            </View>
          </Animated.View>
        </View>

        {/* Bouton */}
        <View style={styles.navigationContainer}>
          <Button
            title={currentStep === ONBOARDING_STEPS.length - 1 ? "Let's gooooo" : "Suivant →"}
            onPress={nextStep}
            disabled={!canProceed()}
            style={styles.nextButton}
            size="large"
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },

  header: { position: 'relative' },
  topBackButton: { position: 'absolute', left: SPACING.lg, top: SPACING.md, paddingVertical: SPACING.md, zIndex: 1 },

  progressContainer: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, alignItems: 'center' },
  progressBar: { width: '100%', height: 4, backgroundColor: COLORS.border, borderRadius: 2, marginBottom: SPACING.sm },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },
  progressText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.textMuted, fontWeight: TYPOGRAPHY.weights.medium },

  // Viewport / Track
  stepsViewport: { flex: 1, overflow: 'hidden' },
  stepsTrack: { flexDirection: 'row' },

  // Page = largeur écran
  step: { paddingHorizontal: SPACING.lg },
  stepContent: { flexGrow: 1, paddingTop: SPACING.lg },

  stepTitle: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text, textAlign: 'center', marginBottom: SPACING.sm },
  stepSubtitle: { fontSize: TYPOGRAPHY.sizes.lg, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.xl },

  // Food Pref
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text, marginBottom: SPACING.md },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xl },
  optionCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', minWidth: 100, borderWidth: 2, borderColor: COLORS.border },
  optionCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryAlpha },
  optionEmoji: { fontSize: 24, marginBottom: SPACING.xs },
  optionLabel: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.medium, color: COLORS.text },

  optionChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  optionChipSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryAlpha },
  optionChipEmoji: { fontSize: 16, marginRight: SPACING.xs },
  optionChipText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text },
  optionChipTextSelected: { color: COLORS.primary, fontWeight: TYPOGRAPHY.weights.semibold },

  // Cooking Profile
  questionSection: { marginBottom: SPACING.xl },
  questionTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text, marginBottom: SPACING.md },

  levelOptions: { gap: SPACING.sm },
  levelCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.lg, borderWidth: 2, borderColor: COLORS.border },
  levelCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryAlpha },
  levelLabel: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text, marginBottom: SPACING.xs },
  levelDescription: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.textSecondary },

  frequencyOptions: { gap: SPACING.sm },
  frequencyCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  frequencyCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryAlpha },
  frequencyLabel: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text },
  frequencyDescription: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.textSecondary },

  cookingForOptions: { gap: SPACING.sm },
  cookingForCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  cookingForCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryAlpha },
  cookingForLabel: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text },
  cookingForDescription: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.textSecondary },

  // Profile Setup
  avatarSection: { alignItems: 'center', marginBottom: SPACING.xl },
  avatarPicker: { position: 'relative' },
  avatarOverlay: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.primary, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: COLORS.white },
  avatarOverlayText: { fontSize: 16 },

  inputSection: { marginBottom: SPACING.lg },
  inputLabel: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text, marginBottom: SPACING.sm },
  usernameInput: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  bioInput: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text, textAlignVertical: 'top', borderWidth: 1, borderColor: COLORS.border, minHeight: 80 },
  characterCount: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textMuted, textAlign: 'right', marginTop: SPACING.xs },

  // Navigation
  navigationContainer: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg },
  backButtonText: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.textSecondary, fontWeight: TYPOGRAPHY.weights.medium },
  nextButton: { minWidth: 120 },
});

export { OnboardingScreen };
