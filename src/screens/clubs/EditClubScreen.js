import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, TextInput, KeyboardAvoidingView, Platform, ScrollView, Switch } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { useRoute } from '@react-navigation/native'
import Button from '../../components/common/Button'
import { useClubStore } from '../../stores/clubStore'
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../utils/constants'

export const EditClubScreen = ({ navigation }) => {
  const route = useRoute()
  const { clubId } = route.params
  const { currentClub, loadClubById, updateClub, loading } = useClubStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [avatar, setAvatar] = useState(null)

  useEffect(() => {
    ;(async () => {
      const c = await loadClubById(clubId)
      if (c) {
        setName(c.name || '')
        setDescription(c.description || '')
        setIsPrivate(!!c.is_private)
      }
    })()
  }, [clubId, loadClubById])

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
    const result = await updateClub(clubId, { name: name.trim(), description: description.trim(), is_private: isPrivate, avatar })
    if (result.success) {
      Alert.alert('Succès', 'Le club a été mis à jour', [{ text: 'OK', onPress: () => navigation.goBack() }])
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
            <Text style={styles.title}>Modifier le club</Text>
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
            <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Nom du club" />
          </View>

          <View style={styles.field}>            
            <Text style={styles.label}>Description</Text>
            <TextInput value={description} onChangeText={setDescription} style={[styles.input, styles.textarea]} placeholder="Description" multiline />
          </View>

          <View style={[styles.field, styles.row]}>            
            <Text style={styles.label}>Privé</Text>
            <Switch value={isPrivate} onValueChange={setIsPrivate} />
          </View>

          <View style={styles.actions}>
            <Button title="Enregistrer" onPress={onSubmit} loading={loading} fullWidth size="large" />
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
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  input: { backgroundColor: COLORS.surface, borderRadius: RADIUS.base, borderWidth: 1, borderColor: COLORS.borderLight, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, color: COLORS.text },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  actions: { marginTop: SPACING.lg },
})

export default EditClubScreen

