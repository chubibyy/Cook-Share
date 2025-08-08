# CookShare Project Overview

This document provides a comprehensive overview of the CookShare mobile application, its technical stack, and its project structure.

## 1. What is CookShare?

CookShare is a mobile application built with React Native and Expo. It appears to be a social platform for cooking enthusiasts where users can:

*   Share cooking sessions.
*   Create, join, and manage clubs.
*   Participate in cooking challenges.
*   Manage user profiles.

The application uses **Supabase** as its backend for database storage, authentication, and other backend services.

## 2. Technology Stack

*   **Framework**: React Native with Expo
*   **Language**: JavaScript
*   **Backend & Database**: Supabase
*   **Navigation**: React Navigation
*   **State Management**: Appears to be a custom store-based system (see `src/stores`)
*   **Package Manager**: npm

## 3. Project Structure

The project is organized into several key directories.

### Root Directory

*   `.gitignore`: Specifies files and folders to be ignored by Git.
*   `app.config.js`: Configuration file for the Expo app (name, icon, splash screen, etc.).
*   `App.js`: The main entry point for the application. It likely initializes navigation and global providers.
*   `babel.config.js`: Configuration for the Babel JavaScript compiler.
*   `index.js`: The entry point for registering the app with React Native.
*   `metro.config.js`: Configuration for the Metro bundler used by React Native.
*   `package.json`: Lists project dependencies, scripts, and metadata.
*   `package-lock.json`: Records the exact versions of dependencies.
*   `DataBase/`: Contains SQL scripts for setting up and managing the Supabase database schema, with a strong focus on Row-Level Security (RLS) policies.
*   `assets/`: Global static assets for the app build, like the main icon and splash screen.
*   `node_modules/`: Contains all the installed npm packages.

### `src` Directory

This is the main folder containing the application's source code.

*   `src/assets/`: UI-specific assets like fonts, icons, and images used within components.
*   `src/components/`: Reusable React components, organized by type:
    *   `cards/`: Components for displaying specific items like Challenges, Clubs, and Sessions.
    *   `common/`: Generic, reusable components like `Button`, `Input`, `Avatar`.
    *   `layout/`: Components that define the structure of screens, such as `Header`, `TabBar`, and `SafeContainer`.
*   `src/hooks/`: Custom React hooks that encapsulate reusable logic (e.g., `useAuth`, `useCamera`).
*   `src/navigation/`: Contains the navigation logic using React Navigation.
    *   `AuthNavigator.js`: Manages screens related to authentication (Login, Register).
    *   `AppNavigator.js`: The main navigator after a user is logged in.
    *   `TabNavigator.js`: The primary bottom tab navigation for the main app features.
*   `src/screens/`: All the application screens, organized by feature.
    *   `auth/`: User authentication screens.
    *   `challenges/`: Screens for viewing and interacting with challenges.
    *   `clubs/`: Screens for club creation, details, and management.
    *   `create/`: Screen for creating new content, like a cooking session.
    *   `home/`: The main home screen and session details.
    *   `profile/`: User profile and editing screens.
*   `src/services/`: The API layer that handles all communication with the Supabase backend. Each file corresponds to a specific resource (e.g., `auth.js`, `clubs.js`, `users.js`).
*   `src/stores/`: Manages the application's global state. Each file seems to be a "store" for a specific domain of data (e.g., `authStore`, `userStore`).
*   `src/utils/`: Contains helper functions, global constants, and environment variable configurations.
