import { useEffect, useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '../context/AuthContext';

/**
 * Sign in with Apple -- required alongside Google Sign-In per App Store
 * guideline 4.8 (any app offering third-party login must offer an
 * equivalent privacy-preserving option). iOS only; Android has no such
 * requirement and Apple's own SDK doesn't support it there.
 */
export function useAppleAuth() {
  const { socialLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    AppleAuthentication.isAvailableAsync().then(setIsAvailable).catch(() => setIsAvailable(false));
  }, []);

  const promptAsync = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    let identityToken: string | undefined;
    let email: string | undefined;
    let name: string | undefined;
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      identityToken = credential.identityToken ?? undefined;
      email = credential.email ?? undefined;
      // Only provided on the user's first sign-in; the backend independently
      // re-derives the authoritative email from the verified token either way.
      name = credential.fullName
        ? [credential.fullName.givenName, credential.fullName.familyName].filter(Boolean).join(' ') || undefined
        : undefined;

      if (!identityToken) {
        Alert.alert('Error', 'Apple sign-in did not return an identity token. Please try again.');
        setIsLoading(false);
        return;
      }
    } catch (err: any) {
      if (err?.code === 'ERR_REQUEST_CANCELED') { setIsLoading(false); return; } // user cancelled
      Alert.alert('Error', 'Apple sign-in failed. Please try again.');
      setIsLoading(false);
      return;
    }

    try {
      await socialLogin('apple', identityToken, email ?? '', name);
    } catch {
      Alert.alert('Error', 'Something went wrong during sign-in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, socialLogin]);

  return {
    promptAsync,
    isLoading,
    isReady: isAvailable,
  };
}
