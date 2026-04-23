import { Stack } from 'expo-router';
import { ApolloProvider } from '@apollo/client/react';
import { StatusBar } from 'expo-status-bar';
import { apolloClient } from '../src/graphql/client';
import { AuthProvider } from '../src/context/AuthContext';
import { COLORS } from '../src/constants/theme';

export default function RootLayout() {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: COLORS.white },
            headerTintColor: COLORS.text,
            headerTitleStyle: { fontWeight: '600' },
            contentStyle: { backgroundColor: COLORS.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="car/[id]"
            options={{
              title: 'Car Details',
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen
            name="login"
            options={{
              title: 'Log In',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="register"
            options={{
              title: 'Create Account',
              presentation: 'modal',
            }}
          />
        </Stack>
      </AuthProvider>
    </ApolloProvider>
  );
}
