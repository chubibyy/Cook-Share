import React, { useState, useEffect } from 'react'
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Avatar, Badge } from '../common'
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../utils/constants'

export const ClubSelectionModal = ({
  visible,
  onClose,
  clubs = [],
  challenge,
  onSelectClubs,
  participatingClubIds = [],
  loading = false
}) => {
  const [selectedClubs, setSelectedClubs] = useState(new Set())

  useEffect(() => {
    if (visible) {
      setSelectedClubs(new Set(participatingClubIds))
    }
  }, [visible, participatingClubIds])

  const toggleClub = (clubId) => {
    const newSelection = new Set(selectedClubs)
    if (newSelection.has(clubId)) {
      newSelection.delete(clubId)
    } else {
      newSelection.add(clubId)
    }
    setSelectedClubs(newSelection)
  }

  const handleConfirm = () => {
    onSelectClubs(Array.from(selectedClubs))
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  const renderClubItem = ({ item: club }) => {
    const isSelected = selectedClubs.has(club.id)

    return (
      <TouchableOpacity
        style={[
          styles.clubItem,
          isSelected && styles.clubItemSelected,
        ]}
        onPress={() => toggleClub(club.id)}
      >
        <View style={styles.clubInfo}>
          <Avatar
            source={{ uri: club.avatar_url }}
            name={club.name}
            size="medium"
          />
          <View style={styles.clubDetails}>
            <Text style={styles.clubName}>{club.name}</Text>
            {club.description && (
              <Text style={styles.clubDescription} numberOfLines={2}>
                {club.description}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.clubStatus}>
          {isSelected ? (
            <Badge text="✅ Sélectionné" variant="success" size="small" />
          ) : (
            <View style={styles.checkbox} />
          )}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Gérer les clubs</Text>
            <Text style={styles.subtitle}>{challenge?.title}</Text>
          </View>

          <TouchableOpacity
            onPress={handleConfirm}
            style={styles.confirmButton}
            disabled={loading}
          >
            <Text style={[
              styles.confirmText,
              loading && styles.confirmTextDisabled
            ]}>
              {loading ? 'En cours...' : 'Confirmer'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {clubs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🏆</Text>
              <Text style={styles.emptyTitle}>Aucun club</Text>
              <Text style={styles.emptyText}>
                Vous n'êtes propriétaire d'aucun club. Créez-en un pour l'inscrire !
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  Cochez les clubs que vous souhaitez faire participer à ce challenge.
                </Text>
              </View>

              <FlatList
                data={clubs}
                renderItem={renderClubItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.clubsList}
                showsVerticalScrollIndicator={false}
              />
            </>
          )}
        </View>
      </SafeAreaView>
    </Modal>
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
  cancelButton: {
    padding: SPACING.sm,
  },
  cancelText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  confirmButton: {
    padding: SPACING.sm,
  },
  confirmText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
  },
  confirmTextDisabled: {
    color: COLORS.textMuted,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  infoContainer: {
    backgroundColor: COLORS.primaryAlpha,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
  },
  infoText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text,
    lineHeight: TYPOGRAPHY.lineHeights.relaxed,
  },
  clubsList: {
    paddingBottom: SPACING.xl,
  },
  clubItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  clubItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryAlpha,
  },
  clubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clubDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  clubName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  clubDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.lineHeights.comfortable,
  },
  clubStatus: {
    marginLeft: SPACING.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
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
