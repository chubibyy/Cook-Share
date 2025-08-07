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
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../utils/constants';

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

  const { updateProfile, user } = useAuthStore();
  const { takePhoto, pickImage } = useCamera();
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Données des étapes d'onboarding
  const steps = [
    {
      title: "Tell us about your food preference...",
      subtitle: "Wich cuisine do you prefer ?",
      type: 'food_preferences'
    },
    {
      title: "Describe your cooking style",
      subtitle: "Help us personalize your experience",
      type: 'cooking_profile'
    },
    {
      title: "Personalize your profile",
      subtitle: "Almost done! Let's make your profile shine",
      type: 'profile_setup'
    }
  ];

  // Options pour chaque étape
  const cuisineTypes = [
    { id: 'french', label: 'Française', emoji: '🇫🇷' },
    { id: 'italian', label: 'Italienne', emoji: '🇮🇹' },
    { id: 'asian', label: 'Asiatique', emoji: '🥢' },
    { id: 'mexican', label: 'Mexicaine', emoji: '🌮' },
    { id: 'mediterranean', label: 'Méditerranéenne', emoji: '🫒' },
    { id: 'indian', label: 'Indienne', emoji: '🍛' },
  ];

  const dietaryOptions = [
    { id: 'vegetarian', label: 'Végétarien', emoji: '🥬' },
    { id: 'vegan', label: 'Végétalien', emoji: '🌱' },
    { id: 'gluten_free', label: 'Sans gluten', emoji: '🌾' },
    { id: 'halal', label: 'Halal', emoji: '☪️' },
    { id: 'kosher', label: 'Casher', emoji: '✡️' },
    { id: 'keto', label: 'Cétogène', emoji: '🥓' },
  ];

  const cookingLevels = [
    { id: 'beginner', label: 'Beginner', description: 'Je débute en cuisine' },
    { id: 'regular', label: 'Regular', description: 'Je cuisine régulièrement' },
    { id: 'enthusiast', label: 'Enthusiast', description: 'Passionné de cuisine' },
  ];

  const cookingFrequencies = [
    { id: 'weekdays', label: 'Weekdays', description: 'En semaine principalement' },
    { id: 'everyday', label: 'Everyday', description: 'Tous les jours' },
    { id: 'when_i_can', label: 'When I can', description: 'Quand j\'ai le temps' },
  ];

  const cookingForOptions = [
    { id: 'myself', label: 'My self', description: 'Juste pour moi' },
    { id: 'family', label: 'My family', description: 'Pour ma famille' },
    { id: 'friends', label: 'My friends', description: 'Pour mes amis' },
  ];

  // Navigation entre étapes
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      Animated.timing(slideAnim, {
        toValue: -(currentStep + 1) * width,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setCurrentStep(currentStep + 1);
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
      setCurrentStep(currentStep - 1);
    }
  };

  // Gestion des sélections multiples
  const toggleSelection = (category, value) => {
    setUserData(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  // Gestion des sélections uniques
  const selectOption = (category, value) => {
    setUserData(prev => ({ ...prev, [category]: value }));
  };

  // Gestion de l'avatar
  const handleAvatarPress = () => {
    Alert.alert(
      'Photo de profil',
      'Comment souhaitez-vous ajouter votre photo ?',
      [
        { text: 'Appareil photo', onPress: () => takePhotoForAvatar() },
        { text: 'Galerie', onPress: () => pickImageForAvatar() },
        { text: 'Annuler', style: 'cancel' }
      ]
    );
  };

  const takePhotoForAvatar = async () => {
    const photo = await takePhoto();
    if (photo) {
      setUserData(prev => ({ ...prev, avatar: photo }));
    }
  };

  const pickImageForAvatar = async () => {
    const image = await pickImage();
    if (image) {
      setUserData(prev => ({ ...prev, avatar: image }));
    }
  };

  // Finalisation de l'onboarding
  const completeOnboarding = async () => {
    try {
      await updateProfile({
        username: userData.username || user.email.split('@')[0],
        bio: userData.bio,
        cook_frequency: userData.cookingFrequency,
        cook_constraints: [
          ...userData.dietaryRestrictions,
          ...userData.foodPreferences
        ],
        cooking_level: userData.cookingLevel,
        cooking_for: userData.cookingFor,
        onboarding_completed: true
      });
      
      // Navigation vers l'app principale sera gérée par AuthNavigator
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder vos préférences');
    }
  };

  // Rendu des étapes
  const renderFoodPreferences = () => (
    <View>
      <Text style={styles.stepTitle}>{steps[0].title}</Text>
      <Text style={styles.stepSubtitle}>{steps[0].subtitle}</Text>
      
      {/* Sélection des types de cuisine */}
      <Text style={styles.sectionTitle}>Types de cuisine préférés</Text>
      <View style={styles.optionsGrid}>
        {cuisineTypes.map(cuisine => (
          <TouchableOpacity
            key={cuisine.id}
            style={[
              styles.optionCard,
              userData.foodPreferences.includes(cuisine.id) && styles.optionCardSelected
            ]}
            onPress={() => toggleSelection('foodPreferences', cuisine.id)}
          >
            <Text style={styles.optionEmoji}>{cuisine.emoji}</Text>
            <Text style={styles.optionLabel}>{cuisine.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Restrictions alimentaires */}
      <Text style={styles.sectionTitle}>Restrictions alimentaires</Text>
      <View style={styles.optionsGrid}>
        {dietaryOptions.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionChip,
              userData.dietaryRestrictions.includes(option.id) && styles.optionChipSelected
            ]}
            onPress={() => toggleSelection('dietaryRestrictions', option.id)}
          >
            <Text style={styles.optionChipEmoji}>{option.emoji}</Text>
            <Text style={[
              styles.optionChipText,
              userData.dietaryRestrictions.includes(option.id) && styles.optionChipTextSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCookingProfile = () => (
    <View>
      <Text style={styles.stepTitle}>{steps[1].title}</Text>
      <Text style={styles.stepSubtitle}>{steps[1].subtitle}</Text>
      
      {/* Niveau de cuisine */}
      <View style={styles.questionSection}>
        <Text style={styles.questionTitle}>Are you more a ...</Text>
        <View style={styles.levelOptions}>
          {cookingLevels.map(level => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.levelCard,
                userData.cookingLevel === level.id && styles.levelCardSelected
              ]}
              onPress={() => selectOption('cookingLevel', level.id)}
            >
              <Text style={styles.levelLabel}>{level.label}</Text>
              <Text style={styles.levelDescription}>{level.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Fréquence de cuisine */}
      <View style={styles.questionSection}>
        <Text style={styles.questionTitle}>You cook mostly ...</Text>
        <View style={styles.frequencyOptions}>
          {cookingFrequencies.map(freq => (
            <TouchableOpacity
              key={freq.id}
              style={[
                styles.frequencyCard,
                userData.cookingFrequency === freq.id && styles.frequencyCardSelected
              ]}
              onPress={() => selectOption('cookingFrequency', freq.id)}
            >
              <Text style={styles.frequencyLabel}>{freq.label}</Text>
              <Text style={styles.frequencyDescription}>{freq.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Pour qui vous cuisinez */}
      <View style={styles.questionSection}>
        <Text style={styles.questionTitle}>You cook for ...</Text>
        <View style={styles.cookingForOptions}>
          {cookingForOptions.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.cookingForCard,
                userData.cookingFor.includes(option.id) && styles.cookingForCardSelected
              ]}
              onPress={() => toggleSelection('cookingFor', option.id)}
            >
              <Text style={styles.cookingForLabel}>{option.label}</Text>
              <Text style={styles.cookingForDescription}>{option.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderProfileSetup = () => (
    <View>
      <Text style={styles.stepTitle}>{steps[2].title}</Text>
      <Text style={styles.stepSubtitle}>{steps[2].subtitle}</Text>
      
      {/* Avatar */}
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

      {/* Username */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Nom d'utilisateur</Text>
        <TextInput
          style={styles.usernameInput}
          placeholder="Choisissez votre nom d'utilisateur"
          value={userData.username}
          onChangeText={(text) => setUserData(prev => ({ ...prev, username: text }))}
          autoCapitalize="none"
        />
      </View>

      {/* Bio */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Parlez-nous de vous</Text>
        <TextInput
          style={styles.bioInput}
          placeholder="Ex: Passionné de cuisine française et de pâtisserie..."
          multiline
          numberOfLines={3}
          value={userData.bio}
          onChangeText={(text) => setUserData(prev => ({ ...prev, bio: text }))}
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
            { width: `${((currentStep + 1) / steps.length) * 100}%` }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>
        {currentStep + 1} sur {steps.length}
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
    <LinearGradient
      colors={['#F8F9FA', '#E8F4F8']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          {currentStep > 0 && (
            <TouchableOpacity onPress={prevStep} style={styles.topBackButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          )}
          {renderProgressBar()}
        </View>

        {/* Steps Container */}
        <Animated.View
          style={[
            styles.stepsContainer,
            { transform: [{ translateX: slideAnim }] }
          ]}
        >
          <View style={[styles.step, { width }]}> 
            <ScrollView
              contentContainerStyle={styles.stepContent}
              showsVerticalScrollIndicator={false}
            >
              {renderFoodPreferences()}
            </ScrollView>
          </View>
          <View style={[styles.step, { width }]}> 
            <ScrollView
              contentContainerStyle={styles.stepContent}
              showsVerticalScrollIndicator={false}
            >
              {renderCookingProfile()}
            </ScrollView>
          </View>
          <View style={[styles.step, { width }]}> 
            <ScrollView
              contentContainerStyle={styles.stepContent}
              showsVerticalScrollIndicator={false}
            >
              {renderProfileSetup()}
            </ScrollView>
          </View>
        </Animated.View>

        {/* Navigation Button */}
        <View style={styles.navigationContainer}>
          <Button
            title={currentStep === steps.length - 1 ? "Let's gooooo" : "Suivant →"}
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
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    position: 'relative',
  },
  topBackButton: {
    position: 'absolute',
    left: SPACING.lg,
    top: SPACING.md,
    paddingVertical: SPACING.md,
    zIndex: 1,
  },
  progressContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  stepsContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  step: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  stepContent: {
    flexGrow: 1,
    paddingTop: SPACING.lg,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  stepSubtitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  
  // Food Preferences Step
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  optionCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryAlpha,
  },
  optionEmoji: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  optionLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryAlpha,
  },
  optionChipEmoji: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  optionChipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text,
  },
  optionChipTextSelected: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  
  // Cooking Profile Step
  questionSection: {
    marginBottom: SPACING.xl,
  },
  questionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  levelOptions: {
    gap: SPACING.sm,
  },
  levelCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  levelCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryAlpha,
  },
  levelLabel: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  levelDescription: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
  },
  frequencyOptions: {
    gap: SPACING.sm,
  },
  frequencyCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  frequencyCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryAlpha,
  },
  frequencyLabel: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
  },
  frequencyDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  cookingForOptions: {
    gap: SPACING.sm,
  },
  cookingForCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cookingForCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryAlpha,
  },
  cookingForLabel: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
  },
  cookingForDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  
  // Profile Setup Step
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatarPicker: {
    position: 'relative',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatarOverlayText: {
    fontSize: 16,
  },
  inputSection: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  usernameInput: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bioInput: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 80,
  },
  characterCount: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  
  // Navigation
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  backButtonText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  nextButton: {
    minWidth: 120,
  },
});

export { OnboardingScreen };