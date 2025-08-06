// babel.config.js - Configuration Babel (pour que les alias fonctionnent)
module.exports = function (api) {
  api.cache(true)
  
  return {
    presets: [
      'babel-preset-expo' // Preset par défaut d'Expo
    ],
    plugins: [
      // Plugin pour les alias de chemins
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@services': './src/services',
            '@stores': './src/stores',
            '@utils': './src/utils',
            '@assets': './src/assets',
            '@hooks': './src/hooks',
            '@navigation': './src/navigation',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
        }
      ],
      
      // Plugin React Native Reanimated (DOIT être en dernier !)
      'react-native-reanimated/plugin'
    ]
  }
}

// src/utils/polyfills.js - Polyfills personnalisés (optionnel)
// Uniquement si vous avez besoin de compatibilité avec des librairies spécifiques

// Polyfill pour TextEncoder/TextDecoder si nécessaire
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('text-encoding').TextEncoder
  global.TextDecoder = require('text-encoding').TextDecoder
}

// Polyfill pour URL si nécessaire  
if (typeof global.URL === 'undefined') {
  global.URL = require('whatwg-url').URL
}

// Buffer polyfill si vous utilisez des libs Node.js
if (typeof global.Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer
}

// src/utils/reactotron.js - Configuration Reactotron (développement)
if (__DEV__) {
  import('reactotron-react-native').then((Reactotron) => {
    Reactotron.default
      .setAsyncStorageHandler(require('@react-native-async-storage/async-storage').default)
      .configure({
        host: '10.0.2.2', // Pour Android Emulator
        // host: 'localhost', // Pour iOS Simulator  
        port: 9090,
        name: 'PlateUp'
      })
      .useReactNative({
        asyncStorage: false,
        networking: {
          ignoreUrls: /symbolicate/
        },
        editor: false,
        errors: { veto: stackFrame => false },
        overlay: false,
      })
      .use(require('reactotron-redux')())
      .connect()
      
    // Clear sur reload  
    Reactotron.default.clear()
    
    console.tron = Reactotron.default
  })
}