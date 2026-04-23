import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../src/constants/theme';
import { formatPrice, formatMileage, formatEnum } from '../../src/utils/formatters';
import { Car } from '../../src/types';

const GET_FEATURED_CARS = gql`
  query GetFeaturedCars {
    cars(limit: 20, isFeatured: true) {
      cars {
        id
        make
        model
        year
        price
        mileage
        fuelType
        transmission
        location
        condition
        isAvailable
        isFeatured
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
      total
    }
  }
`;

const GET_RECENT_CARS = gql`
  query GetRecentCars {
    cars(limit: 20) {
      cars {
        id
        make
        model
        year
        price
        mileage
        fuelType
        transmission
        location
        condition
        isAvailable
        isFeatured
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
      total
    }
  }
`;

function getMainImage(images: Car['images']): string | null {
  if (!images || images.length === 0) return null;
  const main = images.find((img) => img.isMain);
  return main?.url || images[0]?.url || null;
}

function CarCard({ car, onPress }: { car: Car; onPress: () => void }) {
  const imageUrl = getMainImage(car.images);
  const isDealer = car.seller?.role === 'DEALER';

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={[styles.cardImage, styles.noImage]}>
            <Text style={styles.noImageText}>No Image</Text>
          </View>
        )}
        {car.images?.length > 1 && (
          <View style={styles.imageCountBadge}>
            <Text style={styles.imageCountText}>{car.images.length}</Text>
          </View>
        )}
        {car.condition === 'NEW' && (
          <View style={[styles.conditionBadge, { backgroundColor: COLORS.success }]}>
            <Text style={styles.conditionText}>New</Text>
          </View>
        )}
        {car.condition === 'CERTIFIED' && (
          <View style={[styles.conditionBadge, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.conditionText}>Certified</Text>
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardPrice}>{formatPrice(car.price)}</Text>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {car.make} {car.model} {car.year}
        </Text>
        <View style={styles.cardSpecs}>
          <Text style={styles.specText}>{formatMileage(car.mileage)}</Text>
          <Text style={styles.specDot}>&middot;</Text>
          <Text style={styles.specText}>{formatEnum(car.fuelType)}</Text>
          <Text style={styles.specDot}>&middot;</Text>
          <Text style={styles.specText}>{formatEnum(car.transmission)}</Text>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.locationText} numberOfLines={1}>{car.location}</Text>
          {isDealer && (
            <View style={styles.dealerBadge}>
              <Text style={styles.dealerBadgeText}>Dealer</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { data: featuredData, loading: featuredLoading } = useQuery(GET_FEATURED_CARS);
  const { data: recentData, loading: recentLoading, refetch } = useQuery(GET_RECENT_CARS);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const featuredCars = (featuredData as any)?.cars?.cars || [];
  const recentCars = (recentData as any)?.cars?.cars || [];
  const isLoading = featuredLoading && recentLoading;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={recentCars}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
      ListHeaderComponent={
        <>
          {featuredCars.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Featured</Text>
              <FlatList
                data={featuredCars}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredList}
                renderItem={({ item }) => (
                  <View style={styles.featuredCardWrapper}>
                    <CarCard car={item} onPress={() => router.push(`/car/${item.id}`)} />
                  </View>
                )}
              />
            </View>
          )}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Listings</Text>
          </View>
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.gridItem}>
          <CarCard car={item} onPress={() => router.push(`/car/${item.id}`)} />
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No listings available yet</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  row: {
    paddingHorizontal: SPACING.sm,
    gap: SPACING.sm,
  },
  section: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  featuredList: {
    paddingRight: SPACING.md,
    gap: SPACING.sm,
  },
  featuredCardWrapper: {
    width: 280,
  },
  gridItem: {
    flex: 1,
    maxWidth: '50%',
    paddingBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  noImage: {
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
  },
  imageCountBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  imageCountText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  conditionBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  conditionText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  cardContent: {
    padding: SPACING.sm,
  },
  cardPrice: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  cardTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },
  cardSpecs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  specText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  specDot: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginHorizontal: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  locationText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    flex: 1,
  },
  dealerBadge: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dealerBadgeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted,
  },
});
