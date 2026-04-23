# CarMarket365 Mobile — Project Dossier
> Prepared for AI/developer handoff. Last updated: April 2026.
> This document contains ALL knowledge required to continue development with zero additional context.

---

## 1. PROJECT OVERVIEW

**Project name:** CarMarket365 Mobile
**Repository:** `carmarket365-mobile`
**Platform:** iOS + Android (single codebase)

**Purpose:**
Native mobile app for the CarMarket365 car marketplace. This app consumes the **existing** NestJS + GraphQL backend — no backend work is needed except for push notifications (Phase 4).

**Target market:** North Macedonia (primary), Balkans region (Albania, Kosovo, Serbia, Slovenia)

**Languages:** Macedonian (MK), Albanian (SQ), English (EN), Slovenian (SL), Russian (RU), Latvian (LV)

**Relationship to web app:**
- Web app: `carmarket365.com` — React SPA (Vite + shadcn/ui + Tailwind)
- Mobile app: this repo — React Native (Expo)
- Both apps share the **same GraphQL backend** on Railway
- GraphQL queries/mutations are functionally identical, just different client libraries (Apollo Client for both)
- UI components are NOT shared (React DOM vs React Native) — screens must be rebuilt

---

## 2. TECH STACK

| Layer | Technology |
|---|---|
| Framework | Expo SDK 54 (React Native) |
| Language | TypeScript (strict mode) |
| Navigation | Expo Router (file-based) |
| GraphQL | Apollo Client |
| Auth tokens | expo-secure-store |
| Image picker | expo-image-picker |
| Push notifications | expo-notifications |
| Location | expo-location |
| Maps | react-native-maps |
| Build & deploy | EAS Build + EAS Submit |
| OTA updates | expo-updates |

---

## 3. BACKEND API

**The backend already exists. Do NOT create a new backend.**

| | |
|---|---|
| Production URL | `https://carmarket365-backend.up.railway.app/graphql` |
| Local dev URL | `http://localhost:3002/graphql` |
| Auth mechanism | JWT Bearer token in Authorization header |
| Token flow | Login mutation → returns `accessToken` → store in SecureStore → attach to every request |
| API style | GraphQL (code-first, Apollo Server) |
| CORS | Mobile apps don't have CORS issues (no browser) |

### Key GraphQL Operations

**Queries:**
- `cars(limit, offset, make, model, yearMin, yearMax, priceMin, priceMax, fuelType, transmission, ...)` — paginated listings with filters
- `car(id)` — single car detail
- `me` — current authenticated user
- `myCars` — current user's listings
- `mySavedCars` — current user's saved/favorited cars

**Mutations:**
- `login(loginInput)` → `{ accessToken, user }`
- `register(registerInput)` → `{ accessToken, user }`
- `logout` → boolean
- `createCar(createCarInput)` → Car
- `updateCar(id, updateCarInput)` → Car
- `deleteCar(id)` → boolean
- `toggleSaveCar(carId)` → SavedCar
- `recordCarView(carId)` → CarView
- `createInquiry(createInquiryInput)` → CarInquiry
- `uploadCarImages(carId, files)` → [CarImage]

---

## 4. DATA MODELS

### Car (main listing entity)
```
id: UUID
make: string               — e.g., "BMW", "Volkswagen"
model: string              — e.g., "3 Series", "Golf"
variant?: string           — e.g., "Sport", "Luxury"
year: number
price: number              — decimal(12,2) in EUR
mileage: number            — in kilometers
vehicleType: VehicleType   — CAR, SUV, SEDAN, HATCHBACK, etc.
fuelType: FuelType         — GASOLINE, DIESEL, ELECTRIC, HYBRID, etc.
transmission: TransmissionType — MANUAL, AUTOMATIC, CVT, SEMI_AUTOMATIC
condition: CarCondition    — NEW, USED, CERTIFIED, DAMAGED
color?: string
interiorColor?: string
description?: string
engineSize?: number        — in CC
horsePower?: number
doors?: number
seats?: number
drivetrain?: DrivetrainType — FWD, RWD, AWD, FOUR_WD
features: string[]         — ["Air Conditioning", "Leather Seats", ...]
safetyFeatures: string[]   — ["ABS", "Airbags", "ESP", ...]
location: string           — required display location
city?: string
region?: string
countryCode?: string
latitude?: number
longitude?: number
isAvailable: boolean
isFeatured: boolean
viewCount: number
favoriteCount: number
inquiryCount: number
contactPhone?: string
contactEmail?: string
priceNegotiable?: boolean
seller: User               — eager-loaded relationship
images: CarImage[]         — sorted by sortOrder
createdAt: Date
updatedAt: Date
soldAt?: Date
```

### User
```
id: UUID
email: string (unique)
firstName?: string
lastName?: string
name: string (computed: firstName + lastName || dealerName || email)
phone?: string
avatarUrl?: string
role: UserRole — USER, DEALER, ADMIN
isActive: boolean
isEmailVerified: boolean
languagePreference?: string
dealerName?: string (if DEALER role)
dealerStatus?: DealerStatus — PENDING, APPROVED, SUSPENDED, REJECTED
dealerLogoUrl?: string
dealerCity?: string
dealerPhoneNumber?: string
dealerWebsite?: string
dealerWorkingHours: string[]
dealerServices: string[]
```

### CarImage
```
id: UUID
url: string          — Cloudinary URL
publicId: string     — Cloudinary public_id
isPrimary: boolean
sortOrder: number
carId: UUID (FK)
```

### SavedCar
```
id: UUID
userId: UUID (FK)
carId: UUID (FK)
car: Car (eager)
createdAt: Date
```

---

## 5. FOLDER STRUCTURE

```
carmarket365-mobile/
├── App.tsx                    ← Entry point (will be replaced by Expo Router layout)
├── app.json                   ← Expo configuration
├── package.json
├── tsconfig.json
├── assets/                    ← Icons, splash screen, static images
│   ├── icon.png
│   ├── adaptive-icon.png
│   ├── splash-icon.png
│   └── favicon.png
└── src/
    ├── components/            ← Reusable UI components
    │   ├── CarCard.tsx           (TODO)
    │   ├── ImageGallery.tsx      (TODO)
    │   ├── FilterSheet.tsx       (TODO)
    │   ├── SkeletonLoader.tsx    (TODO)
    │   └── ...
    ├── screens/               ← Full screen components
    │   ├── HomeScreen.tsx        (TODO)
    │   ├── CarDetailScreen.tsx   (TODO)
    │   ├── SearchScreen.tsx      (TODO)
    │   ├── PostCarScreen.tsx     (TODO)
    │   ├── SavedCarsScreen.tsx   (TODO)
    │   ├── ProfileScreen.tsx     (TODO)
    │   ├── LoginScreen.tsx       (TODO)
    │   └── RegisterScreen.tsx    (TODO)
    ├── graphql/
    │   ├── queries/
    │   │   ├── cars.ts           ← Car listing queries
    │   │   └── user.ts           ← User & auth queries
    │   └── mutations/
    │       ├── auth.ts           ← Login, register, logout
    │       └── cars.ts           ← Create, update, delete, save, inquire
    ├── hooks/
    │   └── useCars.ts            ← Custom hooks (TODO: implement)
    ├── context/
    │   └── AuthContext.tsx        ← Auth state management (TODO: implement)
    ├── constants/
    │   ├── api.ts                ← API URLs and config
    │   ├── enums.ts              ← All TypeScript enums (mirrors backend)
    │   ├── makes.ts              ← Car makes list
    │   └── theme.ts              ← Colors, spacing, typography
    ├── types/
    │   └── index.ts              ← TypeScript interfaces for all entities
    └── utils/
        └── formatters.ts         ← Price, mileage, time formatting
```

---

## 6. IMPLEMENTATION PHASES

Track progress via Linear project: **CarMarket365 Mobile App**

### Phase 1: Foundation (CAR-60 → CAR-63)
- [x] Create Expo project with TypeScript
- [ ] Set up Apollo Client with GraphQL backend (CAR-61)
- [ ] Implement auth flow — login, register, token storage (CAR-62)
- [ ] Set up tab navigation — Home, Search, Post, Saved, Profile (CAR-63)

### Phase 2: Core Screens (CAR-64 → CAR-67)
- [ ] Home screen — featured & recent listings (CAR-64)
- [ ] Car detail screen — gallery, specs, seller info (CAR-65)
- [ ] Search & filter screen (CAR-66)
- [ ] Listings grid with infinite scroll (CAR-67)

### Phase 3: User Features (CAR-68 → CAR-71)
- [ ] Post a car — multi-step form with image picker (CAR-68)
- [ ] My listings dashboard — edit, mark sold, delete (CAR-69)
- [ ] Saved cars / favorites (CAR-70)
- [ ] User profile & settings (CAR-71)

### Phase 4: Mobile-Specific (CAR-72 → CAR-75)
- [ ] Push notifications — Expo + backend (CAR-72)
- [ ] Deep linking — web URLs open in app (CAR-73)
- [ ] Location-based search — device GPS (CAR-74)
- [ ] Native share sheet (CAR-75)

### Phase 5: Polish & Launch (CAR-76 → CAR-78)
- [ ] App icons, splash screen, branding (CAR-76)
- [ ] Performance testing on real devices (CAR-77)
- [ ] EAS Build + App Store & Play Store submission (CAR-78)

---

## 7. IMAGES & CLOUDINARY

Images are stored on Cloudinary. The mobile app does NOT upload directly to Cloudinary.

**Upload flow:**
1. User picks images with `expo-image-picker`
2. App sends images to backend via `uploadCarImages` mutation (multipart)
3. Backend uploads to Cloudinary, applies watermark, saves CarImage records
4. Backend returns Cloudinary URLs

**Display:**
- Use Cloudinary URLs directly in `<Image>` components
- Cloudinary cloud name: `dqduao6rg`
- Image folder: `carmarket365/`
- Images are watermarked server-side on upload

---

## 8. AUTHENTICATION FLOW

```
1. User enters email + password
2. App calls `login` mutation
3. Backend validates credentials, returns JWT accessToken
4. App stores token in expo-secure-store (NOT AsyncStorage)
5. Apollo Client attaches token as Authorization: Bearer <token> header
6. On app launch, check SecureStore for existing token
7. If token exists, call `me` query to validate
8. If token expired/invalid, clear and show login
```

**Important:** Use `expo-secure-store` for tokens — it uses Keychain (iOS) and EncryptedSharedPreferences (Android). Never use AsyncStorage for auth tokens.

---

## 9. NAVIGATION STRUCTURE

```
Tab Navigator (bottom tabs)
├── Home (Stack)
│   ├── HomeScreen
│   └── CarDetailScreen
├── Search (Stack)
│   ├── SearchScreen
│   └── CarDetailScreen
├── Post (Stack) — requires auth
│   └── PostCarScreen (multi-step)
├── Saved (Stack) — requires auth
│   ├── SavedCarsScreen
│   └── CarDetailScreen
└── Profile (Stack)
    ├── ProfileScreen (or LoginScreen if not authenticated)
    ├── EditProfileScreen
    ├── MyListingsScreen
    └── SettingsScreen
```

---

## 10. BACKEND CHANGES NEEDED

Only **two** backend changes are needed (both in Phase 4):

1. **Push notification token storage:**
   - Add `expoPushToken: string` column to `users` table
   - Create migration
   - Create `savePushToken` GraphQL mutation

2. **Push notification sending:**
   - Create `NotificationService` using Expo Push API
   - Trigger on: new inquiry, price drop on saved car, listing approved, search alert match

Everything else (auth, cars CRUD, saved cars, images, search) already works.

---

## 11. ENVIRONMENT VARIABLES

Create a `.env` file (gitignored) with:

```env
# Not strictly needed — API URLs are in src/constants/api.ts
# Add any secrets here if needed in the future
```

No secrets are needed in the mobile app — all sensitive operations go through the backend.

---

## 12. DEVELOPMENT SETUP

```bash
# Clone the repo
git clone https://github.com/Stefan231123/carmarket365-mobile.git
cd carmarket365-mobile

# Install dependencies
npm install

# Start Expo dev server
npx expo start

# Scan QR code with Expo Go app (iOS/Android)
# Or press 'i' for iOS simulator, 'a' for Android emulator
```

**Prerequisites:**
- Node.js 18+
- Expo Go app on your phone (for testing)
- Xcode (for iOS simulator, macOS only)
- Android Studio (for Android emulator, optional)

---

## 13. CODING CONVENTIONS

- **TypeScript strict mode** — no `any` types
- **Functional components** only — no class components
- **Custom hooks** for data fetching — `useCars()`, `useAuth()`, etc.
- **Constants in `src/constants/`** — never hardcode enums or config
- **Types in `src/types/`** — mirrors backend GraphQL schema
- **Formatting:** Prettier defaults, 2-space indent
- **Naming:**
  - Components: PascalCase (`CarCard.tsx`)
  - Hooks: camelCase with `use` prefix (`useCars.ts`)
  - Constants: UPPER_SNAKE_CASE (`COLORS`, `API_URL`)
  - Files: match export name

---

## 14. DESIGN GUIDELINES

- Match the web app's visual style (clean, modern, blue primary color)
- Brand color: `#2563eb` (Blue-600)
- Use native platform conventions (iOS: large titles, Android: material design)
- Card-based layout for car listings
- Bottom tab navigation (5 tabs)
- Pull-to-refresh on all list screens
- Skeleton loading states (not spinners)
- Toast/snackbar for success/error feedback

---

## 15. INSTRUCTIONS FOR AI AGENTS

When working on this project:

1. **Read this dossier first** — it has everything you need
2. **Check the Linear board** — issues CAR-60 to CAR-78 have detailed specs
3. **Do NOT create a backend** — use the existing GraphQL API
4. **Do NOT modify the backend** — except for Phase 4 push notification changes
5. **Test with Expo Go** — run `npx expo start` and scan QR code
6. **Follow the phase order** — Phase 1 must be complete before Phase 2
7. **Keep types in sync** — if backend schema changes, update `src/types/index.ts`
8. **Use expo-secure-store** for auth tokens, never AsyncStorage
9. **GraphQL queries are already drafted** — in `src/graphql/`, convert to Apollo Client `gql` tag
10. **Reuse components** — `CarCard` should be used in Home, Search, and Saved screens
