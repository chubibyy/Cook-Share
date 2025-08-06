// App.js - Test détaillé des variables
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

export default function App() {
  const [status, setStatus] = useState('Test en cours...');

  useEffect(() => {
    const testEnvVars = () => {
      console.log('=== DEBUG ENV VARS ===');
      console.log('EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
      console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'Présente' : 'Manquante');
      
      const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!url) {
        setStatus('❌ EXPO_PUBLIC_SUPABASE_URL manquante');
        return;
      }
      
      if (!key) {
        setStatus('❌ EXPO_PUBLIC_SUPABASE_ANON_KEY manquante');
        return;
      }
      
      if (!url.includes('supabase.co')) {
        setStatus('❌ URL Supabase invalide');
        return;
      }
      
      setStatus('✅ Variables Supabase OK !');
    };

    testEnvVars();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍽️ PlateUp</Text>
      <Text style={styles.status}>{status}</Text>
      <Text style={styles.debug}>
        Check console pour détails
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  status: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  debug: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  }
});