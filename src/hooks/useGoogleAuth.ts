import { useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../context/AuthContext';

// Complete any pending auth sessions on app load
WebBrowser.maybeCompleteAuthSession();

// Google OAuth Client IDs — read from env vars, fall back to web client ID
const GOOGLE_CONFIG = {
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
};

export function useGoogleAuth() {
  const { socialLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_CONFIG.webClientId,
    iosClientId: GOOGLE_CONFIG.iosClientId,
    androidClientId: GOOGLE_CONFIG.androidClientId,
  });

  const handleGoogleResponse = useCallback(async () => {
    if (response?.type !== 'success') return;

    setIsLoading(true);
    try {
      const { authentication } = response;

      // Only send ID tokens to the backend — access tokens cannot be verified server-side
      if (!authentication?.idToken) {
        Alert.alert('Error', 'Google sign-in did not return an ID token. Please try again.');
        return;
      }

      // Fetch user info from Google for display name / email
      const userInfoResponse = await fetch(
        'https://www.googleapis.com/userinfo/v2/me',
        { headers: { Authorization: `Bearer ${authentication.accessToken}` } },
      );
      const userInfo = await userInfoResponse.json();

      await socialLogin(
        'google',
        authentication.idToken,
        userInfo.email,
        userInfo.name,
      );
    } catch (err: any) {
      const message = err?.message?.includes('credentials')
        ? 'Google sign-in failed. Please try again.'
        : 'Something went wrong during sign-in. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  }, [response, socialLogin]);

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleResponse();
    }
  }, [response, handleGoogleResponse]);

  return {
    promptAsync,
    isLoading,
    isReady: !!request,
  };
}
