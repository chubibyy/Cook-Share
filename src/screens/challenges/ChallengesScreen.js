import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useChallengeStore } from '../../stores/challengeStore'
import { useAuthStore } from '../../stores/authStore'
import { ChallengeCard } from '../../components/cards/ChallengeCard'
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/constants'

export const ChallengesScreen = ({ navigation }) => {
  const { activeChallenges, pastChallenges, loadChallenges, participateInChallenge, loading } = useChallengeStore()
  const user = useAuthStore((s) => s.user)
  const [tab, setTab] = useState('active')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadChallenges('all')
  }, [loadChallenges])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadChallenges('all')
    setRefreshing(false)
  }, [loadChallenges])

  const onParticipate = async (challenge) => {
    if (!user) return Alert.alert('Connexion requise', 'Veuillez vous connecter pour participer')
    const res = await participateInChallenge(challenge.id)
    if (!res.success) Alert.alert('Erreur', res.error)
  }

  const renderItem = ({ item }) => (
    <ChallengeCard challenge={item} onPress={(c) => navigation.navigate('ChallengeDetail', { challengeId: c.id })} onParticipate={onParticipate} />
  )

  const data = tab === 'active' ? activeChallenges : pastChallenges

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Challenges</Text>
        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setTab('active')}><Text style={[styles.tab, tab==='active' && styles.tabActive]}>Actifs</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setTab('past')}><Text style={[styles.tab, tab==='past' && styles.tabActive]}>Terminés</Text></TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SPACING.md },
  title: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text, marginBottom: SPACING.sm },
  tabs: { flexDirection: 'row', gap: SPACING.md },
  tab: { color: COLORS.textSecondary },
  tabActive: { color: COLORS.primary, fontWeight: TYPOGRAPHY.weights.semibold },
  list: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl },
})

export default ChallengesScreen
