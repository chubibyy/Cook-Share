// src/screens/create/CreateSessionScreen.js
import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { Button, Input, Badge } from '../../components/common'
import { useSessionStore } from '../../stores/sessionStore'
import { useAuthStore } from '../../stores/authStore'
import { supabaseHelpers } from '../../services/supabase'
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, CUISINE_TYPES, DIFFICULTY_LEVELS } from '../../utils/constants'

const CreateSessionScreen = ({ navigation }) => {
  const { createSession, loading } = useSessionStore()
  const { user } = useAuthStore()

  // État du formulaire
  const [formData, setFormData] = useState({
    title: '',
    photo: null,
    duration: '',
    ingredients: [],
    cuisine_types: [], // Changed to array for multi-select
    difficulty: 1,
    tags: [],
    club_id: null
  })
  
  const [currentIngredient, setCurrentIngredient] = useState('')
  const [currentTag, setCurrentTag] = useState('')
  const [errors, setErrors] = useState({})

  // Sélection d'image
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Nous avons besoin d\'accéder à vos photos pour partager vos créations.'
        )
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        exif: false,
      })

      if (!result.canceled) {
        setFormData(prev => ({
          ...prev,
          photo: result.assets[0]
        }))
        setErrors(prev => ({ ...prev, photo: null }))
      }
    } catch (error) {
      console.error('Erreur sélection image:', error)
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image')
    }
  }

  // Prendre une photo
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Nous avons besoin d\'accéder à votre caméra pour prendre des photos.'
        )
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        exif: false,
      })

      if (!result.canceled) {
        setFormData(prev => ({
          ...prev,
          photo: result.assets[0]
        }))
        setErrors(prev => ({ ...prev, photo: null }))
      }
    } catch (error) {
      console.error('Erreur prise photo:', error)
      Alert.alert('Erreur', 'Impossible de prendre la photo')
    }
  }

  // Actions photo
  const showImagePicker = () => {
    Alert.alert(
      'Ajouter une photo',
      'Comment souhaitez-vous ajouter votre photo ?',
      [
        { text: 'Galerie', onPress: pickImage },
        { text: 'Caméra', onPress: takePhoto },
        { text: 'Annuler', style: 'cancel' }
      ]
    )
  }

  // Ajout d'ingrédient
  const addIngredient = () => {
    const ingredient = currentIngredient.trim()
    if (ingredient && !formData.ingredients.includes(ingredient) && formData.ingredients.length < 20) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, ingredient]
      }))
      setCurrentIngredient('')
    }
  }

  // Suppression d'ingrédient
  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }))
  }

  // Ajout de tag
  const addTag = () => {
    const tag = currentTag.trim().toLowerCase()
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
      setCurrentTag('')
    }
  }

  // Suppression de tag
  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  // Validation
  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis'
    }

    if (!formData.photo) {
      newErrors.photo = 'Une photo est requise'
    }

    if (!formData.duration || isNaN(Number(formData.duration))) {
      newErrors.duration = 'Durée invalide'
    }

    if (formData.ingredients.length === 0) {
      newErrors.ingredients = 'Au moins un ingrédient est requis'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Soumission
  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      console.log('=== STARTING SESSION CREATION ===')
      console.log('User:', user)
      console.log('Form data:', formData)

      // Upload image if present
      let photoUrl = null
      if (formData.photo) {
        console.log('Uploading image...')
        try {
          const { url } = await supabaseHelpers.uploadSessionImage(
            formData.photo,
            user.id
          )
          photoUrl = url
          console.log('Image uploaded successfully:', photoUrl)
        } catch (imageError) {
          console.error('Image upload failed:', imageError)
          Alert.alert(
            'Image Upload Failed', 
            'Your session will be created without the photo. You can add it later.'
          )
        }
      }

      // Création de la session with minimal data
      const sessionData = {
        title: formData.title.trim(),
        photo_url: photoUrl, // This will be null for now
        duration: Number(formData.duration),
        ingredients: formData.ingredients,
        cuisine_type: formData.cuisine_types.length > 0 ? formData.cuisine_types[0] : null,
        difficulty: formData.difficulty,
        tags: formData.tags,
        club_id: null
      }

      console.log('Session data being sent:', sessionData)

      const result = await createSession(sessionData)

      if (result.success) {
        Alert.alert(
          'Succès !',
          'Votre création a été partagée avec succès !',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back to the tabs (which will show the Home screen)
                navigation.goBack()
                // Reset du formulaire
                setFormData({
                  title: '',
                  photo: null,
                  duration: '',
                  ingredients: [],
                  cuisine_types: [],
                  difficulty: 1,
                  tags: [],
                  club_id: null
                })
              }
            }
          ]
        )
      }
    } catch (error) {
      console.error('Erreur création session:', error)
      Alert.alert('Erreur', 'Impossible de créer la session')
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Nouvelle création</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Photo */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📸 Photo de votre plat</Text>
            <TouchableOpacity 
              style={[styles.photoContainer, errors.photo && styles.photoError]}
              onPress={showImagePicker}
            >
              {formData.photo ? (
                <Image source={{ uri: formData.photo.uri }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoPlaceholderEmoji}>📷</Text>
                  <Text style={styles.photoPlaceholderText}>
                    Appuyez pour ajouter une photo
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            {errors.photo && <Text style={styles.errorText}>{errors.photo}</Text>}
          </View>

          {/* Titre */}
          <View style={styles.section}>
            <Input
              label="🍽️ Titre de votre création"
              placeholder="Ex: Risotto aux champignons maison"
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              error={errors.title}
              maxLength={100}
            />
          </View>

          {/* Durée et difficulté */}
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Input
                label="⏱️ Durée (minutes)"
                placeholder="45"
                value={formData.duration}
                onChangeText={(text) => setFormData(prev => ({ ...prev, duration: text }))}
                keyboardType="numeric"
                error={errors.duration}
              />
            </View>
            
            <View style={styles.halfWidth}>
              <Text style={styles.inputLabel}>🔥 Difficulté</Text>
              <View style={styles.difficultyContainer}>
                {[1, 2, 3, 4, 5].map(level => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.difficultyButton,
                      formData.difficulty === level && styles.difficultyButtonActive
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, difficulty: level }))}
                  >
                    <Text style={[
                      styles.difficultyText,
                      formData.difficulty === level && styles.difficultyTextActive
                    ]}>
                      {DIFFICULTY_LEVELS[level].icon}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Type de cuisine */}
          <View style={styles.section}>
            <Text style={styles.inputLabel}>🌍 Type de cuisine</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.cuisineScroll}
            >
              {CUISINE_TYPES.map((cuisine, index) => (
                <TouchableOpacity
                  key={cuisine.id}
                  style={[
                    styles.cuisineChip,
                    formData.cuisine_types.includes(cuisine.id) && styles.cuisineChipActive
                  ]}
                  onPress={() => setFormData(prev => ({
                    ...prev,
                    cuisine_types: prev.cuisine_types.includes(cuisine.id)
                      ? prev.cuisine_types.filter(id => id !== cuisine.id)
                      : [...prev.cuisine_types, cuisine.id]
                  }))}
                >
                  <Text style={styles.cuisineEmoji}>{cuisine.emoji}</Text>
                  <Text style={[
                    styles.cuisineText,
                    formData.cuisine_types.includes(cuisine.id) && styles.cuisineTextActive
                  ]}>
                    {cuisine.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Ingrédients */}
          <View style={styles.section}>
            <Text style={styles.inputLabel}>🥘 Ingrédients principaux</Text>
            <View style={styles.addInputContainer}>
              <View style={styles.textInputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ajouter un ingrédient..."
                  placeholderTextColor={COLORS.textSecondary}
                  value={currentIngredient}
                  onChangeText={setCurrentIngredient}
                  onSubmitEditing={addIngredient}
                  returnKeyType="done"
                  blurOnSubmit={false}
                />
              </View>
              <TouchableOpacity 
                style={styles.addButton} 
                onPress={addIngredient}
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            
            {formData.ingredients.length > 0 && (
              <View style={styles.chipContainer}>
                {formData.ingredients.map((ingredient, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.ingredientChip}
                    onPress={() => removeIngredient(index)}
                  >
                    <Text style={styles.ingredientText}>{ingredient}</Text>
                    <Text style={styles.removeText}> ×</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {errors.ingredients && <Text style={styles.errorText}>{errors.ingredients}</Text>}
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.inputLabel}>#️⃣ Tags</Text>
            <View style={styles.addInputContainer}>
              <View style={styles.textInputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ajouter un tag..."
                  placeholderTextColor={COLORS.textSecondary}
                  value={currentTag}
                  onChangeText={setCurrentTag}
                  onSubmitEditing={addTag}
                  returnKeyType="done"
                  blurOnSubmit={false}
                />
              </View>
              <TouchableOpacity 
                style={styles.addButton} 
                onPress={addTag}
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            
            {formData.tags.length > 0 && (
              <View style={styles.chipContainer}>
                {formData.tags.map((tag, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.tagChip}
                    onPress={() => removeTag(index)}
                  >
                    <Text style={styles.tagText}>#{tag}</Text>
                    <Text style={styles.removeText}> ×</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer avec bouton */}
        <View style={styles.footer}>
          <Button
            title="Partager ma création"
            onPress={handleSubmit}
            loading={loading}
            fullWidth
            size="large"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.primary,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  photoContainer: {
    height: 200,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  photoError: {
    borderColor: COLORS.error,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundSecondary,
  },
  photoPlaceholderEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  photoPlaceholderText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  halfWidth: {
    flex: 1,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.xs,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
  },
  difficultyButtonActive: {
    backgroundColor: COLORS.primary,
  },
  difficultyText: {
    fontSize: 16,
  },
  difficultyTextActive: {
    transform: [{ scale: 1.2 }],
  },
  cuisineScroll: {
    marginVertical: SPACING.sm,
  },
  cuisineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cuisineChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  cuisineEmoji: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  cuisineText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  cuisineTextActive: {
    color: COLORS.white,
  },
  addInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  textInputWrapper: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.base,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: SPACING.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text,
    paddingVertical: SPACING.sm,
  },
  addInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 48,
    height: 48,
    borderRadius: RADIUS.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  ingredientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.success + '20',
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.success + '40',
  },
  ingredientText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.info + '20',
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.info + '40',
  },
  tagText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.info,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  removeText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginLeft: SPACING.xs,
  },
  footer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.error,
    marginTop: SPACING.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
})

export {CreateSessionScreen}