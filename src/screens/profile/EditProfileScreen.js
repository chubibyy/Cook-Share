// src/screens/profile/EditProfileScreen.js
import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Avatar, Input, Button } from '../../components/common'
import { useAuthStore } from '../../stores/authStore'
import { useCamera } from '../../hooks/useCamera'
import { COLORS, SPACING } from '../../utils/constants'

// Screen allowing the user to update basic profile information.
// Changes are persisted via the auth store so that updates propagate
// throughout the app and database.
export const EditProfileScreen = ({ navigation }) => {
  const { user, updateProfile, loading } = useAuthStore()
  const [username, setUsername] = useState(user?.username || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [avatar, setAvatar] = useState(null)

  const { takePhoto, pickImage } = useCamera()

  const handleAvatarPress = () => {
    Alert.alert('Photo de profil', 'Comment souhaitez-vous ajouter votre photo ?', [
      { text: 'Caméra', onPress: () => handleTakePhoto() },
      { text: 'Galerie', onPress: () => handlePickImage() },
      { text: 'Annuler', style: 'cancel' }
    ])
  }

  const handleTakePhoto = async () => {
    const photo = await takePhoto({ aspect: [1, 1] })
    if (photo) setAvatar(photo)
  }

  const handlePickImage = async () => {
    const image = await pickImage({ aspect: [1, 1] })
    if (image) setAvatar(image)
  }

  const handleSave = async () => {
    try {
      const updates = { username, bio }
      if (avatar) updates.avatar = avatar

      const { success, error } = await updateProfile(updates)
      if (!success) throw new Error(error)

      Alert.alert('Succès', 'Profil mis à jour avec succès')
      navigation.goBack()
    } catch (err) {
      Alert.alert('Erreur', err.message || "Impossible de mettre à jour le profil")
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Avatar
              size="xl"
              source={avatar ? { uri: avatar.uri } : user?.avatar_url ? { uri: user.avatar_url } : null}
              name={username}
              onPress={handleAvatarPress}
            />
            <TouchableOpacity style={styles.avatarOverlay} onPress={handleAvatarPress}>
              <Text style={styles.avatarOverlayText}>📷</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Input
          label="Nom d'utilisateur"
          placeholder="Votre nom"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Input
          label="Bio"
          placeholder="Parlez de vous..."
          value={bio}
          onChangeText={setBio}
          multiline
        />

        <Button
          title="Enregistrer"
          onPress={handleSave}
          loading={loading}
          style={styles.saveButton}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg },
  avatarSection: { alignItems: 'center', marginBottom: SPACING.xl },
  avatarWrapper: { position: 'relative' },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatarOverlayText: { fontSize: 16 },
  saveButton: { marginTop: SPACING.lg },
})

