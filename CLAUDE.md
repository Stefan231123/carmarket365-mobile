# CLAUDE.md — Instructions for AI Agents

## Project Context

This is a **React Native (Expo)** mobile app for CarMarket365 — a car marketplace platform. It consumes an existing NestJS + GraphQL backend. Read `PROJECT-DOSSIER.md` for full project context.

## Commands

```bash
npm install          # Install dependencies
npx expo start       # Start dev server
npx expo start --ios # Start iOS simulator
npx expo start --android # Start Android emulator
npx eas build        # Build for production
```

## Design Rule — CRITICAL

**The website (carmarket365.com) is the design reference. The mobile app must look the same as the website.**

Before building any screen:
1. Visit `https://www.carmarket365.com` to see the live design
2. Read the web source at `/Users/stefankocevski/Documents/my-carmarket-frontend/flare-realm/client/`
3. Study the matching page in `client/pages/` and components in `client/components/`
4. Replicate the same layout, colors, spacing, typography, and interactions in React Native

## Architecture Rules

- **DO NOT** create a backend, API, or database — the backend exists at `carmarket365-backend.up.railway.app/graphql`
- **DO NOT** use AsyncStorage for auth tokens — use `expo-secure-store`
- **DO NOT** upload images directly to Cloudinary from the app — go through the backend
- All data fetching goes through Apollo Client + GraphQL
- All types must mirror the backend schema (see `src/types/index.ts`)
- All enums must match backend enums (see `src/constants/enums.ts`)

## Code Style

- TypeScript strict mode, no `any`
- Functional components only
- Custom hooks for data logic (`use` prefix)
- 2-space indentation
- PascalCase for components, camelCase for hooks/utils
- Keep components focused — one component per file

## File Organization

- `src/components/` — reusable UI components (CarCard, ImageGallery, etc.)
- `src/screens/` — full screen components
- `src/graphql/queries/` — GraphQL query strings
- `src/graphql/mutations/` — GraphQL mutation strings
- `src/hooks/` — custom React hooks
- `src/context/` — React context providers
- `src/constants/` — enums, theme, API config, makes list
- `src/types/` — TypeScript interfaces
- `src/utils/` — helper/utility functions

## Key Patterns

- Car listings use cursor-based pagination (`limit` + `offset`)
- Auth tokens stored in SecureStore, injected via Apollo Link
- Images come as Cloudinary URLs — display directly in `<Image>`
- Brand primary color: `#2563eb`
- Use skeleton loaders, not spinners
- Pull-to-refresh on all list screens

## Linear Integration

Issues CAR-60 to CAR-78 track all work. Follow phase order (1→5).
