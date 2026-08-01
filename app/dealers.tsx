import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../src/context/LanguageContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../src/constants/theme';

const GET_APPROVED_DEALERS = gql`
  query GetApprovedDealers {
    getApprovedDealers {
      id
      dealerName
      firstName
      lastName
      dealerCity
      dealerCountry
      dealerLogoUrl
      dealerServices
    }
  }
`;

interface Dealer {
  id: string;
  dealerName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  dealerCity?: string | null;
  dealerCountry?: string | null;
  dealerLogoUrl?: string | null;
  dealerServices?: string[] | null;
}

function displayName(d: Dealer): string {
  return d.dealerName || `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'Dealer';
}

export default function DealersScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { data, loading, refetch } = useQuery<{ getApprovedDealers: Dealer[] }>(GET_APPROVED_DEALERS, {
    fetchPolicy: 'cache-and-network',
  });

  const dealers = data?.getApprovedDealers ?? [];

  return (
    <FlatList
      style={styles.list}
      data={dealers}
      keyExtractor={(d) => d.id}
      contentContainerStyle={dealers.length === 0 ? styles.grow : undefined}
      refreshControl={<RefreshControl refreshing={loading && dealers.length > 0} onRefresh={() => refetch()} />}
      ListEmptyComponent={
        loading ? (
          <View style={styles.center}><ActivityIndicator color={COLORS.primary} /></View>
        ) : (
          <View style={styles.center}>
            <Ionicons name="business-outline" size={48} color={COLORS.zinc300} />
            <Text style={styles.emptyText}>{t.more.dealersEmpty}</Text>
          </View>
        )
      }
      renderItem={({ item }) => {
        const location = [item.dealerCity, item.dealerCountry].filter(Boolean).join(', ');
        return (
          <Pressable style={styles.card} onPress={() => router.push(`/seller/${item.id}`)}>
            <View style={styles.logo}>
              {item.dealerLogoUrl ? (
                <Image source={{ uri: item.dealerLogoUrl }} style={styles.logoImg} />
              ) : (
                <Ionicons name="business" size={24} color={COLORS.textMuted} />
              )}
            </View>
            <View style={styles.body}>
              <Text style={styles.name} numberOfLines={1}>{displayName(item)}</Text>
              {!!location && (
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={13} color={COLORS.textMuted} />
                  <Text style={styles.location} numberOfLines={1}>{location}</Text>
                </View>
              )}
              {!!item.dealerServices?.length && (
                <Text style={styles.services} numberOfLines={1}>{item.dealerServices.slice(0, 3).join(' · ')}</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.zinc400} />
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: COLORS.background },
  grow: { flexGrow: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl, gap: SPACING.md, minHeight: 300 },
  emptyText: { color: COLORS.textSecondary, textAlign: 'center', fontSize: FONT_SIZE.md },
  card: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, marginHorizontal: SPACING.md, marginTop: SPACING.md, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.borderZinc },
  logo: { width: 52, height: 52, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.zinc100, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  logoImg: { width: 52, height: 52, resizeMode: 'cover' },
  body: { flex: 1, gap: 3 },
  name: { fontWeight: '700', fontSize: FONT_SIZE.md, color: COLORS.text },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  location: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, flex: 1 },
  services: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
});
