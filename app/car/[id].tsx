import {
  View, Text, StyleSheet, ScrollView, FlatList, Image, ActivityIndicator,
  Pressable, Linking, Share, useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../src/constants/theme';
import { formatPrice, formatMileage, formatEnum, formatEngineSize, translateEnum } from '../../src/utils/formatters';
import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useSavedCarIds, useToggleSave } from '../../src/hooks/useSaveCar';
import { useLanguage } from '../../src/context/LanguageContext';
import { useAuth } from '../../src/context/AuthContext';
import { START_CONVERSATION } from '../../src/graphql/messaging';
import { LOCALE_MAP } from '../../src/i18n';
import { CarCard } from '../../src/components/CarCard';
import { ImageGalleryModal } from '../../src/components/ImageGalleryModal';
import * as Clipboard from 'expo-clipboard';

// SCREEN_WIDTH is now obtained via useWindowDimensions() inside the component

const GET_CAR = gql`
  query GetCar($id: String!) {
    getCarById(id: $id) {
      id
      make
      model
      variant
      year
      price
      mileage
      vehicleType
      fuelType
      transmission
      condition
      color
      interiorColor
      description
      engineSize
      horsePower
      doors
      seats
      drivetrain
      features
      safetyFeatures
      location
      city
      region
      isAvailable
      isFeatured
      isCertified
      viewCount
      favoriteCount
      contactPhone
      contactEmail
      allowTestDrive
      acceptsTradeIn
      priceNegotiable
      originalPrice
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
        phone
        role
        avatarUrl
        dealerName
        dealerLogoUrl
        dealerCity
        dealerPhoneNumber
      }
    }
  }
`;

const GET_SELLER_CARS = gql`
  query GetSellerCars($filters: CarFilterInput) {
    getCars(filters: $filters) {
      id
      make
      model
      variant
      year
      price
      mileage
      fuelType
      transmission
      condition
      location
      vehicleType
      isFeatured
      isCertified
      createdAt
      images { id url isMain sortOrder }
      seller { id name role dealerName }
    }
  }
`;

const RECORD_CAR_VIEW = gql`
  mutation RecordCarView($input: RecordCarViewInput!) {
    recordCarView(input: $input) { id }
  }
`;

function DetailRow({ icon, iconColor, label, value }: { icon: string; iconColor: string; label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon as any} size={16} color={iconColor} />
      <View style={styles.detailRowText}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{String(value)}</Text>
      </View>
    </View>
  );
}

export default function CarDetailScreen() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [startConversation, { loading: startingChat }] = useMutation(START_CONVERSATION);
  const { data, loading, error } = useQuery(GET_CAR, { variables: { id } });
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { savedIds } = useSavedCarIds();
  const { toggleSave } = useToggleSave();
  const isSaved = savedIds.includes(id);
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'history'>('overview');
  const { t, language } = useLanguage();
  const locale = LOCALE_MAP[language];
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const galleryRef = useRef<FlatList>(null);
  const [recordView] = useMutation(RECORD_CAR_VIEW);

  useEffect(() => {
    if (id) {
      recordView({ variables: { input: { carId: id } } }).catch(() => {});
    }
  }, [id, recordView]);

  const carData = data as any;
  const car = carData?.getCarById;
  const sellerId = car?.seller?.id;

  const { data: sellerCarsData } = useQuery(GET_SELLER_CARS, {
    variables: { filters: { sellerId } },
    skip: !sellerId,
  });

  const sellerCars = ((sellerCarsData as any)?.getCars || []).filter((c: any) => c.id !== id).slice(0, 4);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerRightRow}>
          <Pressable
            onPress={() => toggleSave(id)}
            hitSlop={8}
            style={styles.headerIconBtn}
          >
            <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={20} color={isSaved ? COLORS.heartActive : COLORS.white} />
          </Pressable>
          <Pressable
            onPress={() => {
              if (car) {
                Share.share({
                  message: t.carDetail.shareText
                    .replace('{year}', car.year)
                    .replace('{make}', car.make)
                    .replace('{model}', car.model)
                    .replace('{price}', formatPrice(car.price)) + `\nhttps://carmarket365.com/cars/${id}`,
                });
              }
            }}
            hitSlop={8}
            style={styles.headerIconBtn}
          >
            <Ionicons name="share-outline" size={20} color={COLORS.white} />
          </Pressable>
        </View>
      ),
    });
  }, [navigation, isSaved, data, id, t]);

  const scrollToImage = useCallback((index: number) => {
    setActiveImageIndex(index);
    galleryRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  const handleCopyLink = useCallback(async () => {
    await Clipboard.setStringAsync(`https://carmarket365.com/cars/${id}`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !car) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIcon}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.zinc400} />
        </View>
        <Text style={styles.errorText}>{t.carDetail.failedToLoad}</Text>
      </View>
    );
  }

  const images = car.images?.length > 0 ? [...car.images].sort((a: any, b: any) => a.sortOrder - b.sortOrder) : [];
  const isDealer = car.seller?.role === 'DEALER';
  const phone = car.contactPhone || car.seller?.dealerPhoneNumber || car.seller?.phone;

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* ── Image Gallery ── */}
        {images.length > 0 ? (
          <View style={styles.galleryContainer}>
            <Pressable onPress={() => setFullscreenVisible(true)}>
              <FlatList
                ref={galleryRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                data={images}
                keyExtractor={(img: any) => img.id}
                renderItem={({ item: img }: any) => (
                  <Image source={{ uri: img.url }} style={[styles.galleryImage, { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.5625 }]} resizeMode="cover" />
                )}
                getItemLayout={(_, index) => ({
                  length: SCREEN_WIDTH,
                  offset: SCREEN_WIDTH * index,
                  index,
                })}
                onMomentumScrollEnd={(e) => {
                  setActiveImageIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH));
                }}
              />
            </Pressable>
            {/* Image counter badge */}
            {images.length > 1 && (
              <View style={styles.imageCounterBadge}>
                <Ionicons name="images-outline" size={12} color={COLORS.white} />
                <Text style={styles.imageCounterText}>{activeImageIndex + 1} / {images.length}</Text>
              </View>
            )}
            {/* Pagination dots */}
            {images.length > 1 && (
              <View style={styles.pagination}>
                {images.map((_: any, i: number) => (
                  <View key={i} style={[styles.dot, i === activeImageIndex && styles.dotActive]} />
                ))}
              </View>
            )}
            {/* Thumbnails */}
            {images.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailRow}>
                {images.map((img: any, i: number) => (
                  <Pressable key={img.id} onPress={() => scrollToImage(i)}>
                    <Image
                      source={{ uri: img.url }}
                      style={[styles.thumbnail, i === activeImageIndex && styles.thumbnailActive]}
                      resizeMode="cover"
                    />
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        ) : (
          <View style={styles.noImageGallery}>
            <Ionicons name="image-outline" size={48} color={COLORS.zinc400} />
            <Text style={styles.noImageText}>{t.carDetail.noImages}</Text>
          </View>
        )}

        {/* ── Price Card ── */}
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(car.price)}</Text>
            {car.originalPrice && car.originalPrice > car.price && (
              <Text style={styles.originalPrice}>{formatPrice(car.originalPrice)}</Text>
            )}
          </View>
          {car.priceNegotiable && <Text style={styles.negotiable}>{t.carDetail.priceNegotiable}</Text>}
          <Text style={styles.title}>
            {car.year} {car.make} {car.model} {car.variant || ''}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.specLocation} />
            <Text style={styles.locationText}>{car.location}{car.city ? `, ${car.city}` : ''}</Text>
          </View>

          {/* View & Favorite counts */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.statText}>{car.viewCount || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.statText}>{car.favoriteCount || 0}</Text>
            </View>
          </View>

          {/* CTA Buttons */}
          <View style={styles.ctaButtons}>
            {phone && (
              <Pressable
                style={styles.callButton}
                onPress={() => Linking.openURL(`tel:${phone}`)}
              >
                <Ionicons name="call" size={18} color={COLORS.white} />
                <Text style={styles.callButtonText}>{isDealer ? t.carDetail.callDealer : t.carDetail.callSeller}</Text>
              </Pressable>
            )}
            {car.seller?.id !== user?.id && (
              <Pressable
                style={styles.messageButton}
                disabled={startingChat}
                onPress={async () => {
                  if (!isAuthenticated) { router.push('/login'); return; }
                  if (startingChat) return;
                  try {
                    const res = await startConversation({ variables: { carId: car.id, content: t.messages.opener } });
                    const convId = (res.data as { startConversation?: { id: string } } | null | undefined)?.startConversation?.id;
                    if (convId) router.push(`/conversation/${convId}`);
                  } catch { /* surfaced by Apollo error link */ }
                }}
              >
                <Ionicons name="chatbubble-outline" size={18} color={COLORS.text} />
                <Text style={styles.messageButtonText}>{startingChat ? t.common.loading : t.messages.messageSeller}</Text>
              </Pressable>
            )}
            {car.contactEmail && (
              <Pressable
                style={styles.messageButton}
                onPress={() => car.contactEmail && Linking.openURL(`mailto:${car.contactEmail}`)}
              >
                <Ionicons name="mail-outline" size={18} color={COLORS.text} />
                <Text style={styles.messageButtonText}>{t.carDetail.sendMessage}</Text>
              </Pressable>
            )}
          </View>

          {/* Social Share */}
          <View style={styles.shareRow}>
            <Pressable
              style={[styles.socialBtn, { backgroundColor: COLORS.facebook }]}
              onPress={() => Linking.openURL(`https://www.facebook.com/sharer/sharer.php?u=https://carmarket365.com/cars/${id}`)}
            >
              <Ionicons name="logo-facebook" size={18} color={COLORS.white} />
            </Pressable>
            <Pressable
              style={[styles.socialBtn, { backgroundColor: COLORS.black }]}
              onPress={() => {
                Share.share({
                  message: `${car.year} ${car.make} ${car.model} - ${formatPrice(car.price)} https://carmarket365.com/cars/${id}`,
                });
              }}
            >
              <Ionicons name="share-social-outline" size={18} color={COLORS.white} />
            </Pressable>
            <Pressable
              style={[styles.socialBtn, { backgroundColor: linkCopied ? COLORS.success : COLORS.zinc200 }]}
              onPress={handleCopyLink}
            >
              <Ionicons
                name={linkCopied ? 'checkmark' : 'copy-outline'}
                size={18}
                color={linkCopied ? COLORS.white : COLORS.text}
              />
            </Pressable>
          </View>
        </View>

        {/* ── Key Specs Horizontal Bar ── */}
        <View style={styles.keySpecsBar}>
          <View style={styles.keySpecItem}>
            <Ionicons name="speedometer-outline" size={18} color={COLORS.specMileage} />
            <Text style={styles.keySpecValue}>{formatMileage(car.mileage, locale)}</Text>
          </View>
          <View style={styles.keySpecDivider} />
          <View style={styles.keySpecItem}>
            <Ionicons name="water-outline" size={18} color={COLORS.specFuel} />
            <Text style={styles.keySpecValue}>{translateEnum('fuelTypes', car.fuelType, t.enums)}</Text>
          </View>
          <View style={styles.keySpecDivider} />
          <View style={styles.keySpecItem}>
            <Ionicons name="cog-outline" size={18} color={COLORS.specYear} />
            <Text style={styles.keySpecValue}>{translateEnum('transmissions', car.transmission, t.enums)}</Text>
          </View>
          <View style={styles.keySpecDivider} />
          <View style={styles.keySpecItem}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.specYear} />
            <Text style={styles.keySpecValue}>{car.year}</Text>
          </View>
        </View>

        {/* ── Tabs ── */}
        <View style={styles.tabContainer}>
          {(['overview', 'features', 'history'] as const).map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'overview' ? t.carDetail.overview : tab === 'features' ? t.carDetail.features : t.carDetail.history}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── Tab Content ── */}
        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            <View style={styles.detailCard}>
              <Text style={styles.cardTitle}>{t.carDetail.vehicleDetails}</Text>
              <View style={styles.detailGrid}>
                <DetailRow icon="car-outline" iconColor={COLORS.textMuted} label={t.carDetail.type} value={translateEnum('vehicleTypes', car.vehicleType, t.enums)} />
                <DetailRow icon="shield-checkmark-outline" iconColor={COLORS.textMuted} label={t.carDetail.condition} value={translateEnum('conditions', car.condition, t.enums)} />
                <DetailRow icon="color-palette-outline" iconColor={COLORS.textMuted} label={t.carDetail.color} value={car.color ? translateEnum('colors', car.color, t.enums) : undefined} />
                <DetailRow icon="color-palette-outline" iconColor={COLORS.textMuted} label={t.carDetail.interior} value={car.interiorColor ? translateEnum('colors', car.interiorColor, t.enums) : undefined} />
                <DetailRow icon="cube-outline" iconColor={COLORS.textMuted} label={t.carDetail.bodyType} value={car.vehicleType ? translateEnum('bodyTypes', car.vehicleType, t.enums) : undefined} />
                <DetailRow icon="hardware-chip-outline" iconColor={COLORS.textMuted} label={t.carDetail.engine} value={car.engineSize ? formatEngineSize(car.engineSize) : undefined} />
                <DetailRow icon="flash-outline" iconColor={COLORS.textMuted} label={t.carDetail.power} value={car.horsePower ? `${car.horsePower} ${t.formatters.hp}` : undefined} />
                <DetailRow icon="git-branch-outline" iconColor={COLORS.textMuted} label={t.carDetail.drivetrain} value={car.drivetrain ? translateEnum('drivetrains', car.drivetrain, t.enums) : undefined} />
                <DetailRow icon="enter-outline" iconColor={COLORS.textMuted} label={t.carDetail.doors} value={car.doors} />
                <DetailRow icon="people-outline" iconColor={COLORS.textMuted} label={t.carDetail.seats} value={car.seats} />
              </View>
            </View>

            {car.description && (
              <View style={styles.detailCard}>
                <Text style={styles.cardTitle}>{t.carDetail.description}</Text>
                <Text style={styles.description}>{car.description}</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'features' && (
          <View style={styles.tabContent}>
            {car.features?.length > 0 && (
              <View style={styles.detailCard}>
                <Text style={styles.cardTitle}>{t.carDetail.features}</Text>
                <View style={styles.featuresGrid}>
                  {car.features.map((f: string, i: number) => (
                    <View key={i} style={styles.featureGridItem}>
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                      <Text style={styles.featureGridText}>{t.featureLabels[f] || f}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {car.safetyFeatures?.length > 0 && (
              <View style={styles.detailCard}>
                <Text style={styles.cardTitle}>{t.carDetail.safetyFeatures}</Text>
                <View style={styles.featuresGrid}>
                  {car.safetyFeatures.map((f: string, i: number) => (
                    <View key={i} style={styles.featureGridItem}>
                      <Ionicons name="shield-checkmark" size={16} color={COLORS.specMileage} />
                      <Text style={styles.featureGridText}>{t.safetyLabels[f] || f}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {(!car.features?.length && !car.safetyFeatures?.length) && (
              <View style={styles.emptyTab}>
                <Text style={styles.emptyTabText}>{t.carDetail.noFeatures}</Text>
              </View>
            )}

            {/* Extra info badges */}
            {(car.allowTestDrive || car.acceptsTradeIn || car.isCertified) && (
              <View style={styles.detailCard}>
                <View style={styles.extraBadges}>
                  {car.allowTestDrive && (
                    <View style={styles.extraBadge}>
                      <Ionicons name="car-sport-outline" size={16} color={COLORS.success} />
                      <Text style={styles.extraBadgeText}>{t.carDetail.testDriveAvailable}</Text>
                    </View>
                  )}
                  {car.acceptsTradeIn && (
                    <View style={styles.extraBadge}>
                      <Ionicons name="swap-horizontal-outline" size={16} color={COLORS.specMileage} />
                      <Text style={styles.extraBadgeText}>{t.carDetail.tradeInAccepted}</Text>
                    </View>
                  )}
                  {car.isCertified && (
                    <View style={styles.extraBadge}>
                      <Ionicons name="ribbon-outline" size={16} color={COLORS.specYear} />
                      <Text style={styles.extraBadgeText}>{t.carDetail.certifiedPreOwned}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        )}

        {activeTab === 'history' && (
          <View style={styles.tabContent}>
            <View style={styles.detailCard}>
              <Text style={styles.cardTitle}>{t.carDetail.vehicleHistory}</Text>
              <View style={styles.historyTimeline}>
                <View style={styles.historyItem}>
                  <View style={styles.historyDot} />
                  <View style={styles.historyContent}>
                    <Text style={styles.historyTitle}>{t.carDetail.listedOn}</Text>
                    <Text style={styles.historyDate}>
                      {new Date(car.createdAt).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </Text>
                  </View>
                </View>
                <View style={styles.historyItem}>
                  <View style={styles.historyDot} />
                  <View style={styles.historyContent}>
                    <Text style={styles.historyTitle}>{t.carDetail.manufactured}</Text>
                    <Text style={styles.historyDate}>{car.year}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ── Seller Card ── */}
        <Pressable style={styles.sellerCard} onPress={() => car.seller && router.push(`/seller/${car.seller.id}`)}>
          <Text style={styles.cardTitle}>{t.carDetail.sellerInfo}</Text>
          <View style={styles.sellerInfo}>
            {car.seller?.avatarUrl || car.seller?.dealerLogoUrl ? (
              <Image
                source={{ uri: car.seller.dealerLogoUrl || car.seller.avatarUrl }}
                style={styles.sellerAvatar}
              />
            ) : (
              <View style={[styles.sellerAvatar, styles.sellerAvatarPlaceholder]}>
                <Ionicons name="person" size={20} color={COLORS.white} />
              </View>
            )}
            <View style={styles.sellerTextWrap}>
              <Text style={styles.sellerName}>
                {isDealer ? car.seller.dealerName : car.seller.name}
              </Text>
              {isDealer && (
                <View style={styles.dealerBadge}>
                  <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
                  <Text style={styles.dealerBadgeText}>{t.carDetail.verifiedDealer}</Text>
                </View>
              )}
              {car.seller?.dealerCity && (
                <View style={styles.sellerLocationRow}>
                  <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
                  <Text style={styles.sellerLocationText}>{car.seller.dealerCity}</Text>
                </View>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </View>
        </Pressable>

        {/* ── More From This Seller ── */}
        {sellerCars.length > 0 && (
          <View style={styles.moreFromSellerSection}>
            <Text style={styles.moreFromSellerTitle}>{t.carDetail.moreFromSeller}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.moreFromSellerScroll}
            >
              {sellerCars.map((sellerCar: any) => (
                <View key={sellerCar.id} style={styles.moreFromSellerCard}>
                  <CarCard
                    car={sellerCar}
                    layout="suggestion"
                    onPress={() => router.push(`/car/${sellerCar.id}`)}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* ── Fullscreen Image Gallery with Pinch-to-Zoom ── */}
      <ImageGalleryModal
        visible={fullscreenVisible}
        images={images}
        initialIndex={activeImageIndex}
        onClose={() => setFullscreenVisible(false)}
        onIndexChange={setActiveImageIndex}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundMuted },
  scrollContent: { paddingBottom: SPACING.xxl },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.backgroundMuted },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.md, backgroundColor: COLORS.backgroundMuted },
  errorIcon: {
    backgroundColor: COLORS.zinc100,
    borderRadius: BORDER_RADIUS.full,
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary },

  // Header buttons
  headerRightRow: { flexDirection: 'row', gap: 12 },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Gallery
  galleryContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderZinc,
    position: 'relative',
  },
  galleryImage: { height: 220 },
  imageCounterBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: BORDER_RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  imageCounterText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.zinc200 },
  dotActive: { backgroundColor: COLORS.primary, width: 20 },
  thumbnailRow: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: 8,
  },
  thumbnail: {
    width: 80,
    height: 64,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.borderZinc,
  },
  thumbnailActive: {
    borderColor: COLORS.primary,
  },
  noImageGallery: {
    height: 200,
    backgroundColor: COLORS.zinc50,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  noImageText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },

  // Price Card
  priceCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    borderWidth: 1,
    borderColor: COLORS.borderZinc,
    padding: SPACING.md,
    margin: SPACING.md,
    gap: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  price: { fontSize: FONT_SIZE.heading, fontWeight: '700', color: COLORS.text },
  originalPrice: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted, textDecorationLine: 'line-through' },
  negotiable: { fontSize: FONT_SIZE.sm, color: COLORS.success, fontWeight: '500' },
  title: { fontSize: FONT_SIZE.xl, fontWeight: '600', color: COLORS.text },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },

  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },

  ctaButtons: { gap: 8, marginTop: 4 },
  callButton: {
    backgroundColor: COLORS.black,
    borderRadius: BORDER_RADIUS.full,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  callButtonText: { color: COLORS.white, fontSize: FONT_SIZE.md, fontWeight: '500' },
  messageButton: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.full,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.borderZinc,
  },
  messageButtonText: { color: COLORS.text, fontSize: FONT_SIZE.md, fontWeight: '500' },

  shareRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  socialBtn: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Key Specs Bar
  keySpecsBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    borderWidth: 1,
    borderColor: COLORS.borderZinc,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    alignItems: 'center',
  },
  keySpecItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  keySpecValue: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  keySpecDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.zinc200,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    backgroundColor: COLORS.zinc100,
    borderRadius: BORDER_RADIUS.full,
    padding: 2,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.full,
  },
  tabActive: {
    backgroundColor: COLORS.black,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted, fontWeight: '500' },
  tabTextActive: { color: COLORS.white },

  // Tab Content
  tabContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },

  // Detail Card
  detailCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    borderWidth: 1,
    borderColor: COLORS.borderZinc,
    padding: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  detailGrid: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailRowText: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderZinc,
  },
  detailLabel: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted },
  detailValue: { fontSize: FONT_SIZE.sm, color: COLORS.text, fontWeight: '500' },

  description: { fontSize: FONT_SIZE.md, color: COLORS.text, lineHeight: 22 },

  // Features grid (2 columns)
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureGridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '50%',
    paddingVertical: 6,
  },
  featureGridText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    flex: 1,
  },

  emptyTab: { padding: SPACING.xl, alignItems: 'center' },
  emptyTabText: { fontSize: FONT_SIZE.md, color: COLORS.textMuted },

  extraBadges: { gap: 12 },
  extraBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  extraBadgeText: { fontSize: FONT_SIZE.sm, color: COLORS.text, fontWeight: '500' },

  // History
  historyTimeline: { gap: 16 },
  historyItem: { flexDirection: 'row', gap: 12 },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    marginTop: 6,
  },
  historyContent: { flex: 1 },
  historyTitle: { fontSize: FONT_SIZE.md, color: COLORS.text, fontWeight: '500' },
  historyDate: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted, marginTop: 2 },

  // Seller Card
  sellerCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    borderWidth: 1,
    borderColor: COLORS.borderZinc,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  sellerInfo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  sellerAvatar: { width: 48, height: 48, borderRadius: BORDER_RADIUS.full },
  sellerAvatarPlaceholder: { backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  sellerTextWrap: { flex: 1 },
  sellerName: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  dealerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dealerBadgeText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
  },
  sellerLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  sellerLocationText: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },

  // More From This Seller
  moreFromSellerSection: {
    marginTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  moreFromSellerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  moreFromSellerScroll: {
    paddingHorizontal: SPACING.md,
    gap: 12,
  },
  moreFromSellerCard: {
    width: 240,
  },

});
