# CarMarket365 Mobile

React Native (Expo) mobile app for iOS & Android — single codebase consuming the existing CarMarket365 GraphQL backend.

## Stack

- **Expo** (React Native) + TypeScript
- **Apollo Client** (GraphQL)
- **Expo Router** (file-based navigation)
- **Expo SecureStore** (auth tokens)
- **EAS Build** (App Store + Play Store deployment)

## Getting Started

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (iOS/Android) to preview on your device.

## Project Structure

```
src/
  components/    # Reusable UI components
  constants/     # Makes, models, enums
  context/       # React context providers (auth, theme)
  graphql/       # Queries & mutations
  hooks/         # Custom hooks
  screens/       # Screen components
  utils/         # Helper functions
assets/          # Icons, splash screen, images
```

## Backend

This app connects to the CarMarket365 NestJS + GraphQL backend. See the main repo for backend documentation.

## Build & Deploy

```bash
npx eas build --platform all
npx eas submit --platform all
```
