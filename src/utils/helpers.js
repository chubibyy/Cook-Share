// src/utils/helpers.js
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/fr'

dayjs.extend(relativeTime)
dayjs.locale('fr')

export const formatDate = (date) => {
  return dayjs(date).fromNow()
}

export const formatCookingTime = (minutes) => {
  if (minutes < 60) {
    return `${minutes}min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h${remainingMinutes}min` : `${hours}h`
}

export const calculateLevel = (xp) => {
  if (xp >= 5000) return 5
  if (xp >= 1500) return 4
  if (xp >= 500) return 3
  if (xp >= 100) return 2
  return 1
}

import { LEVELS } from './constants'

export const getXpForNextLevel = (currentXp) => {
  const level = calculateLevel(currentXp)
  if (level === 5) return 0 // Max level
  
  const nextLevelXp = Object.values(LEVELS).find(l => l.xp > currentXp)?.xp || 5000
  return nextLevelXp - currentXp
}

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePassword = (password) => {
  return password.length >= 6
}

// Helper functions
export const getColorOpacity = (color, opacity) => {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export const getLevelFromXP = (xp) => {
  const levels = Object.keys(LEVELS).reverse()
  for (let level of levels) {
    if (xp >= LEVELS[level].xp) {
      return LEVELS[level]
    }
  }
  return LEVELS[1]
}

export const getProgressToNextLevel = (xp) => {
  const currentLevel = getLevelFromXP(xp)
  const currentLevelNumber = Object.keys(LEVELS).find(
    key => LEVELS[key] === currentLevel
  )
  const nextLevel = LEVELS[parseInt(currentLevelNumber) + 1]
  
  if (!nextLevel) return { progress: 1, xpToNext: 0 }
  
  const xpInCurrentLevel = xp - currentLevel.xp
  const xpRequiredForNext = nextLevel.xp - currentLevel.xp
  const progress = xpInCurrentLevel / xpRequiredForNext
  const xpToNext = nextLevel.xp - xp
  
  return { progress, xpToNext, nextLevel }
}

// src/utils/helpers.js
import { Dimensions, PixelRatio } from 'react-native'
import { SCREEN_SIZES } from './constants'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

// Normalisation des tailles pour différents écrans
export const normalize = (size) => {
  const scale = SCREEN_WIDTH / 375 // iPhone 11 de référence
  const newSize = size * scale
  
  return Math.round(PixelRatio.roundToNearestPixel(newSize))
}

// Responsive helpers
export const isSmallScreen = () => SCREEN_WIDTH <= SCREEN_SIZES.small
export const isMediumScreen = () => SCREEN_WIDTH > SCREEN_SIZES.small && SCREEN_WIDTH <= SCREEN_SIZES.medium
export const isLargeScreen = () => SCREEN_WIDTH > SCREEN_SIZES.medium

// Formatage des nombres
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

// Formatage des durées
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes}min`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h${remainingMinutes}min`
}

// Formatage des dates relatives
export const formatTimeAgo = (timestamp) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInSeconds = Math.floor((now - time) / 1000)

  if (diffInSeconds < 60) return 'À l\'instant'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}j`
  
  return time.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short',
    year: time.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

// Validation email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validation mot de passe
export const isValidPassword = (password) => {
  return password.length >= 6
}

// Génération d'un ID unique
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Debounce function
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Capitaliser la première lettre
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Nettoyer et formater les tags
export const formatTag = (tag) => {
  return tag.toLowerCase().trim().replace(/[^a-z0-9]/g, '')
}

// Calculer la couleur de contraste
export const getContrastColor = (hexColor) => {
  const r = parseInt(hexColor.substr(1, 2), 16)
  const g = parseInt(hexColor.substr(3, 2), 16)
  const b = parseInt(hexColor.substr(5, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? '#000000' : '#FFFFFF'
}

// Mélanger un array
export const shuffleArray = (array) => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// src/utils/validators.js
export const validators = {
  required: (value, message = 'Ce champ est requis') => {
    return !value || value.trim() === '' ? message : null
  },

  email: (value, message = 'Email invalide') => {
    return !isValidEmail(value) ? message : null
  },

  password: (value, message = 'Le mot de passe doit contenir au moins 6 caractères') => {
    return !isValidPassword(value) ? message : null
  },

  minLength: (min, message) => (value) => {
    return value.length < min ? message || `Minimum ${min} caractères` : null
  },

  maxLength: (max, message) => (value) => {
    return value.length > max ? message || `Maximum ${max} caractères` : null
  },

  numeric: (value, message = 'Doit être un nombre') => {
    return isNaN(Number(value)) ? message : null
  },

  positiveNumber: (value, message = 'Doit être un nombre positif') => {
    const num = Number(value)
    return isNaN(num) || num <= 0 ? message : null
  }
}

// Fonction de validation de formulaire
export const validateForm = (data, rules) => {
  const errors = {}
  
  Object.keys(rules).forEach(field => {
    const fieldRules = Array.isArray(rules[field]) ? rules[field] : [rules[field]]
    const value = data[field]
    
    for (const rule of fieldRules) {
      const error = rule(value)
      if (error) {
        errors[field] = error
        break // Premier erreur trouvée
      }
    }
  })
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  }
}