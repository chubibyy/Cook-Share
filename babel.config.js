// babel.config.js - Version nettoyée
module.exports = function (api) {
  api.cache(true)
  
  return {
    presets: [
      'babel-preset-expo'
    ],
    plugins: [
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
      'react-native-reanimated/plugin'
    ]
  }
}

// TOUT LE RESTE A ÉTÉ SUPPRIMÉ - ça n'a pas sa place ici !