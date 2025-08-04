export default {
  expo: {
    name: "Cook&Share",
    slug: "cook-and-share",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./src/assets/images/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./src/assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#FF6B6B"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.cookshare.app",
      infoPlist: {
        NSCameraUsageDescription: "Cette app a besoin d'accéder à votre caméra pour prendre des photos de vos plats.",
        NSPhotoLibraryUsageDescription: "Cette app a besoin d'accéder à vos photos pour partager vos créations culinaires."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./src/assets/images/adaptive-icon.png",
        backgroundColor: "#FF6B6B"
      },
      package: "com.cookshare.app",
      permissions: [
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ]
    },
    web: {
      favicon: "./src/assets/images/favicon.png"
    },
    plugins: [
      [
        "expo-camera",
        {
          cameraPermission: "Autoriser Cook&Share à accéder à votre caméra pour prendre des photos de vos plats."
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "Cette app a besoin d'accéder à vos photos pour partager vos créations culinaires."
        }
      ],
      "expo-notifications"
    ],
    extra: {
      eas: {
        projectId: process.env.EAS_PROJECT_ID
      },
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    }
  }
};


