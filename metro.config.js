// index.js - Point d'entrée principal Expo
import 'react-native-gesture-handler' // IMPORTANT: Doit être en premier pour React Navigation
import { registerRootComponent } from 'expo'
import App from './App'

// Configuration globale des polyfills si nécessaire
import './src/utils/polyfills' // Optionnel: pour des polyfills custom

// Configuration des erreurs globales (développement)
if (__DEV__) {
  import('./src/utils/reactotron').then(() => console.log('Reactotron Configured'))
}

// registerRootComponent remplace AppRegistry.registerComponent
// Compatible avec Expo Go ET les builds natifs
registerRootComponent(App)

// metro.config.js - Configuration du bundler Metro
const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

// Récupérer la config par défaut d'Expo
const config = getDefaultConfig(__dirname)

// 1. Configuration des extensions de fichiers supportées
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'jsx', 'ts', 'tsx', 'js', 'json'
]

// 2. Support des fichiers SVG (optionnel)
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg')
config.resolver.sourceExts.push('svg')

// 3. Configuration des alias de chemins - TRÈS UTILE !
config.resolver.alias = {
  // Alias racine
  '@': path.resolve(__dirname, 'src'),
  
  // Alias spécifiques (optionnel mais recommandé)
  '@components': path.resolve(__dirname, 'src/components'),
  '@screens': path.resolve(__dirname, 'src/screens'),
  '@services': path.resolve(__dirname, 'src/services'),
  '@stores': path.resolve(__dirname, 'src/stores'),
  '@utils': path.resolve(__dirname, 'src/utils'),
  '@assets': path.resolve(__dirname, 'src/assets'),
  '@hooks': path.resolve(__dirname, 'src/hooks'),
  '@navigation': path.resolve(__dirname, 'src/navigation'),
}

// 4. Configuration du transformer (pour optimisations)
config.transformer = {
  ...config.transformer,
  // Support des fichiers SVG avec react-native-svg
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
  
  // Optimisation des images
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  
  // Support des imports dynamiques
  unstable_allowRequireContext: true,
}

// 5. Configuration du cache (performance)
config.cacheStores = [
  {
    name: 'FileStore',
    get: require('metro-cache/src/stores/FileStore'),
  },
]

// 6. Configuration spécifique à l'environnement
if (process.env.NODE_ENV === 'production') {
  // Optimisations pour la production
  config.transformer.minifierConfig = {
    // Configuration du minifier
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  }
}

// 7. Configuration pour les monorepos (si applicable)
const watchFolders = [
  // path.resolve(__dirname, '../shared'), // Si vous avez des packages partagés
]

if (watchFolders.length > 0) {
  config.watchFolders = watchFolders
}

module.exports = config