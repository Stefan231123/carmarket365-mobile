import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator, RefreshControl, Alert, Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../src/constants/theme';
import { formatPrice, formatMileage, formatTimeAgo, translateEnum } from '../src/utils/formatters';
import { useLanguage } from '../src/context/LanguageContext';
import { LOCALE_MAP } from '../src/i18n';

const GET_MY_LISTINGS = gql`
  query GetMyListings {
    getMyListings {
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
      viewCount
      favoriteCount
      createdAt
      soldAt
      expiresAt
      images {
        id
        url
        isMain
        sortOrder
      }
    }
  }
`;

const DELETE_CAR = gql`
  mutation DeleteCar($id: String!) {
    deleteCar(id: $id)
  }
`;

const RENEW_LISTING = gql`
  mutation RenewListing($carId: String!) {
    renewListing(carId: $carId) {
      id
      expiresAt
    }
  }
`;

const UPDATE_CAR = gql`
  mutation UpdateCar($id: String!, $input: UpdateCarInput!) {
    updateCar(id: $id, input: $input) {
      id
      isAvailable
      soldAt
    }
  }
`;

function getMainImage(images: any[]): string | null {
  if (!images || images.length === 0) return null;
  const main = images.find((img: any) => img.isMain);
  return main?.url || images[0]?.url || null;
}

export default function MyListingsScreen() {
  const router = useRouter();
  const { renew } = useLocalSearchParams<{ renew?: string }>();
  const { t, language } = useLanguage();
  const locale = LOCALE_MAP[language];
  const { data, loading, error, refetch } = useQuery(GET_MY_LISTINGS, { fetchPolicy: 'cache-and-network' });
  const [deleteCar] = useMutation(DELETE_CAR);
  const [updateCar] = useMutation(UPDATE_CAR);
  const [renewListing] = useMutation(RENEW_LISTING);
  const [refreshing, setRefreshing] = useState(false);

  const listings = (data as any)?.getMyListings || [];

  useEffect(() => {
    if (renew && listings.length > 0) {
      const car = listings.find((c: any) => c.id === renew);
      if (car) {
        handleRenew(renew, `${car.year} ${car.make} ${car.model}`);
      }
    }
  }, [renew, listings.length]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      t.myListings.deleteListing,
      t.myListings.deleteConfirm.replace('{title}', title),
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCar({ variables: { id } });
              await refetch();
            } catch (err: any) {
              Alert.alert(t.common.error, err?.message || t.auth.somethingWentWrong);
            }
          },
        },
      ],
    );
  };

  const handleMarkSold = (id: string) => {
    Alert.alert(t.myListings.markAsSold, t.myListings.markAsSoldConfirm, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.myListings.markAsSold,
        onPress: async () => {
          try {
            await updateCar({ variables: { id, input: { isAvailable: false } } });
            await refetch();
          } catch (err: any) {
            Alert.alert(t.common.error, err?.message || t.auth.somethingWentWrong);
          }
        },
      },
    ]);
  };

  const handleRenew = (id: string, title: string) => {
    Alert.alert(
      t.myListings.renewListing,
      t.myListings.renewConfirm.replace('{title}', title),
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.myListings.renew,
          onPress: async () => {
            try {
              await renewListing({ variables: { carId: id } });
              await refetch();
              Alert.alert(t.myListings.renewListing, t.myListings.renewSuccess);
            } catch (err: any) {
              Alert.alert(t.common.error, err?.message || t.auth.somethingWentWrong);
            }
          },
        },
      ],
    );
  };

  const handleReactivate = async (id: string) => {
    try {
      await updateCar({ variables: { id, input: { isAvailable: true } } });
      await refetch();
    } catch (err: any) {
      Alert.alert(t.common.error, err?.message || t.auth.somethingWentWrong);
    }
  };

  if (loading && listings.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error && listings.length === 0) {
    return (
      <View style={styles.centered}>
        <View style={styles.emptyIcon}>
          <Ionicons name="cloud-offline-outline" size={48} color={COLORS.zinc400} />
        </View>
        <Text style={styles.emptyText}>{t.common.error}</Text>
        <Pressable style={styles.postButton} onPress={() => refetch()}>
          <Text style={styles.postButtonText}>{t.common.retry}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={listings}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      style={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      renderItem={({ item }) => {
        const imageUrl = getMainImage(item.images);
        const isSold = !item.isAvailable || !!item.soldAt;
        const title = `${item.year} ${item.make} ${item.model}`;
        const daysLeft = item.expiresAt
          ? Math.max(0, Math.ceil((new Date(item.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          : null;
        const isExpiringSoon = daysLeft !== null && daysLeft <= 3;

        return (
          <Pressable style={styles.card} onPress={() => router.push(`/car/${item.id}`)}>
            <View style={styles.cardRow}>
              <View style={styles.imageContainer}>
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.cardImage, styles.noImage]}>
                    <Ionicons name="image-outline" size={24} color={COLORS.zinc400} />
                  </View>
                )}
                {isSold && (
                  <View style={styles.soldOverlay}>
                    <Text style={styles.soldText}>{t.myListings.sold}</Text>
                  </View>
                )}
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
                <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
                <Text style={styles.cardSubtitle}>
                  {formatMileage(item.mileage, locale)} &middot; {translateEnum('fuelTypes', item.fuelType, t.enums)}
                </Text>
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Ionicons name="eye-outline" size={14} color={COLORS.textMuted} />
                    <Text style={styles.statText}>{item.viewCount}</Text>
                  </View>
                  <View style={styles.stat}>
                    <Ionicons name="heart-outline" size={14} color={COLORS.textMuted} />
                    <Text style={styles.statText}>{item.favoriteCount}</Text>
                  </View>
                  <Text style={styles.timeAgo}>{formatTimeAgo(item.createdAt, t.formatters)}</Text>
                </View>
                {!isSold && daysLeft !== null && (
                  <View style={[styles.expiryRow, isExpiringSoon && styles.expiryRowUrgent]}>
                    <Ionicons name="time-outline" size={12} color={isExpiringSoon ? COLORS.error : COLORS.textMuted} />
                    <Text style={[styles.expiryText, isExpiringSoon && styles.expiryTextUrgent]}>
                      {daysLeft === 0
                        ? t.myListings.expiresToday
                        : t.myListings.expiresInDays.replace('{days}', String(daysLeft))}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.actions}>
              {!isSold ? (
                <>
                  <Pressable style={styles.actionButton} onPress={() => router.push(`/edit-listing?id=${item.id}`)}>
                    <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                    <Text style={[styles.actionText, { color: COLORS.primary }]}>{t.common.edit}</Text>
                  </Pressable>
                  <Pressable style={styles.actionButton} onPress={() => handleRenew(item.id, title)}>
                    <Ionicons name="refresh-outline" size={16} color={isExpiringSoon ? COLORS.error : COLORS.success} />
                    <Text style={[styles.actionText, { color: isExpiringSoon ? COLORS.error : COLORS.success }]}>{t.myListings.renew}</Text>
                  </Pressable>
                  <Pressable style={styles.actionButton} onPress={() => handleDelete(item.id, title)}>
                    <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                    <Text style={[styles.actionText, { color: COLORS.error }]}>{t.common.delete}</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable style={styles.actionButton} onPress={() => handleReactivate(item.id)}>
                    <Ionicons name="refresh-outline" size={16} color={COLORS.text} />
                    <Text style={styles.actionText}>{t.myListings.reactivate}</Text>
                  </Pressable>
                  <Pressable style={styles.actionButton} onPress={() => handleDelete(item.id, title)}>
                    <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                    <Text style={[styles.actionText, { color: COLORS.error }]}>{t.common.delete}</Text>
                  </Pressable>
                </>
              )}
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <View style={styles.centered}>
          <View style={styles.emptyIcon}>
            <Ionicons name="car-outline" size={48} color={COLORS.zinc400} />
          </View>
          <Text style={styles.emptyText}>{t.myListings.noListings}</Text>
          <Text style={styles.emptySubText}>{t.myListings.postFirst}</Text>
          <Pressable style={styles.postButton} onPress={() => router.push('/post-car')}>
            <Text style={styles.postButtonText}>{t.myListings.postACar}</Text>
          </Pressable>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: COLORS.backgroundMuted },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.xxl, gap: SPACING.sm },
  listContent: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  card: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS['2xl'], overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.borderZinc, marginBottom: SPACING.md,
  },
  cardRow: { flexDirection: 'row' },
  imageContainer: { position: 'relative', width: 120 },
  cardImage: { width: 120, height: 90 },
  noImage: { backgroundColor: COLORS.zinc100, justifyContent: 'center', alignItems: 'center' },
  soldOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  soldText: { color: COLORS.white, fontSize: FONT_SIZE.sm, fontWeight: '700' },
  cardContent: { flex: 1, padding: SPACING.sm, justifyContent: 'center' },
  cardPrice: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.price },
  cardTitle: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.text, marginTop: 2 },
  cardSubtitle: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: 4 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  statText: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  timeAgo: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, marginLeft: 'auto' },
  actions: {
    flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.borderZinc,
  },
  actionButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 10,
  },
  actionText: { fontSize: FONT_SIZE.xs, color: COLORS.text, fontWeight: '500' },
  emptyIcon: {
    backgroundColor: COLORS.zinc100, borderRadius: BORDER_RADIUS.full,
    width: 96, height: 96, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm,
  },
  emptyText: { fontSize: FONT_SIZE.md, color: COLORS.textMuted, fontWeight: '600' },
  emptySubText: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted },
  postButton: {
    backgroundColor: COLORS.black, borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.lg, height: 44,
    alignItems: 'center', justifyContent: 'center', marginTop: SPACING.sm,
  },
  postButtonText: { color: COLORS.white, fontSize: FONT_SIZE.sm, fontWeight: '500' },
  expiryRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  expiryRowUrgent: {},
  expiryText: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  expiryTextUrgent: { color: COLORS.error, fontWeight: '600' },
});
