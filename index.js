
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