// src/utils/constants.js
export const COLORS = {
  // Couleurs primaires - Palette moderne et chaleureuse
  primary: '#FF6B6B',        // Rouge vibrant principal
  primaryLight: '#FF8E8E',   // Rouge clair pour les hovers
  primaryDark: '#E63946',    // Rouge foncé pour les states
  primaryAlpha: 'rgba(255, 107, 107, 0.1)', // Fond transparent
  
  // Couleurs secondaires
  secondary: '#4ECDC4',      // Turquoise moderne
  secondaryLight: '#7BDAD5',
  secondaryDark: '#26B5AA',
  
  // Accent & highlights
  accent: '#FFD93D',         // Jaune doré pour XP/badges
  accentLight: '#FFE066',
  accentDark: '#F0C419',
  
  // Couleurs neutres - Palette grise moderne
  background: '#F8F9FA',     // Background principal très doux
  surface: '#FFFFFF',        // Cards et surfaces
  surfaceElevated: '#FFFFFF', // Cards avec élévation
  
  // Typography
  text: '#2D3436',          // Texte principal - gris très foncé
  textSecondary: '#636E72', // Texte secondaire
  textMuted: '#95A5A6',     // Texte discret
  textInverse: '#FFFFFF',   // Texte sur fond foncé
  
  // États sémantiques
  success: '#00B894',       // Vert pour succès
  successLight: '#55EFC4',
  warning: '#FDCB6E',       // Orange pour attention
  error: '#E74C3C',         // Rouge pour erreurs
  info: '#3498DB',          // Bleu pour info
  
  // Interface
  border: '#E2E8F0',        // Bordures subtiles
  borderLight: '#F1F5F9',   // Bordures très claires
  shadow: 'rgba(0, 0, 0, 0.1)', // Ombres douces
  overlay: 'rgba(0, 0, 0, 0.5)', // Overlay modal
  
  // Spéciaux
  placeholder: '#95A5A6',
  disabled: '#BDC3C7',
  white: '#FFFFFF',
  black: '#2D3436'
}

// Espacements - Système 8px
export const SPACING = {
  xs: 4,    // 4px
  sm: 8,    // 8px
  md: 16,   // 16px (base)
  lg: 24,   // 24px
  xl: 32,   // 32px
  xxl: 48,  // 48px
  xxxl: 64  // 64px
}

// Typography moderne
export const TYPOGRAPHY = {
  // Tailles de police
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,   // Taille de base
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40
  },
  
  // Weights
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },
  
  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6
  },
  
  // Familles (utilise les fonts système)
  families: {
    primary: 'System', // SF Pro sur iOS, Roboto sur Android
    mono: 'Courier'
  }
}

// Border radius - Design moderne avec coins arrondis
export const RADIUS = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999  // Cercles parfaits
}

// Shadows - Système d'élévation Material Design inspired
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0
  },
  sm: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  base: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4
  },
  lg: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8
  }
}

// Système de niveaux et XP avec gamification
export const LEVELS = {
  1: { 
    name: 'Cuisinier Débutant', 
    xp: 0, 
    color: '#95A5A6', 
    icon: '👶', 
    badge: 'Débutant',
    gradient: ['#BDC3C7', '#95A5A6']
  },
  2: { 
    name: 'Amateur Passionné', 
    xp: 100, 
    color: '#3498DB', 
    icon: '🔰', 
    badge: 'Amateur',
    gradient: ['#74B9FF', '#3498DB']
  },
  3: { 
    name: 'Chef Confirmé', 
    xp: 500, 
    color: '#9B59B6', 
    icon: '⭐', 
    badge: 'Confirmé',
    gradient: ['#A29BFE', '#9B59B6']
  },
  4: { 
    name: 'Expert Culinaire', 
    xp: 1500, 
    color: '#E67E22', 
    icon: '🏆', 
    badge: 'Expert',
    gradient: ['#FAB1A0', '#E67E22']
  },
  5: { 
    name: 'Master Chef', 
    xp: 5000, 
    color: '#F39C12', 
    icon: '👑', 
    badge: 'Master',
    gradient: ['#FDCB6E', '#F39C12']
  }
}

// Types de cuisine avec couleurs associées
export const CUISINE_TYPES = [
  { name: 'Française', color: '#E74C3C', emoji: '🇫🇷' },
  { name: 'Italienne', color: '#27AE60', emoji: '🇮🇹' },
  { name: 'Japonaise', color: '#E74C3C', emoji: '🇯🇵' },
  { name: 'Chinoise', color: '#F39C12', emoji: '🇨🇳' },
  { name: 'Indienne', color: '#E67E22', emoji: '🇮🇳' },
  { name: 'Mexicaine', color: '#27AE60', emoji: '🇲🇽' },
  { name: 'Thaï', color: '#8E44AD', emoji: '🇹🇭' },
  { name: 'Méditerranéenne', color: '#3498DB', emoji: '🌊' },
  { name: 'Végétarienne', color: '#2ECC71', emoji: '🌱' },
  { name: 'Vegan', color: '#27AE60', emoji: '🌿' },
  { name: 'Sans Gluten', color: '#F1C40F', emoji: '🌾' },
  { name: 'Desserts', color: '#E91E63', emoji: '🍰' },
  { name: 'Pâtisserie', color: '#9C27B0', emoji: '🧁' },
  { name: 'Street Food', color: '#FF5722', emoji: '🌮' },
  { name: 'Fusion', color: '#607D8B', emoji: '🌐' }
]

// Niveaux de difficulté avec design gamifié
export const DIFFICULTY_LEVELS = {
  1: { 
    name: 'Très facile', 
    icon: '😊', 
    color: '#00B894',
    description: 'Parfait pour débuter'
  },
  2: { 
    name: 'Facile', 
    icon: '🙂', 
    color: '#74B9FF',
    description: 'Quelques bases requises'
  },
  3: { 
    name: 'Moyen', 
    icon: '😐', 
    color: '#FDCB6E',
    description: 'Technique intermédiaire'
  },
  4: { 
    name: 'Difficile', 
    icon: '😤', 
    color: '#E17055',
    description: 'Pour les confirmés'
  },
  5: { 
    name: 'Expert', 
    icon: '🤯', 
    color: '#E74C3C',
    description: 'Réservé aux masters'
  }
}

// Animations - Durées standardisées
export const ANIMATIONS = {
  fast: 200,
  normal: 300,
  slow: 500
}

// Breakpoints pour responsive (si support web)
export const BREAKPOINTS = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200
}

// Tailles d'écran mobile
export const SCREEN_SIZES = {
  small: 375,  // iPhone SE
  medium: 390, // iPhone 14
  large: 428   // iPhone 14 Plus
}

// Configuration de l'app
export const APP_CONFIG = {
  name: 'PlateUp',
  tagline: 'Dress your plate, share the taste',
  version: '1.0.0',
  maxImageSize: 5 * 1024 * 1024, // 5MB
  supportedImageFormats: ['jpg', 'jpeg', 'png', 'webp'],
  maxSessionTitle: 100,
  maxBio: 250,
  maxIngredients: 20
}

