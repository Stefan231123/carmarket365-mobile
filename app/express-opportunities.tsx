import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../src/context/LanguageContext';
import { COLORS, SPACING, FONT_SIZE } from '../src/constants/theme';
import { CarCard } from '../src/components/CarCard';

const GET_EXPRESS_SALE_OPPORTUNITIES = gql`
  query GetExpressSaleOpportunities {
    getExpressSaleOpportunities {
      id
      make
      model
      variant
      year
      price
      mileage
      fuelType
      transmission
      location
      city
      condition
      vehicleType
      isAvailable
      isFeatured
      isCertified
      createdAt
      images { id url isMain sortOrder }
      seller { id name role dealerName dealerLogoUrl }
    }
  }
`;

export default function ExpressOpportunitiesScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { data, loading, refetch } = useQuery<{ getExpressSaleOpportunities: any[] }>(
    GET_EXPRESS_SALE_OPPORTUNITIES,
    { fetchPolicy: 'cache-and-network' },
  );

  const cars = data?.getExpressSaleOpportunities ?? [];

  return (
    <FlatList
      style={styles.list}
      data={cars}
      keyExtractor={(c) => c.id}
      contentContainerStyle={cars.length === 0 ? styles.grow : styles.content}
      refreshControl={<RefreshControl refreshing={loading && cars.length > 0} onRefresh={() => refetch()} />}
      ListEmptyComponent={
        loading ? (
          <View style={styles.center}><ActivityIndicator color={COLORS.primary} /></View>
        ) : (
          <View style={styles.center}>
            <Ionicons name="flash-outline" size={48} color={COLORS.zinc300} />
            <Text style={styles.emptyText}>{t.dashboard.opportunitiesEmpty}</Text>
          </View>
        )
      }
      renderItem={({ item }) => (
        <CarCard car={item} layout="list" onPress={() => router.push(`/car/${item.id}`)} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: COLORS.white },
  content: { padding: SPACING.md, gap: SPACING.md },
  grow: { flexGrow: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl, gap: SPACING.md, minHeight: 300 },
  emptyText: { color: COLORS.textSecondary, textAlign: 'center', fontSize: FONT_SIZE.md },
});
