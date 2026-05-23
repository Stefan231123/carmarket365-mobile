import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { gql } from '@apollo/client';
import { useMutation, useApolloClient } from '@apollo/client/react';
import { setAuthErrorHandler } from '../graphql/client';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string, dealerInfo?: { dealerName: string; dealerAddress?: string; dealerCity?: string; dealerPhoneNumber?: string }) => Promise<void>;
  socialLogin: (provider: string, token: string, email: string, name?: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  socialLogin: async () => {},
  forgotPassword: async () => {},
  deleteAccount: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const USER_FIELDS = `
  id
  email
  firstName
  lastName
  name
  phone
  role
  avatarUrl
  isEmailVerified
  languagePreference
  marketingEmailsEnabled
  smsNotificationsEnabled
  dealerName
  dealerStatus
  dealerLogoUrl
  dealerDescription
  dealerAddress
  dealerCity
  dealerRegion
  dealerCountry
  dealerPhoneNumber
  dealerWebsite
  dealerWorkingHours
  dealerServices
  createdAt
`;

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      accessToken
      refreshToken
      user { ${USER_FIELDS} }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $password: String!, $name: String, $dealerName: String, $dealerAddress: String, $dealerCity: String, $dealerPhoneNumber: String) {
    register(input: { email: $email, password: $password, name: $name, dealerName: $dealerName, dealerAddress: $dealerAddress, dealerCity: $dealerCity, dealerPhoneNumber: $dealerPhoneNumber }) {
      accessToken
      refreshToken
      user { ${USER_FIELDS} }
    }
  }
`;

const SOCIAL_LOGIN_MUTATION = gql`
  mutation SocialLogin($provider: String!, $token: String!, $email: String!, $name: String) {
    socialLogin(provider: $provider, token: $token, email: $email, name: $name) {
      accessToken
      refreshToken
      user { ${USER_FIELDS} }
    }
  }
`;

const FORGOT_PASSWORD_MUTATION = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`;

const DELETE_ACCOUNT_MUTATION = gql`
  mutation DeleteMyAccount {
    deleteMyAccount
  }
`;

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      accessToken
      refreshToken
      user { ${USER_FIELDS} }
    }
  }
`;

const ME_QUERY = gql`
  query GetCurrentUser {
    getCurrentUser {
      id
      email
      firstName
      lastName
      name
      phone
      avatarUrl
      role
      isActive
      isEmailVerified
      languagePreference
      countryPreference
      marketingEmailsEnabled
      smsNotificationsEnabled
      dealerName
      dealerStatus
      dealerLogoUrl
      dealerDescription
      dealerAddress
      dealerCity
      dealerRegion
      dealerCountry
      dealerPhoneNumber
      dealerWebsite
      dealerWorkingHours
      dealerServices
      createdAt
    }
  }
`;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const client = useApolloClient();

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);
  const [socialLoginMutation] = useMutation(SOCIAL_LOGIN_MUTATION);
  const [forgotPasswordMutation] = useMutation(FORGOT_PASSWORD_MUTATION);
  const [deleteAccountMutation] = useMutation(DELETE_ACCOUNT_MUTATION);
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);

  const refreshUser = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const { data } = await client.query({
        query: ME_QUERY,
        fetchPolicy: 'network-only',
      });

      if ((data as any)?.getCurrentUser) {
        setUser((data as any).getCurrentUser);
      } else {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('userId');
        setUser(null);
      }
    } catch (err: any) {
      // Only clear tokens on auth errors — keep session alive through network failures
      const isAuthError = err?.graphQLErrors?.some(
        (e: any) => e.extensions?.code === 'UNAUTHENTICATED' || e.extensions?.code === 'FORBIDDEN',
      );
      if (isAuthError) {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('userId');
        setUser(null);
      }
      // On network errors, keep existing user state (stale but better than forced logout)
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Auto-logout when backend returns UNAUTHENTICATED
  useEffect(() => {
    setAuthErrorHandler(() => {
      setUser(null);
      client.clearStore();
    });
  }, [client]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await loginMutation({
      variables: { email, password },
    });

    const result = (data as any)?.login;
    if (result) {
      await SecureStore.setItemAsync('accessToken', result.accessToken);
      if (result.refreshToken) await SecureStore.setItemAsync('refreshToken', result.refreshToken);
      if (result.user?.id) await SecureStore.setItemAsync('userId', result.user.id);
      setUser(result.user);
    }
  }, [loginMutation]);

  const register = useCallback(async (
    email: string,
    password: string,
    name?: string,
    dealerInfo?: { dealerName: string; dealerAddress?: string; dealerCity?: string; dealerPhoneNumber?: string },
  ) => {
    const { data } = await registerMutation({
      variables: {
        email,
        password,
        name: name || undefined,
        dealerName: dealerInfo?.dealerName || undefined,
        dealerAddress: dealerInfo?.dealerAddress || undefined,
        dealerCity: dealerInfo?.dealerCity || undefined,
        dealerPhoneNumber: dealerInfo?.dealerPhoneNumber || undefined,
      },
    });

    const result = (data as any)?.register;
    if (result) {
      await SecureStore.setItemAsync('accessToken', result.accessToken);
      if (result.refreshToken) await SecureStore.setItemAsync('refreshToken', result.refreshToken);
      if (result.user?.id) await SecureStore.setItemAsync('userId', result.user.id);
      setUser(result.user);
    }
  }, [registerMutation]);

  const socialLoginFn = useCallback(async (
    provider: string,
    token: string,
    email: string,
    name?: string,
  ) => {
    const { data } = await socialLoginMutation({
      variables: { provider, token, email, name: name || undefined },
    });

    const result = (data as any)?.socialLogin;
    if (result) {
      await SecureStore.setItemAsync('accessToken', result.accessToken);
      if (result.refreshToken) await SecureStore.setItemAsync('refreshToken', result.refreshToken);
      if (result.user?.id) await SecureStore.setItemAsync('userId', result.user.id);
      setUser(result.user);
    }
  }, [socialLoginMutation]);

  const forgotPasswordFn = useCallback(async (email: string) => {
    await forgotPasswordMutation({ variables: { email } });
  }, [forgotPasswordMutation]);

  const deleteAccountFn = useCallback(async () => {
    await deleteAccountMutation();
    await Promise.all([
      SecureStore.deleteItemAsync('accessToken'),
      SecureStore.deleteItemAsync('refreshToken'),
      SecureStore.deleteItemAsync('userId'),
    ]);
    await client.clearStore();
    setUser(null);
  }, [deleteAccountMutation, client]);

  const logout = useCallback(async () => {
    try { await logoutMutation(); } catch { /* clear locally regardless */ }
    await Promise.all([
      SecureStore.deleteItemAsync('accessToken'),
      SecureStore.deleteItemAsync('refreshToken'),
      SecureStore.deleteItemAsync('userId'),
    ]);
    await client.clearStore();
    setUser(null);
  }, [client, logoutMutation]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        socialLogin: socialLoginFn,
        forgotPassword: forgotPasswordFn,
        deleteAccount: deleteAccountFn,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
