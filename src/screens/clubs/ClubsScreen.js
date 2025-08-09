import React, { useEffect, useState, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useClubStore } from '../../stores/clubStore'
import { useAuthStore } from '../../stores/authStore'
import { ClubCard } from '../../components/cards/ClubCard'
import Button from '../../components/common/Button'
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../utils/constants'

export const ClubsScreen = ({ navigation }) => {
  const { clubs, loading, error, loadClubs, joinClub, leaveClub, requestToJoinClub } = useClubStore()
  const user = useAuthStore((s) => s.user)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState('all') // 'all' | 'joined'

  useEffect(() => {
    loadClubs()
  }, [loadClubs])

  // Refresh automatique à chaque fois que l'écran reçoit le focus
  useFocusEffect(
    useCallback(() => {
      console.log('🏛️ [FOCUS] ClubsScreen reçoit le focus - refresh automatique')
      loadClubs()
    }, [loadClubs])
  )

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

  const handleRequestJoin = async (clubId) => {
    if (!user) return Alert.alert('Connexion requise', 'Veuillez vous connecter pour demander à rejoindre un club')
    const res = await requestToJoinClub(clubId)
    if (res.success) {
      Alert.alert('Demande envoyée', 'Votre demande d\'adhésion a été envoyée au propriétaire du club')
    } else {
      Alert.alert('Erreur', res.error)
    }
  }

  const handleShowPendingRequest = (club, requestStatus) => {
    if (requestStatus?.status === 'pending') {
      Alert.alert(
        '⏳ Demande en attente',
        `Votre demande d'adhésion au club "${club.name}" a été envoyée au propriétaire.\n\nVous recevrez une notification une fois qu'elle sera traitée.\n\nDemande envoyée le ${new Date(requestStatus.requested_at).toLocaleDateString('fr-FR')}`,
        [{ text: 'OK', style: 'default' }]
      )
    } else if (requestStatus?.status === 'rejected') {
      Alert.alert(
        '❌ Demande refusée',
        `Votre demande d'adhésion au club "${club.name}" a été refusée par le propriétaire.`,
        [{ text: 'OK', style: 'default' }]
      )
    }
  }

  // Filtrer les clubs selon le filtre sélectionné
  const filteredClubs = clubs.filter(club => {
    if (filter === 'joined') {
      return club.userMembership !== null
    }
    return true // 'all'
  })

  const renderItem = ({ item }) => (
    <ClubCard
      club={item}
      onPress={(club) => navigation.navigate('ClubDetail', { clubId: club.id })}
      onJoin={handleJoin}
      onLeave={handleLeave}
      onRequestJoin={handleRequestJoin}
      onShowPendingRequest={handleShowPendingRequest}
      style={styles.card}
    />
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>        
        <Text style={styles.title}>Clubs</Text>
        <Button title="Créer un club" onPress={() => navigation.navigate('CreateClub')} size="small" />
      </View>

      {/* Filtres */}
      <View style={styles.filters}>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Tous les clubs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'joined' && styles.filterButtonActive]}
          onPress={() => setFilter('joined')}
        >
          <Text style={[styles.filterText, filter === 'joined' && styles.filterTextActive]}>
            Clubs rejoints ({clubs.filter(c => c.userMembership).length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredClubs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={!loading ? (
          <View style={styles.empty}>            
            <Text style={styles.emptyTitle}>
              {filter === 'joined' ? 'Aucun club rejoint' : 'Aucun club pour le moment'}
            </Text>
            <Text style={styles.emptyText}>
              {filter === 'joined' 
                ? 'Vous n\'avez rejoint aucun club pour le moment.'
                : 'Créez votre club ou rejoignez-en un existant.'
              }
            </Text>
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
  filters: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  list: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl },
  card: { marginVertical: SPACING.xs },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  emptyTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text, marginBottom: SPACING.sm },
  emptyText: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.textSecondary, marginBottom: SPACING.md, textAlign: 'center' },
})

export default ClubsScreen
