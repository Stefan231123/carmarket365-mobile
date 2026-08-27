import { useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
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
    let idToken: string | undefined;
    let email: string | undefined;
    let name: string | undefined;
    try {
      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) return; // user cancelled

      idToken = response.data.idToken ?? undefined;
      email = response.data.user.email;
      name = response.data.user.name ?? undefined;
      if (!idToken) {
        Alert.alert('Error', 'Google sign-in did not return an ID token. Please try again.');
        return;
      }
    } catch {
      Alert.alert('Error', 'Google sign-in failed. Please try again.');
      setIsLoading(false);
      return;
    }

    try {
      await socialLogin('google', idToken, email, name);
    } catch {
      Alert.alert('Error', 'Something went wrong during sign-in. Please try again.');
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
