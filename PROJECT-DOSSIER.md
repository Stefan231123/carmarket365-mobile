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
- **The web app is the design reference** — the mobile app must match the website's look and feel

**Web app reference repo (design source of truth):**
- Local path: `/Users/stefankocevski/Documents/my-carmarket-frontend/flare-realm/`
- Frontend code: `flare-realm/client/` (React + Vite + shadcn/ui + Tailwind)
- Live site: `https://www.carmarket365.com` — **always check this for current design**

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

### GraphQL Input Types (exact fields & validation)

**LoginInput:**
- `email` (required) — valid email format
- `password` (required) — minimum 6 characters

**RegisterInput:**
- `email` (required) — valid email format
- `password` (required) — 8-128 characters, must contain: 1 uppercase, 1 lowercase, 1 number
- `name` (optional) — display name
- `dealerName` (optional) — if provided, user gets DEALER role
- `dealerAddress`, `dealerCity`, `dealerPhoneNumber` (optional)

**CreateCarInput (required fields marked with *):**
- `make`*, `model`*, `year`* (1900 to current+1), `price`* (min 0), `mileage`* (min 0)
- `fuelType`*, `transmission`*, `location`* (max 255 chars)
- `vehicleType` (optional, defaults to CAR), `condition` (optional, defaults to USED)
- `description` (optional, max 5000 chars), `vin` (optional, max 17 chars)
- `engineSize`, `horsePower` (min 0), `doors` (2-6), `seats` (1-10)
- `warrantyMonths` (0-120), `previousOwners` (1-10)
- `features`, `safetyFeatures` (max 50 items each)
- `color`, `interiorColor`, `drivetrain`, `contactPhone`, `contactEmail`
- `priceNegotiable`, `quickSale`, `allowTestDrive`, `acceptsTradeIn`
- `latitude`, `longitude`, `city`, `region`, `countryCode`

**UpdateCarInput:** Same as CreateCarInput but ALL fields optional (partial updates)

**CreateCarInquiryInput:**
- `carId`* (UUID), `inquirerName`* (string), `inquirerEmail`* (valid email)
- `inquirerPhone` (optional), `message`* (string)
- `inquiryType`* — GENERAL | TEST_DRIVE | FINANCING | TRADE_IN | PRICE_NEGOTIATION | TECHNICAL_DETAILS | INSPECTION

### Search/Filter Parameters

**CarFilterInput (all optional):**
- `make`, `model`, `vehicleType`, `condition`, `color`, `location`, `countryCode`
- `minYear`/`maxYear`, `minPrice`/`maxPrice`, `minMileage`/`maxMileage`
- `minEngineSize`/`maxEngineSize`, `minHorsePower`/`maxHorsePower`
- `fuelType`, `transmission`, `drivetrain`
- `doors`, `seats`, `maxPreviousOwners`
- `nonSmokingVehicle`, `fullServiceHistory` (boolean filters)
- `isFeatured`, `isCertified`, `allowTestDrive`, `acceptsTradeIn`, `priceNegotiable`, `quickSale`
- `features` (array, max 50 — ALL must match)
- `sellerType` — filters by USER (private) or DEALER

**Default behavior:**
- Sorted by `createdAt DESC` (newest first)
- Only `isAvailable = true` listings shown
- `quickSale = true` listings excluded unless explicitly filtered
- Text filters are case-insensitive
- Location uses partial matching

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
url: string          — Cloudinary URL (primary display)
thumbnailUrl?: string — Optional thumbnail URL
publicId: string     — Cloudinary public_id
isMain: boolean      — marks the primary listing image
isInterior?: boolean — exterior vs interior photo
sortOrder: number    — display order (ascending)
width?: number       — image dimensions
height?: number
fileSize?: number    — bytes
mimeType?: string
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

**Image constraints:**
- Max 50 images per listing
- Ordered by `sortOrder` ascending
- `isMain: true` marks the primary/hero image
- Web app uses 4:3 aspect ratio for car cards, 16:9 for detail gallery
- Show image count badge when listing has multiple images
- Show "New" badge on new condition cars, "Certified" badge on certified cars

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

**JWT details:**
- Token expiry: **90 days**
- Backend extracts from: httpOnly cookie (primary) OR Authorization Bearer header (fallback)
- For the mobile app, use the **Authorization Bearer header** approach (no cookies needed)
- Refresh endpoint exists: `POST /api/auth/refresh-token` (REST, not GraphQL)
- Password reset tokens expire in 1 hour

**Important:** Use `expo-secure-store` for tokens — it uses Keychain (iOS) and EncryptedSharedPreferences (Android). Never use AsyncStorage for auth tokens.

**Password requirements (for registration & password change):**
- 8-128 characters
- Must contain at least 1 uppercase letter
- Must contain at least 1 lowercase letter
- Must contain at least 1 number

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

## 10. TRANSLATIONS / i18n

The web app has a full translation system. The mobile app should replicate it.

**Supported languages (in order of priority):**
1. `mk` — Macedonian (default for North Macedonia)
2. `en` — English
3. `sq` — Albanian

**Web translation files (source of truth):**
- `/Users/stefankocevski/Documents/my-carmarket-frontend/flare-realm/shared/translations/en.ts`
- `/Users/stefankocevski/Documents/my-carmarket-frontend/flare-realm/shared/translations/mk.ts`
- `/Users/stefankocevski/Documents/my-carmarket-frontend/flare-realm/shared/translations/sq.ts`

**Translation structure:** Nested keys like:
```
common.loading, common.error, common.save, common.cancel
header.home, header.search, header.profile
forms.validation.emailInvalid, forms.validation.passwordTooShort
cars.make, cars.model, cars.year, cars.price, cars.mileage
```

**Implementation approach for mobile:**
- Create `src/i18n/` folder with JSON translation files
- Create `useTranslation()` hook (same API as web app)
- Detect language from: user preference (stored) → device locale → default (mk)
- Allow language change in Profile/Settings screen
- Persist language preference to SecureStore and sync to backend (`languagePreference` field)

---

## 11. DISPLAY FORMATTING RULES

**Price:** EUR currency, no decimals, German locale separators
```
€15.000  (not $15,000)
Format: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
```

**Mileage:** Thousands separator, "km" suffix
```
125.000 km
Format: new Intl.NumberFormat('en-US').format(mileage) + ' km'
```

**Engine size:** CC converted to liters
```
1998cc → "2.0L"
```

**Date/time:** Relative format for recent, absolute for old
```
"Just now", "5m ago", "3h ago", "2d ago", then full date
```

---

## 12. ERROR HANDLING

**Error display patterns (match the website):**
- **Toast/snackbar** for transient errors (network timeout, save failed) — auto-dismiss after 3-5 seconds
- **Inline errors** for form validation (red text below the field)
- **Full-screen error state** for fatal errors (no connection, server down) with retry button
- **Empty states** with illustrations for "No results", "No saved cars", etc.

**Apollo Client error handling:**
- Network errors → show "Connection error" toast + retry option
- GraphQL errors → parse error message, show user-friendly toast
- Auth errors (401/UNAUTHENTICATED) → clear token, redirect to login
- Rate limit errors (429) → show "Too many requests, please wait"

---

## 13. ADDITIONAL ENUMS (not in car entity but needed)

**InquiryType** (for creating car inquiries):
```
GENERAL | TEST_DRIVE | FINANCING | TRADE_IN | PRICE_NEGOTIATION | TECHNICAL_DETAILS | INSPECTION
```

**InquiryStatus** (for displaying inquiry state):
```
PENDING | REPLIED | CLOSED | SPAM
```

---

## 14. BACKEND CHANGES NEEDED

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

## 15. ENVIRONMENT VARIABLES

Create a `.env` file (gitignored) with:

```env
# Not strictly needed — API URLs are in src/constants/api.ts
# Add any secrets here if needed in the future
```

No secrets are needed in the mobile app — all sensitive operations go through the backend.

---

## 16. DEVELOPMENT SETUP

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

## 17. CODING CONVENTIONS

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

## 18. DESIGN GUIDELINES

**The website (carmarket365.com) is the design reference. The mobile app must look the same as the website.** Every screen, component, and interaction should match the web app's design as closely as possible, adapted for native mobile patterns.

**How to reference the web design:**
- Visit `https://www.carmarket365.com` to see the live design
- Web frontend source: `/Users/stefankocevski/Documents/my-carmarket-frontend/flare-realm/client/`
- Key web UI files to study:
  - `client/pages/` — all page layouts and screen designs
  - `client/components/` — reusable components (CarCard, filters, forms, etc.)
  - `client/components/ui/` — shadcn/ui base components (buttons, inputs, cards, dialogs)
  - `client/index.css` — Tailwind theme and global styles

**Brand identity (must match exactly):**
- Primary color: `#2563eb` (Blue-600)
- Primary dark: `#1d4ed8` (Blue-700, for pressed states)
- Background: `#ffffff` (white)
- Surface/cards: `#f8fafc` (Slate-50)
- Text: `#0f172a` (Slate-900)
- Secondary text: `#64748b` (Slate-500)
- Borders: `#e2e8f0` (Slate-200)
- Error: `#ef4444` (Red-500)
- Success: `#22c55e` (Green-500)
- Rounded corners on cards and buttons (border-radius: 10-16px)

**UI patterns to replicate from the website:**
- Car cards: thumbnail image, price overlay or below, make/model/year, mileage, fuel type, location
- Car detail page: full-width image gallery, specs grid, description, seller card, action buttons
- Search filters: dropdown selects for make/model, range sliders for price/year, chip toggles for fuel/transmission
- Login/Register: centered card form with email + password fields
- Dashboard: list of user's cars with status badges and action buttons
- Saved cars: same car card layout as search results
- Profile: form fields for user info, toggle switches for preferences
- Dealer badge/logo on dealer listings

**Mobile adaptations (only where native patterns are better):**
- Bottom tab bar instead of top nav menu
- Pull-to-refresh instead of refresh button
- Native share sheet instead of share dialog
- Swipe gestures for image gallery
- Native date/number pickers where appropriate
- Skeleton loading states (not spinners)
- Toast/snackbar for success/error feedback

---

## 19. INSTRUCTIONS FOR AI AGENTS

When working on this project:

1. **Read this dossier first** — it has everything you need
2. **Check the Linear board** — issues CAR-60 to CAR-78 have detailed specs
3. **Visit carmarket365.com FIRST** — the website is the design reference; every screen must match it
4. **Read the web app source** — study `flare-realm/client/pages/` and `flare-realm/client/components/` to understand the exact layout, colors, spacing, and component structure before building the mobile equivalent
5. **Do NOT create a backend** — use the existing GraphQL API
6. **Do NOT modify the backend** — except for Phase 4 push notification changes
7. **Test with Expo Go** — run `npx expo start` and scan QR code
8. **Follow the phase order** — Phase 1 must be complete before Phase 2
9. **Keep types in sync** — if backend schema changes, update `src/types/index.ts`
10. **Use expo-secure-store** for auth tokens, never AsyncStorage
11. **GraphQL queries are already drafted** — in `src/graphql/`, convert to Apollo Client `gql` tag
12. **Reuse components** — `CarCard` should be used in Home, Search, and Saved screens
