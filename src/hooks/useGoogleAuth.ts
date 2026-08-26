import { useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { GoogleSignin, isSuccessResponse, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';
import { useAuth } from '../context/AuthContext';

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';

GoogleSignin.configure({ webClientId });

export function useGoogleAuth() {
  const { socialLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
      .then(() => setIsReady(true))
      .catch(() => setIsReady(true)); // still let the user try; signIn() will surface the real error
  }, []);

  const promptAsync = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) return; // user cancelled

      const { idToken, user } = response.data;
      if (!idToken) {
        Alert.alert('Error', 'Google sign-in did not return an ID token. Please try again.');
        return;
      }

      await socialLogin('google', idToken, user.email, user.name ?? undefined);
    } catch (err: any) {
      const message = isErrorWithCode(err) && err.code === statusCodes.IN_PROGRESS
        ? 'Sign-in is already in progress.'
        : 'Google sign-in failed. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, socialLogin]);

  return {
    promptAsync,
    isLoading,
    isReady,
  };
}
