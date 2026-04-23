// Auth context — manages user session and token storage
// TODO: Implement with expo-secure-store

import React, { createContext, useContext } from 'react';
import { User, AuthTokens } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// TODO: Implement AuthProvider with:
// - expo-secure-store for token persistence
// - Apollo Client for GraphQL mutations
// - Auto-login on app launch
// - Token refresh handling
