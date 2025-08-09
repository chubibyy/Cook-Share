import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRoute } from '@react-navigation/native'
import { useClubStore } from '../../stores/clubStore'
import { Avatar } from '../../components/common'
import Button from '../../components/common/Button'
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../utils/constants'

export const JoinRequestsScreen = ({ navigation }) => {
  const route = useRoute()
  const { clubId, clubName } = route.params
  const { joinRequests, requestsLoading, loadJoinRequests, handleJoinRequest } = useClubStore()
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadJoinRequests(clubId)
  }, [clubId, loadJoinRequests])

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await loadJoinRequests(clubId)
    } catch (error) {
      console.error('Error refreshing requests:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleApprove = async (requestId, username) => {
    Alert.alert(
      'Approuver la demande',
      `Êtes-vous sûr de vouloir accepter ${username} dans le club ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Accepter',
          onPress: async () => {
            const result = await handleJoinRequest(requestId, 'approve')
            if (result.success) {
              Alert.alert('Approuvé', `${username} a été ajouté au club`)
            } else {
              Alert.alert('Erreur', result.error)
            }
          }
        }
      ]
    )
  }

  const handleReject = async (requestId, username) => {
    Alert.alert(
      'Refuser la demande',
      `Êtes-vous sûr de vouloir refuser la demande de ${username} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Refuser',
          style: 'destructive',
          onPress: async () => {
            const result = await handleJoinRequest(requestId, 'reject')
            if (result.success) {
              Alert.alert('Refusé', `La demande de ${username} a été refusée`)
            } else {
              Alert.alert('Erreur', result.error)
            }
          }
        }
      ]
    )
  }

  const renderRequestItem = ({ item }) => (
    <View style={styles.requestItem}>
      <View style={styles.userInfo}>
        <Avatar
          source={{ uri: item.user.avatar_url }}
          size="medium"
          name={item.user.username}
          xp={item.user.xp}
          showBadge={true}
        />
        <View style={styles.userDetails}>
          <Text style={styles.username}>{item.user.username}</Text>
          <Text style={styles.requestDate}>
            Demande envoyée le {new Date(item.requested_at).toLocaleDateString('fr-FR')}
          </Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <Button
          title="Refuser"
          onPress={() => handleReject(item.id, item.user.username)}
          variant="outline"
          size="small"
          style={styles.rejectButton}
        />
        <Button
          title="Accepter"
          onPress={() => handleApprove(item.id, item.user.username)}
          size="small"
          style={styles.approveButton}
        />
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Demandes d'adhésion</Text>
          <Text style={styles.subtitle}>{clubName}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {joinRequests.length === 0 && !requestsLoading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyTitle}>Aucune demande en attente</Text>
          <Text style={styles.emptyMessage}>
            Les demandes d'adhésion apparaîtront ici
          </Text>
        </View>
      ) : (
        <FlatList
          data={joinRequests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
  },
  backButton: {
    padding: SPACING.sm,
    borderRadius: RADIUS.base,
    backgroundColor: COLORS.backgroundSecondary,
  },
  backIcon: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  list: {
    padding: SPACING.md,
  },
  requestItem: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.base,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  userDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  username: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
  },
  requestDate: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  rejectButton: {
    flex: 1,
    borderColor: COLORS.error,
  },
  approveButton: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeights.relaxed,
  },
})

export default JoinRequestsScreen