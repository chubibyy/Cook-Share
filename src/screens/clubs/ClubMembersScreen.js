import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRoute } from '@react-navigation/native'
import { useClubStore } from '../../stores/clubStore'
import { Avatar, Button } from '../../components/common'
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../utils/constants'

export const ClubMembersScreen = ({ navigation }) => {
  const route = useRoute()
  const { clubId, clubName } = route.params
  const { 
    clubMembers, 
    loading, 
    loadClubMembers, 
    revokeMember 
  } = useClubStore()
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadClubMembers(clubId)
  }, [clubId, loadClubMembers])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await loadClubMembers(clubId)
    } catch (error) {
      console.error('Error refreshing members:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleRevokeMember = (member) => {
    Alert.alert(
      'Révoquer le membre',
      `Êtes-vous sûr de vouloir exclure "${member.user.username}" du club ?\n\nCette action est irréversible et le membre devra faire une nouvelle demande pour rejoindre le club.`,
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Exclure',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await revokeMember(clubId, member.user_id)
              if (result.success) {
                Alert.alert('Membre exclu', `${member.user.username} a été exclu du club.`)
              } else {
                Alert.alert('Erreur', result.error || 'Impossible d\'exclure le membre.')
              }
            } catch (error) {
              Alert.alert('Erreur', 'Une erreur est survenue lors de l\'exclusion.')
            }
          }
        }
      ]
    )
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'owner':
        return { text: '👑 Propriétaire', color: COLORS.warning }
      case 'admin':
        return { text: '⚡ Admin', color: COLORS.primary }
      default:
        return { text: '✅ Membre', color: COLORS.success }
    }
  }

  const getCookingLevel = (xp) => {
    if (xp >= 1000) return '👨‍🍳 Master Chef'
    if (xp >= 750) return '🧑‍🍳 Chef Expérimenté'
    if (xp >= 500) return '👩‍🍳 Chef Confirmé'
    if (xp >= 250) return '🍳 Cuisinier'
    return '🥄 Débutant'
  }

  const renderMemberItem = ({ item: member }) => {
    const roleBadge = getRoleBadge(member.role)
    const isOwner = member.role === 'owner'
    
    return (
      <View style={styles.memberCard}>
        <View style={styles.memberInfo}>
          <Avatar
            source={{ uri: member.user.avatar_url }}
            name={member.user.username}
            size="medium"
            style={styles.memberAvatar}
          />
          <View style={styles.memberDetails}>
            <View style={styles.memberHeader}>
              <Text style={styles.memberName}>{member.user.username}</Text>
              <View style={[styles.roleBadge, { backgroundColor: roleBadge.color + '20' }]}>
                <Text style={[styles.roleText, { color: roleBadge.color }]}>
                  {roleBadge.text}
                </Text>
              </View>
            </View>
            
            <Text style={styles.memberLevel}>
              {getCookingLevel(member.user.xp)}
            </Text>
            <Text style={styles.memberXP}>
              {member.user.xp} XP
            </Text>
            <Text style={styles.memberJoinDate}>
              Membre depuis {new Date(member.joined_at).toLocaleDateString('fr-FR')}
            </Text>
          </View>
        </View>

        {!isOwner && (
          <TouchableOpacity
            style={styles.revokeButton}
            onPress={() => handleRevokeMember(member)}
          >
            <Text style={styles.revokeButtonText}>Exclure</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>👥</Text>
      <Text style={styles.emptyTitle}>Aucun membre</Text>
      <Text style={styles.emptyText}>
        Ce club n'a pas encore de membres.
      </Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Membres du club</Text>
          <Text style={styles.subtitle}>{clubName}</Text>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.memberCount}>{clubMembers.length}</Text>
        </View>
      </View>

      <FlatList
        data={clubMembers}
        renderItem={renderMemberItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={!loading ? renderEmptyState : null}
        showsVerticalScrollIndicator={false}
      />
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
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  headerRight: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
  },
  memberCount: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  list: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  memberCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    ...SHADOWS.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    marginRight: SPACING.md,
  },
  memberDetails: {
    flex: 1,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  memberName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  roleBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  roleText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  memberLevel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  memberXP: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs,
  },
  memberJoinDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textMuted,
  },
  revokeButton: {
    backgroundColor: COLORS.error + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.base,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  revokeButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeights.relaxed,
  },
})

export default ClubMembersScreen