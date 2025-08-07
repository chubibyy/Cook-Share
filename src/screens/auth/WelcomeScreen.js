// src/screens/auth/WelcomeScreen.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/common/Button';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../utils/constants';

const { width } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={['#F8F9FA', '#E8F4F8']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Illustration placeholder - remplacez par votre SVG */}
        <Animated.View 
          style={[
            styles.illustrationContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.illustration}>
            {/* Cercles organiques inspirés de votre design */}
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />
            <View style={[styles.circle, styles.circle3]} />
            <View style={styles.chefHat}>
              <Text style={styles.chefEmoji}>👨‍🍳</Text>
            </View>
            {/* Éléments décoratifs */}
            <View style={[styles.decorElement, styles.element1]}>🥕</View>
            <View style={[styles.decorElement, styles.element2]}>🌿</View>
            <View style={[styles.decorElement, styles.element3]}>🍅</View>
          </View>
        </Animated.View>

        {/* Texte principal */}
        <Animated.View 
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.title}>
            You <Text style={styles.highlightText}>cook</Text>, you{' '}
            <Text style={styles.highlightText}>share</Text>, you{'\n'}
            <Text style={styles.highlightText}>inspire</Text>...
          </Text>
          
          <Text style={styles.subtitle}>
            Rejoignez la plus grande communauté de passionnés de cuisine.
            Partagez vos créations et découvrez de nouvelles saveurs.
          </Text>
        </Animated.View>

        {/* Boutons d'action */}
        <Animated.View 
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Button
            title="Commencer l'aventure"
            onPress={() => navigation.navigate('Register')}
            style={styles.primaryButton}
            variant="primary"
            size="large"
          />
          
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>
              Déjà membre ? Se connecter
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Indicateur de scroll ou version */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>PlateUp v1.0</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

// Styles communs pour tous les écrans
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
  },
  
  // Welcome Screen
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xxxl,
  },
  illustration: {
    width: width * 0.8,
    height: width * 0.8,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
  },
  circle1: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.secondary + '40',
    top: '20%',
    left: '10%',
  },
  circle2: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.primary + '30',
    bottom: '30%',
    right: '15%',
  },
  circle3: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.accent + '50',
    top: '10%',
    right: '20%',
  },
  chefHat: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.white,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  chefEmoji: {
    fontSize: 40,
  },
  decorElement: {
    position: 'absolute',
    fontSize: 24,
  },
  element1: {
    top: '40%',
    left: '5%',
  },
  element2: {
    bottom: '10%',
    left: '20%',
  },
  element3: {
    top: '60%',
    right: '10%',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.xxxl * 1.2,
    marginBottom: SPACING.lg,
  },
  highlightText: {
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.lg * 1.4,
    marginBottom: SPACING.xl,
  },
  buttonContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  primaryButton: {
    marginBottom: SPACING.md,
  },
  secondaryButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: SPACING.lg,
  },
  footerText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textMuted,
  },
  
  // Login/Register Screens
  header: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  logoContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  loginCircle1: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.primary + '20',
    top: 0,
    left: 0,
  },
  loginCircle2: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.secondary + '30',
    bottom: 0,
    right: 0,
  },
  registerCircle1: {
    width: 70,
    height: 70,
    backgroundColor: COLORS.accent + '20',
    top: 5,
    left: 5,
  },
  registerCircle2: {
    width: 35,
    height: 35,
    backgroundColor: COLORS.primary + '40',
    bottom: 5,
    right: 5,
  },
  logoEmoji: {
    fontSize: 32,
    position: 'absolute',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.base * 1.4,
  },
  formContainer: {
    flex: 1,
    paddingVertical: SPACING.lg,
  },
  nameRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  nameInput: {
    flex: 1,
  },
  inputIcon: {
    fontSize: 18,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  forgotPasswordText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  submitButton: {
    marginTop: SPACING.lg,
  },
  footerLink: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  termsText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: TYPOGRAPHY.sizes.xs * 1.4,
  },
  termsLink: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
});

export { WelcomeScreen };