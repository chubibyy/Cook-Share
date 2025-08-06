// src/hooks/useCamera.js
import { useState, useRef } from 'react'
import { Alert, Platform } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as MediaLibrary from 'expo-media-library'

export const useCamera = () => {
  const [loading, setLoading] = useState(false)
  const [image, setImage] = useState(null)

  // Demander les permissions
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync()
      const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync()
      
      if (cameraPermission.status !== 'granted' || mediaPermission.status !== 'granted') {
        Alert.alert(
          'Permissions requises',
          'Nous avons besoin des permissions caméra et galerie pour fonctionner correctement.'
        )
        return false
      }
    }
    return true
  }

  // Prendre une photo
  const takePhoto = async (options = {}) => {
    try {
      const hasPermission = await requestPermissions()
      if (!hasPermission) return null

      setLoading(true)

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: options.aspect || [4, 3],
        quality: options.quality || 0.8,
        exif: false,
        ...options
      })

      if (!result.canceled && result.assets[0]) {
        const selectedImage = result.assets[0]
        setImage(selectedImage)
        
        // Sauvegarder dans la galerie si demandé
        if (options.saveToGallery) {
          await MediaLibrary.saveToLibraryAsync(selectedImage.uri)
        }
        
        return selectedImage
      }
      
      return null
    } catch (error) {
      console.error('Erreur prise photo:', error)
      Alert.alert('Erreur', 'Impossible de prendre la photo')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Sélectionner depuis la galerie
  const pickImage = async (options = {}) => {
    try {
      const hasPermission = await requestPermissions()
      if (!hasPermission) return null

      setLoading(true)

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: options.aspect || [4, 3],
        quality: options.quality || 0.8,
        allowsMultipleSelection: options.multiple || false,
        exif: false,
        ...options
      })

      if (!result.canceled && result.assets[0]) {
        const selectedImage = result.assets[0]
        setImage(selectedImage)
        return selectedImage
      }
      
      return null
    } catch (error) {
      console.error('Erreur sélection image:', error)
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Afficher le sélecteur d'action
  const showImagePicker = (options = {}) => {
    Alert.alert(
      'Sélectionner une image',
      'Comment souhaitez-vous ajouter votre image ?',
      [
        {
          text: 'Galerie',
          onPress: () => pickImage(options)
        },
        {
          text: 'Caméra',
          onPress: () => takePhoto(options)
        },
        {
          text: 'Annuler',
          style: 'cancel'
        }
      ]
    )
  }

  // Reset de l'image
  const resetImage = () => {
    setImage(null)
  }

  return {
    loading,
    image,
    takePhoto,
    pickImage,
    showImagePicker,
    resetImage
  }
}

