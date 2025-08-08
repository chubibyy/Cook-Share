# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm start` or `expo start` - Start the Expo development server
- `expo start --android` - Start with Android simulator/device
- `expo start --ios` - Start with iOS simulator/device  
- `expo start --web` - Start web version

### Build Commands
- `eas build -p android` - Build Android app
- `eas build -p ios` - Build iOS app
- `eas submit -p android` - Submit Android app to Play Store
- `eas submit -p ios` - Submit iOS app to App Store

## Architecture Overview

### Tech Stack
- **Framework**: React Native with Expo SDK 53
- **Navigation**: React Navigation v7 (Native Stack + Bottom Tabs)
- **State Management**: Zustand with persistence via AsyncStorage
- **Backend**: Supabase (PostgreSQL + Authentication + Storage)
- **UI Components**: Custom component library with design system

### App Structure Flow
1. **App.js** - Main entry point with authentication routing logic:
   - Routes to `AuthNavigator` if user not authenticated
   - Routes to `OnboardingScreen` if user authenticated but onboarding incomplete
   - Routes to `AppNavigator` (main app) if user authenticated and onboarded

2. **Navigation Hierarchy**:
   ```
   App.js
   ├── AuthNavigator (login, register, forgot password, welcome)
   ├── OnboardingScreen (3-step onboarding process)
   └── AppNavigator
       ├── TabNavigator (bottom tabs: Home, Challenges, Clubs, Profile)
       └── CreateSessionScreen (modal)
   ```

### Key Directories
- `src/screens/` - Screen components organized by feature (auth, home, profile, etc.)
- `src/components/` - Reusable UI components (cards, common, layout)
- `src/stores/` - Zustand state management (auth, sessions, notifications, etc.)
- `src/services/` - API services for Supabase interactions
- `src/utils/` - Constants, helpers, environment configuration
- `src/navigation/` - Navigation configuration files

### State Management Pattern
Uses Zustand stores with persistence:
- **authStore.js** - Authentication, user profile, onboarding completion
- **sessionStore.js** - Cooking sessions management
- **challengeStore.js** - Cooking challenges
- **notificationStore.js** - Real-time notifications via Supabase
- **userStore.js** - User profiles and social features

### Authentication Flow
1. User signs up/in via `authService` (Supabase Auth)
2. `ensureUserProfile()` creates user record in `users` table if needed
3. Onboarding captures: cooking preferences, dietary constraints, profile setup
4. `completeOnboarding()` sets `onboarding_completed: true`
5. Main app becomes accessible

### Database Architecture (Supabase)
Key tables:
- `users` - User profiles with cooking preferences, XP, onboarding status
- `cooking_sessions` - User-generated cooking content with images
- `challenges` - Cooking challenges with XP rewards
- `clubs` - Cooking clubs/communities
- `notifications` - Real-time user notifications
- `followers` - Social following relationships

### Design System
- **Colors**: Defined in `src/utils/constants.js` with modern palette (primary: #FF6B6B)
- **Typography**: System fonts with standardized sizes and weights
- **Spacing**: 8px grid system (xs: 4px to xxxl: 64px)
- **Components**: Consistent design with shadows, radius, and color system

### Key Features
- **Gamification**: XP system with 5 levels (Débutant to Master Chef)
- **Social**: Following, likes, comments, user profiles
- **Content Creation**: Camera integration for cooking session photos
- **Real-time**: Supabase subscriptions for notifications
- **Onboarding**: 3-step process capturing food preferences and cooking style
- **Storage**: Supabase Storage for images with organized folder structure

## Environment Setup
Requires these environment variables in app.config.js or .env:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Development Notes
- Uses TypeScript for type safety (though many files are still .js)
- Implements proper error boundaries for crash handling
- Image uploads organized by type: avatars/, sessions/, clubs/, challenges/
- Real-time notifications via Supabase subscriptions
- Persistent authentication state across app restarts
- LogBox configured to ignore common React Navigation warnings