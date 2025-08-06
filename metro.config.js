// metro.config.js - Version corrigée avec cache fixé
const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

// Récupérer la config par défaut d'Expo
const config = getDefaultConfig(__dirname)

// Configuration des alias de chemins
config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
  '@components': path.resolve(__dirname, 'src/components'),
  '@screens': path.resolve(__dirname, 'src/screens'),
  '@services': path.resolve(__dirname, 'src/services'),
  '@stores': path.resolve(__dirname, 'src/stores'),
  '@utils': path.resolve(__dirname, 'src/utils'),
  '@assets': path.resolve(__dirname, 'src/assets'),
  '@hooks': path.resolve(__dirname, 'src/hooks'),
  '@navigation': path.resolve(__dirname, 'src/navigation'),
}

module.exports = config