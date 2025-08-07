// src/utils/env.js - Configuration d'environnement
export const ENV = {
  // Supabase
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  
  // App
  APP_NAME: 'PlateUp',
  APP_VERSION: '1.0.0',
  
  // Debug
  IS_DEV: __DEV__,
  
  // API URLs
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.plateup.com',
  
  // Storage
  STORAGE_BUCKET: 'plate-up',
  
  // Validation
  validate() {
    const required = [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY'
    ];
    
    const missing = required.filter(key => !this[key]);
    
    if (missing.length > 0) {
      throw new Error(`Variables d'environnement manquantes: ${missing.join(', ')}`);
    }
  }
};

// Valider au démarrage
ENV.validate();