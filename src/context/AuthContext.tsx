import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { gql } from '@apollo/client';
import { useMutation, useApolloClient } from '@apollo/client/react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(loginInput: { email: $email, password: $password }) {
      accessToken
      user {
        id
        email
        firstName
        lastName
        name
        role
        avatarUrl
        isEmailVerified
        languagePreference
        dealerName
        dealerStatus
        dealerLogoUrl
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $password: String!, $firstName: String, $lastName: String) {
    register(registerInput: {
      email: $email
      password: $password
      firstName: $firstName
      lastName: $lastName
    }) {
      accessToken
      user {
        id
        email
        firstName
        lastName
        name
        role
        avatarUrl
      }
    }
  }
`;

const ME_QUERY = gql`
  query GetMe {
    me {
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

      if ((data as any)?.me) {
        setUser((data as any).me);
      } else {
        await SecureStore.deleteItemAsync('accessToken');
        setUser(null);
      }
    } catch {
      await SecureStore.deleteItemAsync('accessToken');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await loginMutation({
      variables: { email, password },
    });

    if ((data as any)?.login) {
      await SecureStore.setItemAsync('accessToken', (data as any).login.accessToken);
      setUser((data as any).login.user);
    }
  }, [loginMutation]);

  const register = useCallback(async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ) => {
    const { data } = await registerMutation({
      variables: { email, password, firstName, lastName },
    });

    if ((data as any)?.register) {
      await SecureStore.setItemAsync('accessToken', (data as any).register.accessToken);
      setUser((data as any).register.user);
    }
  }, [registerMutation]);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await client.clearStore();
    setUser(null);
  }, [client]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
