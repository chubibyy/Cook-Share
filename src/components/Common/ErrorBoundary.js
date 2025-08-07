// src/components/common/ErrorBoundary.js - Gestion d'erreurs globale
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from './Button';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../utils/constants';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // En production, envoyer l'erreur à un service de monitoring
    if (!__DEV__) {
      // TODO: Intégrer Sentry ou autre service de monitoring
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService = (error, errorInfo) => {
    // Service de logging des erreurs
    console.log('Logging error to service:', { error, errorInfo });
  };

  handleRestart = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>😅</Text>
            <Text style={styles.errorTitle}>Oups ! Une erreur est survenue</Text>
            <Text style={styles.errorMessage}>
              Ne vous inquiétez pas, nos chefs travaillent déjà sur une solution.
            </Text>
            
            {__DEV__ && (
              <View style={styles.debugInfo}>
                <Text style={styles.debugTitle}>Debug Info:</Text>
                <Text style={styles.debugText}>
                  {this.state.error?.toString()}
                </Text>
              </View>
            )}
            
            <Button
              title="Relancer l'app"
              onPress={this.handleRestart}
              style={styles.restartButton}
            />
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    maxWidth: 300,
    width: '100%',
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  errorMessage: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.base * 1.4,
    marginBottom: SPACING.xl,
  },
  debugInfo: {
    backgroundColor: COLORS.error + '10',
    borderRadius: RADIUS.base,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    width: '100%',
  },
  debugTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.error,
    marginBottom: SPACING.xs,
  },
  debugText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.error,
    fontFamily: 'monospace',
  },
  restartButton: {
    minWidth: 150,
  },
});

export  {ErrorBoundary}