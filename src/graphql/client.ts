import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink, Observable, gql } from '@apollo/client';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { ErrorLink } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/api';

const fetchWithTimeout: typeof fetch = (input, init) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 30000);
  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(id));
};

const httpLink = createHttpLink({
  uri: API_URL,
  fetch: fetchWithTimeout,
});

const authLink = setContext(async (_, { headers }) => {
  const token = await SecureStore.getItemAsync('accessToken');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  };
});

// Auto-logout on UNAUTHENTICATED errors (expired/invalid JWT)
let onAuthError: (() => void) | null = null;
export function setAuthErrorHandler(handler: () => void) {
  onAuthError = handler;
}

let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

function resolvePending() {
  pendingRequests.forEach((cb) => cb());
  pendingRequests = [];
}

async function tryRefreshToken(): Promise<boolean> {
  const [refreshToken, userId] = await Promise.all([
    SecureStore.getItemAsync('refreshToken'),
    SecureStore.getItemAsync('userId'),
  ]);
  if (!refreshToken || !userId) return false;

  try {
    const res = await fetchWithTimeout(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `mutation RefreshToken($userId: String!, $refreshToken: String!) {
          refreshToken(userId: $userId, refreshToken: $refreshToken) { accessToken refreshToken }
        }`,
        variables: { userId, refreshToken },
      }),
    });
    const json = await res.json();
    const data = json?.data?.refreshToken;
    if (data?.accessToken) {
      await SecureStore.setItemAsync('accessToken', data.accessToken);
      if (data.refreshToken) await SecureStore.setItemAsync('refreshToken', data.refreshToken);
      return true;
    }
  } catch { /* refresh failed */ }
  return false;
}

const errorLink = new ErrorLink(({ error, forward, operation }) => {
  if (
    CombinedGraphQLErrors.is(error) &&
    error.errors.some((e) => e.extensions?.code === 'UNAUTHENTICATED')
  ) {
    if (isRefreshing) {
      return new Observable((observer) => {
        pendingRequests.push(() => {
          forward(operation).subscribe(observer);
        });
      });
    }

    isRefreshing = true;
    return new Observable((observer) => {
      tryRefreshToken()
        .then((success) => {
          if (success) {
            resolvePending();
            forward(operation).subscribe(observer);
          } else {
            Promise.all([
              SecureStore.deleteItemAsync('accessToken'),
              SecureStore.deleteItemAsync('refreshToken'),
              SecureStore.deleteItemAsync('userId'),
            ]).then(() => {
              onAuthError?.();
              observer.error(error);
            });
          }
        })
        .finally(() => {
          isRefreshing = false;
        });
    });
  }
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          cars: {
            keyArgs: ['make', 'model', 'fuelType', 'transmission', 'vehicleType', 'condition', 'location'],
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
