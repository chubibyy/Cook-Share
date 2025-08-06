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
  Platform
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
    cuisine_type: '',
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
    if (currentIngredient.trim() && formData.ingredients.length < 20) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, currentIngredient.trim()]
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
    if (currentTag.trim() && formData.tags.length < 10) {
      const tag = currentTag.trim().toLowerCase()
      if (!formData.tags.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }))
      }
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
      // Upload de l'image
      let photoUrl = null
      if (formData.photo) {
        const { url } = await supabaseHelpers.uploadImage(
          formData.photo,
          'cooking-sessions',
          `${user.id}/sessions`
        )
        photoUrl = url
      }

      // Création de la session
      const sessionData = {
        title: formData.title.trim(),
        photo_url: photoUrl,
        duration: Number(formData.duration),
        ingredients: formData.ingredients,
        cuisine_type: formData.cuisine_type || null,
        difficulty: formData.difficulty,
        tags: formData.tags,
        club_id: formData.club_id
      }

      const result = await createSession(sessionData)

      if (result.success) {
        Alert.alert(
          'Succès !',
          'Votre création a été partagée avec succès !',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('Home')
                // Reset du formulaire
                setFormData({
                  title: '',
                  photo: null,
                  duration: '',
                  ingredients: [],
                  cuisine_type: '',
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
                  key={index}
                  style={[
                    styles.cuisineChip,
                    formData.cuisine_type === cuisine.name && styles.cuisineChipActive
                  ]}
                  onPress={() => setFormData(prev => ({
                    ...prev,
                    cuisine_type: prev.cuisine_type === cuisine.name ? '' : cuisine.name
                  }))}
                >
                  <Text style={styles.cuisineEmoji}>{cuisine.emoji}</Text>
                  <Text style={[
                    styles.cuisineText,
                    formData.cuisine_type === cuisine.name && styles.cuisineTextActive
                  ]}>
                    {cuisine.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Ingrédients */}
          <View style={styles.section}>
            <Text style={styles.inputLabel}>🥘 Ingrédients principaux</Text>
            <View style={styles.addInputContainer}>
              <Input
                placeholder="Ajouter un ingrédient..."
                value={currentIngredient}
                onChangeText={setCurrentIngredient}
                onSubmitEditing={addIngredient}
                style={styles.addInput}
              />
              <Button
                title="+"
                onPress={addIngredient}
                size="small"
                style={styles.addButton}
              />
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
              <Input
                placeholder="Ajouter un tag..."
                value={currentTag}
                onChangeText={setCurrentTag}
                onSubmitEditing={addTag}
                style={styles.addInput}
              />
              <Button
                title="+"
                onPress={addTag}
                size="small"
                style={styles.addButton}
              />
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