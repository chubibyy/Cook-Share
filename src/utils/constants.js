// src/utils/constants.js
export const COLORS = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4', 
  accent: '#FFE066',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#2D3436',
  textLight: '#636E72',
  success: '#00B894',
  warning: '#FDCB6E',
  error: '#E74C3C',
  border: '#DDD',
  placeholder: '#95A5A6'
}

export const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
}

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28
  }
}

export const LEVELS = {
  1: { name: 'Cuisinier Débutant', xp: 0, color: '#95A5A6', icon: '👶' },
  2: { name: 'Amateur', xp: 100, color: '#3498DB', icon: '🔰' },
  3: { name: 'Confirmé', xp: 500, color: '#9B59B6', icon: '⭐' },
  4: { name: 'Expert', xp: 1500, color: '#E67E22', icon: '🏆' },
  5: { name: 'Chef', xp: 5000, color: '#F39C12', icon: '👑' }
}

export const CUISINE_TYPES = [
  'Française', 'Italienne', 'Japonaise', 'Chinoise', 'Indienne',
  'Mexicaine', 'Thaï', 'Méditerranéenne', 'Végétarienne', 'Vegan',
  'Sans Gluten', 'Desserts', 'Pâtisserie', 'Street Food', 'Fusion'
]

export const DIFFICULTY_LEVELS = {
  1: { name: 'Très facile', icon: '😊', color: '#00B894' },
  2: { name: 'Facile', icon: '🙂', color: '#74B9FF' },
  3: { name: 'Moyen', icon: '😐', color: '#FDCB6E' },
  4: { name: 'Difficile', icon: '😤', color: '#E17055' },
  5: { name: 'Expert', icon: '🤯', color: '#E74C3C' }
}