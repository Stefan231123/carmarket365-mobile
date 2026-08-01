import { useState, useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import { ApolloProvider } from '@apollo/client/react';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apolloClient } from '../src/graphql/client';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { LanguageProvider, useLanguage } from '../src/context/LanguageContext';
import { COLORS } from '../src/constants/theme';
import { usePushNotifications } from '../src/hooks/usePushNotifications';
import { SplashScreen } from '../src/components/SplashScreen';
import { OnboardingScreen } from '../src/components/OnboardingScreen';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

// Bump the version suffix to re-show onboarding after content changes
const ONBOARDING_KEY = 'carmarket365_onboarding_v1';

function AppContent() {
  usePushNotifications();
  return null;
}

function AppStack() {
  const { t } = useLanguage();
  const { isLoading } = useAuth();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((val) => {
      setOnboardingDone(val === 'true');
    });
  }, []);

  const handleOnboardingComplete = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setOnboardingDone(true);
  }, []);

  if (isLoading || onboardingDone === null) {
    return (
      <>
        <StatusBar style="light" />
        <SplashScreen />
      </>
    );
  }

  if (!onboardingDone) {
    return (
      <>
        <StatusBar style="dark" />
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </>
    );
  }

  return (
    <>
      <AppContent />
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.black },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: COLORS.backgroundMuted },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="car/[id]"
          options={{
            title: t.headers.carDetails,
            headerBackTitle: t.common.back,
          }}
        />
        <Stack.Screen
          name="post-car"
          options={{
            title: t.headers.postACar,
          }}
        />
        <Stack.Screen
          name="my-listings"
          options={{
            title: t.headers.myListings,
          }}
        />
        <Stack.Screen
          name="edit-listing"
          options={{
            title: t.headers.editListing,
          }}
        />
        <Stack.Screen
          name="edit-profile"
          options={{
            title: t.headers.editProfile,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: t.headers.settings,
          }}
        />
        <Stack.Screen
          name="seller/[id]"
          options={{
            title: t.headers.sellerProfile,
          }}
        />
        <Stack.Screen
          name="conversation/[id]"
          options={{
            title: t.headers.conversation,
            headerBackTitle: t.common.back,
          }}
        />
        <Stack.Screen
          name="webview"
          options={{
            title: 'CarMarket365',
            headerBackTitle: t.common.back,
          }}
        />
        <Stack.Screen
          name="dealers"
          options={{
            title: t.headers.dealers,
            headerBackTitle: t.common.back,
          }}
        />
        <Stack.Screen
          name="express-opportunities"
          options={{
            title: t.headers.opportunities,
            headerBackTitle: t.common.back,
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            title: t.headers.signIn,
            presentation: 'modal',
            headerStyle: { backgroundColor: COLORS.white },
            headerTintColor: COLORS.text,
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            title: t.headers.createAccount,
            presentation: 'modal',
            headerStyle: { backgroundColor: COLORS.white },
            headerTintColor: COLORS.text,
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ApolloProvider client={apolloClient}>
        <AuthProvider>
          <LanguageProvider>
            <AppStack />
          </LanguageProvider>
        </AuthProvider>
      </ApolloProvider>
    </ErrorBoundary>
  );
}
