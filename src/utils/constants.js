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
// Animations - Durées standardisées
export const ANIMATIONS = {
  fast: 200,
  normal: 300,
  slow: 500
}

// Types de cuisine avec emojis
export const CUISINE_TYPES = [
  { name: 'Française', emoji: '🇫🇷' },
  { name: 'Italienne', emoji: '🇮🇹' },
  { name: 'Japonaise', emoji: '🇯🇵' },
  { name: 'Mexicaine', emoji: '🇲🇽' },
  { name: 'Indienne', emoji: '🇮🇳' },
  { name: 'Chinoise', emoji: '🇨🇳' },
  { name: 'Thaïlandaise', emoji: '🇹🇭' },
  { name: 'Méditerranéenne', emoji: '🌊' },
  { name: 'Américaine', emoji: '🇺🇸' },
  { name: 'Libanaise', emoji: '🇱🇧' },
  { name: 'Marocaine', emoji: '🇲🇦' },
  { name: 'Végétarienne', emoji: '🥬' },
  { name: 'Végétalienne', emoji: '🌱' },
  { name: 'Sans gluten', emoji: '🌾' },
  { name: 'Fusion', emoji: '🌎' }
];

// Niveaux de difficulté
export const DIFFICULTY_LEVELS = {
  1: { 
    name: 'Très facile', 
    icon: '⭐', 
    color: COLORS.success,
    description: 'Parfait pour débuter'
  },
  2: { 
    name: 'Facile', 
    icon: '⭐⭐', 
    color: COLORS.info,
    description: 'Quelques techniques de base'
  },
  3: { 
    name: 'Intermédiaire', 
    icon: '⭐⭐⭐', 
    color: COLORS.warning,
    description: 'Demande de la pratique'
  },
  4: { 
    name: 'Difficile', 
    icon: '⭐⭐⭐⭐', 
    color: COLORS.error,
    description: 'Pour cuisiniers expérimentés'
  },
  5: { 
    name: 'Expert', 
    icon: '⭐⭐⭐⭐⭐', 
    color: COLORS.primaryDark,
    description: 'Réservé aux chefs professionnels'
  }
};

// Contraintes alimentaires communes
export const DIETARY_CONSTRAINTS = [
  'Végétarien',
  'Végétalien',
  'Sans gluten',
  'Sans lactose',
  'Halal',
  'Casher',
  'Paléo',
  'Cétogène',
  'Sans sucre',
  'Sans noix',
  'Bio uniquement',
  'Local uniquement'
];

// Fréquences de cuisine
export const COOK_FREQUENCIES = [
  { value: 'daily', label: 'Tous les jours', emoji: '👨‍🍳' },
  { value: 'weekly', label: 'Plusieurs fois par semaine', emoji: '🍽️' },
  { value: 'weekend', label: 'Week-ends seulement', emoji: '🏠' },
  { value: 'monthly', label: 'Occasionnellement', emoji: '🎉' },
  { value: 'rarely', label: 'Rarement', emoji: '🥡' }
];

// Tags populaires pour les sessions
export const POPULAR_TAGS = [
  'rapide',
  'healthy',
  'comfort food',
  'dessert',
  'apéritif',
  'plat principal',
  'entrée',
  'petit déjeuner',
  'brunch',
  'dîner',
  'festif',
  'enfants',
  'batch cooking',
  'meal prep',
  'économique',
  'gourmand',
  'léger',
  'protéiné',
  'épicé',
  'sucré',
  'salé',
  'cru',
  'grillé',
  'mijoté',
  'fait maison'
];

// Tailles d'écran pour responsive
export const SCREEN_SIZES = {
  small: 320,   // iPhone SE
  medium: 375,  // iPhone 11
  large: 414,   // iPhone 11 Pro Max
  tablet: 768   // iPad
};

// Templates de notifications
export const NOTIFICATION_TEMPLATES = {
  LIKE: (username) => `${username} a aimé votre création`,
  COMMENT: (username) => `${username} a commenté votre plat`,
  FOLLOW: (username) => `${username} vous suit maintenant`,
  CHALLENGE_NEW: (title) => `Nouveau défi disponible : ${title}`,
  CHALLENGE_ENDING: (title) => `Plus que 24h pour le défi : ${title}`,
  CHALLENGE_WON: (title, xp) => `Défi "${title}" réussi ! +${xp} XP`,
  CLUB_INVITE: (clubName) => `Invitation à rejoindre ${clubName}`,
  LEVEL_UP: (levelName, level) => `Félicitations ! Vous êtes maintenant ${levelName} (niveau ${level})`
};

// Achievements/Succès déblocables
export const ACHIEVEMENTS = {
  FIRST_SESSION: {
    id: 'first_session',
    title: 'Premier pas',
    description: 'Partagez votre première création',
    icon: '🥳',
    xp: 50
  },
  FIRST_LIKE: {
    id: 'first_like',
    title: 'Apprécié',
    description: 'Recevez votre premier like',
    icon: '❤️',
    xp: 25
  },
  WEEK_STREAK: {
    id: 'week_streak',
    title: 'Régularité',
    description: 'Partagez une création chaque jour pendant 7 jours',
    icon: '🔥',
    xp: 200
  },
  CHALLENGE_MASTER: {
    id: 'challenge_master',
    title: 'Maître des défis',
    description: 'Réussissez 10 challenges',
    icon: '🏆',
    xp: 500
  },
  SOCIAL_BUTTERFLY: {
    id: 'social_butterfly',
    title: 'Papillon social',
    description: 'Obtenez 100 followers',
    icon: '🦋',
    xp: 300
  },
  HELPFUL_CHEF: {
    id: 'helpful_chef',
    title: 'Chef serviable',
    description: 'Laissez 50 commentaires constructifs',
    icon: '💬',
    xp: 150
  }
}