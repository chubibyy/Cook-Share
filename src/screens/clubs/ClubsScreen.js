import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useClubStore } from '../../stores/clubStore'
import { useAuthStore } from '../../stores/authStore'
import { ClubCard } from '../../components/cards/ClubCard'
import Button from '../../components/common/Button'
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../utils/constants'

export const ClubsScreen = ({ navigation }) => {
  const { clubs, loading, error, loadClubs, joinClub, leaveClub } = useClubStore()
  const user = useAuthStore((s) => s.user)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadClubs()
  }, [loadClubs])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadClubs()
    setRefreshing(false)
  }, [loadClubs])

  const handleJoin = async (clubId) => {
    if (!user) return Alert.alert('Connexion requise', 'Veuillez vous connecter pour rejoindre un club')
    const res = await joinClub(clubId)
    if (!res.success) Alert.alert('Erreur', res.error)
  }

  const handleLeave = async (clubId) => {
    const res = await leaveClub(clubId)
    if (!res.success) Alert.alert('Erreur', res.error)
  }

  const renderItem = ({ item }) => (
    <ClubCard
      club={item}
      onPress={(club) => navigation.navigate('ClubDetail', { clubId: club.id })}
      onJoin={handleJoin}
      onLeave={handleLeave}
      style={styles.card}
    />
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>        
        <Text style={styles.title}>Clubs</Text>
        <Button title="Créer un club" onPress={() => navigation.navigate('CreateClub')} size="small" />
      </View>

      <FlatList
        data={clubs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={!loading ? (
          <View style={styles.empty}>            
            <Text style={styles.emptyTitle}>Aucun club pour le moment</Text>
            <Text style={styles.emptyText}>Créez votre club ou rejoignez-en un existant.</Text>
            <Button title="Créer un club" onPress={() => navigation.navigate('CreateClub')} />
          </View>
        ) : null}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  title: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text },
  list: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl },
  card: { marginVertical: SPACING.xs },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  emptyTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text, marginBottom: SPACING.sm },
  emptyText: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.textSecondary, marginBottom: SPACING.md, textAlign: 'center' },
})

export default ClubsScreen
