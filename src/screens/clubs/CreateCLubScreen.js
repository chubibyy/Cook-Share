import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, TextInput, KeyboardAvoidingView, Platform, ScrollView, Switch } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import Button from '../../components/common/Button'
import { useClubStore } from '../../stores/clubStore'
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../utils/constants'

export const CreateCLubScreen = ({ navigation }) => {
  const { createClub, loading } = useClubStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [avatar, setAvatar] = useState(null)

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Autorisez l’accès à votre galerie pour choisir une image.')
      return
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1,1], quality: 0.8 })
    if (!res.canceled) setAvatar(res.assets[0])
  }

  const onSubmit = async () => {
    if (!name.trim()) return Alert.alert('Nom requis', 'Veuillez saisir un nom de club')
    const result = await createClub({ name: name.trim(), description: description.trim(), is_private: isPrivate, avatar })
    if (result.success) {
      Alert.alert('Succès', 'Le club a été créé', [{ text: 'OK', onPress: () => navigation.goBack() }])
    } else {
      Alert.alert('Erreur', result.error)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
            <Text style={styles.title}>Créer un club</Text>
            <View style={{ width: 24 }} />
          </View>

          <TouchableOpacity style={styles.avatar} onPress={pickImage}>
            {avatar ? (
              <Image source={{ uri: avatar.uri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarPlaceholder}>📷</Text>
            )}
          </TouchableOpacity>

          <View style={styles.field}>            
            <Text style={styles.label}>Nom</Text>
            <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Ex: Les amoureux du risotto" />
          </View>

          <View style={styles.field}>            
            <Text style={styles.label}>Description</Text>
            <TextInput value={description} onChangeText={setDescription} style={[styles.input, styles.textarea]} placeholder="Parlez de votre club" multiline />
          </View>

          <View style={styles.visibilityField}>
            <View style={styles.visibilityInfo}>
              <Text style={styles.label}>Visibilité du club</Text>
              <Text style={styles.visibilityDescription}>
                {isPrivate 
                  ? "Club privé - Les utilisateurs doivent demander à rejoindre" 
                  : "Club public - Tout le monde peut rejoindre librement"
                }
              </Text>
            </View>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>{isPrivate ? "Privé" : "Public"}</Text>
              <Switch
                value={isPrivate}
                onValueChange={setIsPrivate}
                thumbColor={isPrivate ? COLORS.primary : COLORS.white}
                trackColor={{ false: COLORS.backgroundSecondary, true: COLORS.primaryAlpha }}
              />
            </View>
          </View>

          <View style={styles.actions}>
            <Button title="Créer" onPress={onSubmit} loading={loading} fullWidth size="large" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
  back: { fontSize: 22, color: COLORS.primary },
  title: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text },
  avatar: { width: 120, height: 120, borderRadius: 60, alignSelf: 'center', backgroundColor: COLORS.backgroundSecondary, alignItems: 'center', justifyContent: 'center', marginVertical: SPACING.md },
  avatarImage: { width: 120, height: 120, borderRadius: 60 },
  avatarPlaceholder: { fontSize: 28, color: COLORS.textSecondary },
  field: { marginVertical: SPACING.sm },
  label: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  input: { backgroundColor: COLORS.surface, borderRadius: RADIUS.base, borderWidth: 1, borderColor: COLORS.borderLight, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, color: COLORS.text },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  visibilityField: {
    marginVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.base,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  visibilityInfo: {
    flex: 1,
    marginBottom: SPACING.sm,
  },
  visibilityDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  actions: { marginTop: SPACING.lg },
})

export default CreateCLubScreen