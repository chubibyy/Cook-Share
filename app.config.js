// app.config.js - Version sans assets manquants
export default {
  expo: {
    name: "PlateUp",
    slug: "plateup-app",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    
    splash: {
      resizeMode: "contain",
      backgroundColor: "#FF6B6B"
    },
    
    assetBundlePatterns: ["**/*"],
    
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.plateup.app",
      infoPlist: {
        NSCameraUsageDescription: "Cette app a besoin d'accéder à votre caméra pour prendre des photos de vos plats.",
        NSPhotoLibraryUsageDescription: "Cette app a besoin d'accéder à vos photos pour partager vos créations culinaires."
      }
    },
    
    android: {
      adaptiveIcon: {
        backgroundColor: "#FF6B6B"
      },
      package: "com.plateup.app",
      permissions: [
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE"
      ]
    },
    
    web: {},
    
    extra: {
      eas: {
        projectId: process.env.EAS_PROJECT_ID
      },
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    }
  }
};