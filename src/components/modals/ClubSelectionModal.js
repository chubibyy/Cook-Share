import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Avatar, Button, Badge } from '../common'
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../utils/constants'

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
    if (selectedClubs.size === 0) {
      return Alert.alert('Sélection requise', 'Veuillez sélectionner au moins un club')
    }

    onSelectClubs(Array.from(selectedClubs))
    setSelectedClubs(new Set())
    onClose()
  }

  const handleCancel = () => {
    setSelectedClubs(new Set())
    onClose()
  }

  const renderClubItem = ({ item: club }) => {
    const isSelected = selectedClubs.has(club.id)
    const isParticipating = participatingClubIds.includes(club.id)

    return (
      <TouchableOpacity
        style={[
          styles.clubItem,
          isSelected && styles.clubItemSelected,
          isParticipating && styles.clubItemParticipating
        ]}
        onPress={() => !isParticipating && toggleClub(club.id)}
        disabled={isParticipating}
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
          {isParticipating ? (
            <Badge text="✅ Participe" variant="success" size="small" />
          ) : isSelected ? (
            <Badge text="🎯 Sélectionné" variant="primary" size="small" />
          ) : (
            <View style={styles.checkbox}>
              <Text style={styles.checkboxText}>○</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  const availableClubs = clubs.filter(club => !participatingClubIds.includes(club.id))

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
            <Text style={styles.title}>Inscrire mes clubs</Text>
            <Text style={styles.subtitle}>{challenge?.title}</Text>
          </View>

          <TouchableOpacity 
            onPress={handleConfirm} 
            style={styles.confirmButton}
            disabled={selectedClubs.size === 0 || loading}
          >
            <Text style={[
              styles.confirmText,
              (selectedClubs.size === 0 || loading) && styles.confirmTextDisabled
            ]}>
              {loading ? 'En cours...' : 'Confirmer'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {availableClubs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🏆</Text>
              <Text style={styles.emptyTitle}>Aucun club disponible</Text>
              <Text style={styles.emptyText}>
                {clubs.length === 0 
                  ? "Vous n'êtes propriétaire d'aucun club. Créez un club pour pouvoir l'inscrire aux challenges !"
                  : "Tous vos clubs participent déjà à ce challenge."
                }
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  Sélectionnez les clubs que vous souhaitez inscrire au challenge.
                  Seuls les propriétaires peuvent inscrire leurs clubs.
                </Text>
                {participatingClubIds.length > 0 && (
                  <Text style={styles.participatingText}>
                    {participatingClubIds.length} de vos clubs participent déjà.
                  </Text>
                )}
              </View>

              <FlatList
                data={clubs}
                renderItem={renderClubItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.clubsList}
                showsVerticalScrollIndicator={false}
              />

              {selectedClubs.size > 0 && (
                <View style={styles.selectionSummary}>
                  <Text style={styles.selectionText}>
                    {selectedClubs.size} club{selectedClubs.size > 1 ? 's' : ''} sélectionné{selectedClubs.size > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
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
  participatingText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginTop: SPACING.sm,
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
    ...SHADOWS.sm,
  },
  clubItemSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryAlpha,
  },
  clubItemParticipating: {
    opacity: 0.7,
    backgroundColor: COLORS.successAlpha,
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
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxText: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  selectionSummary: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
    ...SHADOWS.sm,
  },
  selectionText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
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