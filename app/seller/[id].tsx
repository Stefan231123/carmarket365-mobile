import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, Image, ActivityIndicator, Pressable, RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../src/constants/theme';
import { CarCard } from '../../src/components/CarCard';
import { useLanguage } from '../../src/context/LanguageContext';
import { useSavedCarIds, useToggleSave } from '../../src/hooks/useSaveCar';
import { LOCALE_MAP } from '../../src/i18n';

const GET_SELLER_LISTINGS = gql`
  query GetSellerListings($filters: CarFilterInput) {
    getCars(filters: $filters) {
      id make model variant year price mileage
      fuelType transmission condition location city
      vehicleType isAvailable isFeatured isCertified
      features safetyFeatures createdAt
      images { id url isMain sortOrder }
      seller {
        id name role
        dealerName dealerLogoUrl dealerStatus
        dealerDescription dealerAddress dealerCity dealerRegion
        dealerPhoneNumber dealerWebsite dealerServices
        createdAt
      }
    }
  }
`;

export default function SellerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, language } = useLanguage();
  const locale = LOCALE_MAP[language];
  const { data, loading, error, refetch } = useQuery(GET_SELLER_LISTINGS, {
    variables: { filters: { sellerId: id } },
    skip: !id,
  });
  const { savedIds } = useSavedCarIds();
  const { toggleSave } = useToggleSave();
  const [refreshing, setRefreshing] = useState(false);

  const cars = (data as any)?.getCars || [];
  const seller = cars[0]?.seller;
  const isDealer = seller?.role === 'DEALER';

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={48} color={COLORS.zinc400} />
        <Text style={styles.emptyText}>{t.common.error}</Text>
      </View>
    );
  }

  if (!loading && cars.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="car-outline" size={48} color={COLORS.zinc400} />
        <Text style={styles.emptyText}>{t.sellerProfile.noListings}</Text>
      </View>
    );
  }

  const memberDate = seller?.createdAt
    ? new Date(seller.createdAt).toLocaleDateString(locale, { year: 'numeric', month: 'long' })
    : '';

  return (
    <FlatList
      data={cars}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.listContent}
      style={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      ListHeaderComponent={
        <View style={styles.header}>
          {/* Seller Info Card */}
          {seller && (
          <View style={styles.sellerCard}>
            <View style={styles.sellerHeader}>
              {seller?.dealerLogoUrl || seller?.avatarUrl ? (
                <Image
                  source={{ uri: seller.dealerLogoUrl || seller.avatarUrl }}
                  style={styles.sellerAvatar}
                />
              ) : (
                <View style={[styles.sellerAvatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={24} color={COLORS.white} />
                </View>
              )}
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerName}>
                  {isDealer ? seller.dealerName : seller?.name || t.sellerProfile.privateSeller}
                </Text>
                {isDealer && seller?.dealerStatus === 'APPROVED' && (
                  <View style={styles.dealerBadge}>
                    <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                    <Text style={styles.dealerBadgeText}>{t.carDetail.verifiedDealer}</Text>
                  </View>
                )}
                {!isDealer && (
                  <Text style={styles.sellerType}>{t.sellerProfile.privateSeller}</Text>
                )}
                {memberDate ? (
                  <Text style={styles.memberSince}>
                    {t.sellerProfile.memberSince.replace('{date}', memberDate)}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Dealer details */}
            {isDealer && (
              <View style={styles.dealerDetails}>
                {(seller.dealerAddress || seller.dealerCity) && (
                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={16} color={COLORS.textMuted} />
                    <Text style={styles.detailText}>
                      {[seller.dealerAddress, seller.dealerCity, seller.dealerRegion].filter(Boolean).join(', ')}
                    </Text>
                  </View>
                )}
                {seller.dealerPhoneNumber && (
                  <View style={styles.detailRow}>
                    <Ionicons name="call-outline" size={16} color={COLORS.textMuted} />
                    <Text style={styles.detailText}>{seller.dealerPhoneNumber}</Text>
                  </View>
                )}
                {seller.dealerWebsite && (
                  <View style={styles.detailRow}>
                    <Ionicons name="globe-outline" size={16} color={COLORS.textMuted} />
                    <Text style={styles.detailText}>{seller.dealerWebsite}</Text>
                  </View>
                )}
                {seller.dealerDescription && (
                  <Text style={styles.dealerDesc} numberOfLines={3}>{seller.dealerDescription}</Text>
                )}
                {seller.dealerServices?.length > 0 && (
                  <View style={styles.servicesWrap}>
                    {seller.dealerServices.map((s: string) => (
                      <View key={s} style={styles.serviceChip}>
                        <Text style={styles.serviceChipText}>{s}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
          )}

          {/* Listings header */}
          <View style={styles.listingsHeader}>
            <Text style={styles.listingsTitle}>{t.sellerProfile.allListings}</Text>
            <Text style={styles.listingsCount}>
              {t.sellerProfile.listingsCount.replace('{count}', String(cars.length))}
            </Text>
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.gridItem}>
          <CarCard
            car={item}
            onPress={() => router.push(`/car/${item.id}`)}
            isSaved={savedIds.includes(item.id)}
            onToggleSave={() => toggleSave(item.id)}
          />
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.centered}>
          <Ionicons name="car-outline" size={48} color={COLORS.zinc400} />
          <Text style={styles.emptyText}>{t.sellerProfile.noListings}</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: COLORS.backgroundMuted },
  centered: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingVertical: SPACING.xxl, gap: SPACING.sm,
  },
  listContent: { paddingBottom: SPACING.xxl },
  header: { gap: SPACING.md, paddingTop: SPACING.md },

  sellerCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    borderWidth: 1,
    borderColor: COLORS.borderZinc,
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  sellerAvatar: {
    width: 64, height: 64, borderRadius: BORDER_RADIUS.full,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  sellerInfo: { flex: 1 },
  sellerName: {
    fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.text,
  },
  sellerType: {
    fontSize: FONT_SIZE.sm, color: COLORS.textMuted, marginTop: 2,
  },
  dealerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4,
  },
  dealerBadgeText: {
    fontSize: FONT_SIZE.xs, color: COLORS.success, fontWeight: '500',
  },
  memberSince: {
    fontSize: FONT_SIZE.xs, color: COLORS.textMuted, marginTop: 4,
  },

  dealerDetails: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.borderZinc,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
  },
  detailText: {
    flex: 1, fontSize: FONT_SIZE.sm, color: COLORS.text, lineHeight: 20,
  },
  dealerDesc: {
    fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, lineHeight: 20,
  },
  servicesWrap: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4,
  },
  serviceChip: {
    backgroundColor: COLORS.zinc100,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  serviceChipText: {
    fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, fontWeight: '500',
  },

  listingsHeader: {
    paddingHorizontal: SPACING.md,
  },
  listingsTitle: {
    fontSize: FONT_SIZE.xl, fontWeight: '600', color: COLORS.text,
  },
  listingsCount: {
    fontSize: FONT_SIZE.sm, color: COLORS.textMuted, marginTop: 2,
  },

  row: { paddingHorizontal: SPACING.md, gap: SPACING.sm },
  gridItem: { flex: 1, maxWidth: '50%', paddingBottom: SPACING.sm },
  emptyText: { fontSize: FONT_SIZE.md, color: COLORS.textMuted },
});
