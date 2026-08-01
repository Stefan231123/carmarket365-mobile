import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, Stack } from 'expo-router';
import { COLORS } from '../src/constants/theme';

/**
 * Generic in-app browser for content/info/legal pages that live on the website
 * (financing, FAQ, privacy policy, …). Keeps them auto-synced with the site and
 * shown in-app (required for the App/Play stores) rather than kicking out to Safari.
 */
export default function WebViewScreen() {
  const { url, title } = useLocalSearchParams<{ url: string; title?: string }>();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: title || 'CarMarket365' }} />
      <WebView
        source={{ uri: url }}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  webview: { flex: 1, backgroundColor: COLORS.background },
  loading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
});
