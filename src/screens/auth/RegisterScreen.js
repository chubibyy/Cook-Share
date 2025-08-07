// src/screens/auth/RegisterScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../../components/common/Button';
import { Input } from '../../components/common';
import { useAuthStore } from '../../stores/authStore';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../utils/constants';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  
  const { signUp, loading } = useAuthStore();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Prénom requis';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Nom requis';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Minimum 6 caractères';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      const result = await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        username: `${formData.firstName}${formData.lastName}`.toLowerCase()
      });
      
      if (result.success) {
        Alert.alert(
          'Inscription réussie !',
          'Vérifiez votre email pour confirmer votre compte.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert('Erreur d\'inscription', result.error);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  };

  return (
    <LinearGradient
      colors={['#F8F9FA', '#E8F4F8']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <View style={[styles.circle, styles.registerCircle1]} />
                <View style={[styles.circle, styles.registerCircle2]} />
                <Text style={styles.logoEmoji}>🧑‍🍳</Text>
              </View>
              
              <Text style={styles.headerTitle}>Rejoignez-nous !</Text>
              <Text style={styles.headerSubtitle}>
                Créez votre compte et commencez à partager vos créations
              </Text>
            </View>

            {/* Formulaire */}
            <View style={styles.formContainer}>
              <View style={styles.nameRow}>
                <Input
                  label="Prénom"
                  placeholder="Prénom"
                  value={formData.firstName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
                  error={errors.firstName}
                  style={styles.nameInput}
                />
                
                <Input
                  label="Nom"
                  placeholder="Nom"
                  value={formData.lastName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
                  error={errors.lastName}
                  style={styles.nameInput}
                />
              </View>

              <Input
                label="Email"
                placeholder="votre@email.com"
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Text style={styles.inputIcon}>📧</Text>}
              />

              <Input
                label="Mot de passe"
                placeholder="Minimum 6 caractères"
                value={formData.password}
                onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                error={errors.password}
                secureTextEntry
                leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
              />

              <Input
                label="Confirmer le mot de passe"
                placeholder="Retapez votre mot de passe"
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                error={errors.confirmPassword}
                secureTextEntry
                leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
              />

              <Button
                title="Créer mon compte"
                onPress={handleSubmit}
                loading={loading}
                style={styles.submitButton}
                size="large"
              />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Déjà un compte ?{' '}
                <Text 
                  style={styles.footerLink}
                  onPress={() => navigation.navigate('Login')}
                >
                  Se connecter
                </Text>
              </Text>
              
              <Text style={styles.termsText}>
                En vous inscrivant, vous acceptez nos{' '}
                <Text style={styles.termsLink}>conditions d'utilisation</Text>
                {' '}et notre{' '}
                <Text style={styles.termsLink}>politique de confidentialité</Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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

export {RegisterScreen };