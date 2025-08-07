// src/screens/auth/WelcomeScreen.js - Version simplifiée
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/common/Button';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../utils/constants';

const { width } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  return (
    <LinearGradient
      colors={['#F8F9FA', '#E8F4F8']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.illustration}>
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />
            <View style={styles.chefHat}>
              <Text style={styles.chefEmoji}>👨‍🍳</Text>
            </View>
          </View>
        </View>

        {/* Texte principal */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            You <Text style={styles.highlightText}>cook</Text>, you{' '}
            <Text style={styles.highlightText}>share</Text>, you{'\n'}
            <Text style={styles.highlightText}>inspire</Text>...
          </Text>
          
          <Text style={styles.subtitle}>
            Rejoignez la plus grande communauté de passionnés de cuisine.
            Partagez vos créations et découvrez de nouvelles saveurs.
          </Text>
        </View>

        {/* Boutons */}
        <View style={styles.buttonContainer}>
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
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

// Styles communs
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
    width: 200,
    height: 200,
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
    top: 20,
    left: 10,
  },
  circle2: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.primary + '30',
    bottom: 30,
    right: 15,
  },
  chefHat: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.white,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  chefEmoji: {
    fontSize: 32,
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
    backgroundColor: COLORS.primaryAlpha,
    borderRadius: 40,
  },
  logoEmoji: {
    fontSize: 32,
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
  footer: {
    alignItems: 'center',
    paddingBottom: SPACING.xl,
  },
  footerText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  footerLink: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});

export { WelcomeScreen};