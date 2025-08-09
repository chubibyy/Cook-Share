import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';
import { sessionsService } from '../../services/session';
import { Button } from '../common';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../utils/constants';
import { formatTimeAgo } from '../../utils/helpers';

export const SessionSelectionModal = ({ visible, onClose, onSelectSession }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    const fetchSessions = async () => {
      if (user?.id) {
        setLoading(true);
        try {
          const userSessions = await sessionsService.getUserSessions(user.id);
          setSessions(userSessions);
        } catch (error) {
          console.error("Failed to fetch user sessions:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (visible) {
      fetchSessions();
    }
  }, [visible, user?.id]);

  const handleSelect = () => {
    if (selectedSession) {
      onSelectSession(selectedSession.id);
      onClose();
    }
  };

  const renderSessionItem = ({ item }) => {
    const isSelected = selectedSession?.id === item.id;
    return (
      <TouchableOpacity 
        style={[styles.sessionItem, isSelected && styles.sessionItemSelected]}
        onPress={() => setSelectedSession(item)}
      >
        <Image source={{ uri: item.photo_url }} style={styles.sessionImage} />
        <View style={styles.sessionDetails}>
          <Text style={styles.sessionTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.sessionDate}>{formatTimeAgo(item.created_at)}</Text>
        </View>
        {isSelected && <Text style={styles.checkIcon}>✅</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Sélectionner une création</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator style={{ flex: 1 }} color={COLORS.primary} size="large" />
        ) : sessions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Vous n'avez aucune création à soumettre.</Text>
          </View>
        ) : (
          <FlatList
            data={sessions}
            renderItem={renderSessionItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />
        )}

        <View style={styles.footer}>
          <Button 
            title="Soumettre ma sélection"
            onPress={handleSelect}
            disabled={!selectedSession}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  title: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold },
  closeButton: { fontSize: 24, color: COLORS.textSecondary },
  list: { padding: SPACING.md },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sessionItemSelected: {
    borderColor: COLORS.primary,
  },
  sessionImage: { width: 50, height: 50, borderRadius: RADIUS.sm, marginRight: SPACING.md },
  sessionDetails: { flex: 1 },
  sessionTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold },
  sessionDate: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.textMuted, marginTop: 4 },
  checkIcon: { fontSize: 20 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.textSecondary },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
  },
});
