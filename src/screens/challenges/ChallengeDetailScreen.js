import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRoute } from '@react-navigation/native'
import { useChallengeStore } from '../../stores/challengeStore'
import Button from '../../components/common/Button'
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/constants'

export const ChallengeDetailScreen = ({ navigation }) => {
  const route = useRoute()
  const { challengeId } = route.params
  const { currentChallenge, getChallengeById, submitChallengeSession, loading } = useChallengeStore()

  useEffect(() => {
    getChallengeById(challengeId)
  }, [challengeId, getChallengeById])

  const onSubmitSession = async () => {
    // Cette action devrait s'ouvrir sur une sélection de session; placeholder:
    Alert.alert('Soumission', 'Sélectionnez une de vos créations depuis votre profil (à implémenter)')
  }

  if (!currentChallenge) return null

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.title}>{currentChallenge.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.desc}>{currentChallenge.description}</Text>
        <Text style={styles.meta}>Contrainte: {currentChallenge.constraint_text}</Text>
        <Text style={styles.meta}>Participants: {currentChallenge.participantsCount}</Text>
        <Text style={styles.meta}>Temps restant: {currentChallenge.timeLeft}</Text>
      </View>

      <View style={styles.footer}>
        {currentChallenge.isActive && (
          <Button title="Soumettre une session" onPress={onSubmitSession} />
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md },
  back: { fontSize: 22, color: COLORS.primary },
  title: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text },
  content: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.lg },
  desc: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text, marginBottom: SPACING.sm },
  meta: { color: COLORS.textSecondary, marginBottom: 4 },
  footer: { padding: SPACING.md },
})

export default ChallengeDetailScreen
