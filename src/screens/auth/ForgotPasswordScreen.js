// src/screens/auth/ForgotPasswordScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../../components/common/Button';
import { Input } from '../../components/common';
import { authService } from '../../services/auth';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../utils/constants';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Email requis');
      return;
    }

    if (!validateEmail(email)) {
      setError('Email invalide');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.resetPassword(email);
      setSent(true);
    } catch (error) {
      setError('Impossible d\'envoyer l\'email de récupération');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <LinearGradient
        colors={['#F8F9FA', '#E8F4F8']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.successContainer}>
            {/* Illustration de succès */}
            <View style={styles.successIcon}>
              <Text style={styles.successEmoji}>📧</Text>
            </View>
            
            <Text style={styles.successTitle}>Email envoyé !</Text>
            <Text style={styles.successText}>
              Nous avons envoyé un lien de récupération à{'\n'}
              <Text style={styles.emailText}>{email}</Text>
            </Text>
            <Text style={styles.successSubtext}>
              Vérifiez votre boîte mail et suivez les instructions pour réinitialiser votre mot de passe.
            </Text>

            <Button
              title="Retour à la connexion"
              onPress={() => navigation.navigate('Login')}
              style={styles.backButton}
            />

            <TouchableOpacity 
              onPress={handleSubmit}
              style={styles.resendButton}
            >
              <Text style={styles.resendButtonText}>
                Renvoyer l'email
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#F8F9FA', '#E8F4F8']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backIcon}
            >
              <Text style={styles.backIconText}>←</Text>
            </TouchableOpacity>
            
            <View style={styles.iconContainer}>
              <Text style={styles.iconEmoji}>🔐</Text>
            </View>
            
            <Text style={styles.title}>Mot de passe oublié ?</Text>
            <Text style={styles.subtitle}>
              Pas de problème ! Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </Text>
          </View>

          {/* Formulaire */}
          <View style={styles.form}>
            <Input
              label="Adresse email"
              placeholder="votre@email.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }}
              error={error}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Text style={styles.inputIcon}>📧</Text>}
            />

            <Button
              title="Envoyer le lien"
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
              size="large"
            />
          </View>

          {/* Alternative */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Vous vous souvenez de votre mot de passe ?{' '}
              <Text 
                style={styles.footerLink}
                onPress={() => navigation.navigate('Login')}
              >
                Se connecter
              </Text>
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

// Styles pour ForgotPasswordScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.xl,
  },
  backIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: SPACING.md,
  },
  backIconText: {
    fontSize: 24,
    color: COLORS.text,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.primaryAlpha,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.base * 1.4,
    paddingHorizontal: SPACING.md,
  },
  form: {
    paddingVertical: SPACING.xl,
  },
  inputIcon: {
    fontSize: 18,
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
  
  // Success State
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  successIcon: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.success + '20',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  successEmoji: {
    fontSize: 48,
  },
  successTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  successText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.lg * 1.4,
    marginBottom: SPACING.sm,
  },
  emailText: {
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
  },
  successSubtext: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.base * 1.4,
    marginBottom: SPACING.xxl,
  },
  backButton: {
    marginBottom: SPACING.lg,
    minWidth: 200,
  },
  resendButton: {
    paddingVertical: SPACING.md,
  },
  resendButtonText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
    textDecorationLine: 'underline',
  },
});

export { ForgotPasswordScreen};
