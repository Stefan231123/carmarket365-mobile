import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../src/constants/theme';
import { CarCard } from '../../src/components/CarCard';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../src/context/LanguageContext';
import { useToggleSave } from '../../src/hooks/useSaveCar';

const GET_SAVED_CARS = gql`
  query GetSavedCars {
    getUserSavedCars {
      id
      car {
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
        features
        safetyFeatures
        createdAt
        images {
          id
          url
          isMain
          sortOrder
        }
        seller {
          id
          name
          role
          dealerName
          dealerLogoUrl
        }
      }
    }
  }
`;

export default function SavedScreen() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons name="heart-outline" size={48} color={COLORS.zinc400} />
        </View>
        <Text style={styles.title}>{t.saved.title}</Text>
        <Text style={styles.subtitle}>{t.saved.loginPrompt}</Text>
        <Pressable style={styles.button} onPress={() => router.push('/login')}>
          <Text style={styles.buttonText}>{t.common.signIn}</Text>
        </Pressable>
      </View>
    );
  }

  return <SavedCarsList />;
}

function SavedCarsList() {
  const router = useRouter();
  const { t } = useLanguage();
  const { data, loading, error, refetch } = useQuery(GET_SAVED_CARS, { fetchPolicy: 'cache-and-network' });
  const { toggleSave } = useToggleSave();
  const [refreshing, setRefreshing] = React.useState(false);

  const savedCars = (data as any)?.getUserSavedCars || [];
  const cars = savedCars.map((s: any) => s.car).filter(Boolean);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading && cars.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error && cars.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons name="cloud-offline-outline" size={48} color={COLORS.zinc400} />
        </View>
        <Text style={styles.emptyText}>{t.common.error}</Text>
        <Pressable style={styles.browseButton} onPress={() => refetch()}>
          <Text style={styles.browseButtonText}>{t.common.retry}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={cars}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.listContent}
      style={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      renderItem={({ item }) => (
        <View style={styles.gridItem}>
          <CarCard
            car={item}
            onPress={() => router.push(`/car/${item.id}`)}
            isSaved={true}
            onToggleSave={() => toggleSave(item.id)}
          />
        </View>
      )}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t.saved.title}</Text>
          <Text style={styles.headerCount}>{t.saved.carsCount.replace('{count}', String(cars.length))}</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="heart-outline" size={48} color={COLORS.zinc400} />
          </View>
          <Text style={styles.emptyText}>{t.saved.noSavedCars}</Text>
          <Text style={styles.emptySubText}>{t.saved.tapHeartHint}</Text>
          <Pressable style={styles.browseButton} onPress={() => router.push('/(tabs)/search')}>
            <Text style={styles.browseButtonText}>{t.saved.browseCars}</Text>
          </Pressable>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundMuted,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '500',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.black,
    borderRadius: BORDER_RADIUS.full,
    height: 48,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
  },
  list: {
    flex: 1,
    backgroundColor: COLORS.backgroundMuted,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '500',
    color: COLORS.text,
  },
  headerCount: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  row: { paddingHorizontal: SPACING.md, gap: SPACING.sm },
  listContent: { paddingBottom: SPACING.xl },
  gridItem: { flex: 1, maxWidth: '50%', paddingBottom: SPACING.sm },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    gap: SPACING.sm,
  },
  emptyIcon: {
    backgroundColor: COLORS.zinc100,
    borderRadius: BORDER_RADIUS.full,
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  emptyText: { fontSize: FONT_SIZE.md, color: COLORS.textMuted, fontWeight: '600' },
  emptySubText: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted, textAlign: 'center' },
  browseButton: {
    backgroundColor: COLORS.black,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.lg,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  browseButtonText: { color: COLORS.white, fontSize: FONT_SIZE.sm, fontWeight: '500' },
});
