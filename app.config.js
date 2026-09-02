export default {
  expo: {
    name: 'CarMarket365',
    slug: 'carmarket365-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    scheme: 'carmarket365',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      // Different from the Android package (com.carmarket.app) -- that exact
      // identifier is already claimed by an unrelated Apple Developer account
      // in Apple's globally-unique App ID namespace, so a different one was
      // needed here. They don't need to match across platforms.
      bundleIdentifier: 'com.carmarket365.app',
      infoPlist: {
        // Only standard HTTPS/TLS is used (API calls, auth) -- exempt from US
        // export compliance documentation requirements.
        ITSAppUsesNonExemptEncryption: false,
        // Override the generic default injected by expo-secure-store's plugin
        // with a specific, user-facing purpose string per Apple guideline 5.1.1.
        NSFaceIDUsageDescription:
          'CarMarket365 uses Face ID so you can quickly and securely sign back in to your account without re-entering your password.',
      },
      associatedDomains: [
        'applinks:carmarket365.com',
        'applinks:www.carmarket365.com',
      ],
      privacyManifests: {
        NSPrivacyAccessedAPITypes: [
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults',
            NSPrivacyAccessedAPITypeReasons: ['CA92.1'],
          },
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryFileTimestamp',
            NSPrivacyAccessedAPITypeReasons: ['C617.1'],
          },
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategorySystemBootTime',
            NSPrivacyAccessedAPITypeReasons: ['35F9.1'],
          },
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryDiskSpace',
            NSPrivacyAccessedAPITypeReasons: ['E174.1'],
          },
        ],
        NSPrivacyCollectedDataTypes: [
          {
            NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypePreciseLocation',
            NSPrivacyCollectedDataTypeLinked: true,
            NSPrivacyCollectedDataTypeTracking: false,
            NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAppFunctionality'],
          },
          {
            NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypeEmailAddress',
            NSPrivacyCollectedDataTypeLinked: true,
            NSPrivacyCollectedDataTypeTracking: false,
            NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAppFunctionality'],
          },
          {
            NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypePhoneNumber',
            NSPrivacyCollectedDataTypeLinked: true,
            NSPrivacyCollectedDataTypeTracking: false,
            NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAppFunctionality'],
          },
          {
            NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypeName',
            NSPrivacyCollectedDataTypeLinked: true,
            NSPrivacyCollectedDataTypeTracking: false,
            NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAppFunctionality'],
          },
          {
            NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypePhotosOrVideos',
            NSPrivacyCollectedDataTypeLinked: true,
            NSPrivacyCollectedDataTypeTracking: false,
            NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAppFunctionality'],
          },
        ],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      package: 'com.carmarket.app',
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'carmarket365.com',
              pathPrefix: '/cars',
            },
            {
              scheme: 'https',
              host: 'www.carmarket365.com',
              pathPrefix: '/cars',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      eas: {
        projectId: 'd8498957-26c2-4f54-b10c-426e983a89ba',
      },
    },
    plugins: [
      'expo-router',
      'expo-secure-store',
      [
        'expo-notifications',
        {
          icon: './assets/icon.png',
          color: '#2563eb',
        },
      ],
      [
        'expo-location',
        {
          // "When in use" only -- the app never uses background location.
          locationWhenInUsePermission:
            'CarMarket365 uses your location to show cars listed near you and to auto-fill your city when you post a listing.',
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission:
            'CarMarket365 needs access to your photos so you can attach car images to your listing and set a profile picture.',
          cameraPermission:
            'CarMarket365 needs access to your camera so you can take photos of your car to attach to a listing.',
          // Explicit disable -- the app never records audio.
          microphonePermission: false,
        },
      ],
      [
        '@react-native-google-signin/google-signin',
        {
          // Reversed iOS client ID (com.googleusercontent.apps.XXXX) from Google Cloud.
          // The plugin requires a non-empty value even when only building Android;
          // falls back to a placeholder until a real iOS OAuth client is set up.
          iosUrlScheme: process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME || 'com.googleusercontent.apps.placeholder',
        },
      ],
      'expo-apple-authentication',
    ],
  },
};
