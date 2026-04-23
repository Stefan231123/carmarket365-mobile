import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Pressable, Dimensions, Linking } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../src/constants/theme';
import { formatPrice, formatMileage, formatEnum, formatEngineSize } from '../../src/utils/formatters';
import { useState } from 'react';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GET_CAR = gql`
  query GetCar($id: String!) {
    car(id: $id) {
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
        email
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

function SpecRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <View style={styles.specRow}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{String(value)}</Text>
    </View>
  );
}

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading, error } = useQuery(GET_CAR, { variables: { id } });
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const carData = data as any;
  if (error || !carData?.car) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
        <Text style={styles.errorText}>Failed to load car details</Text>
      </View>
    );
  }

  const car = carData.car;
  const images = car.images?.length > 0 ? [...car.images].sort((a: any, b: any) => a.sortOrder - b.sortOrder) : [];
  const isDealer = car.seller?.role === 'DEALER';
  const phone = car.contactPhone || car.seller?.dealerPhoneNumber || car.seller?.phone;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Image Gallery */}
      {images.length > 0 ? (
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              setActiveImageIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH));
            }}
          >
            {images.map((img: any) => (
              <Image key={img.id} source={{ uri: img.url }} style={styles.galleryImage} resizeMode="cover" />
            ))}
          </ScrollView>
          {images.length > 1 && (
            <View style={styles.pagination}>
              {images.map((_: any, i: number) => (
                <View key={i} style={[styles.dot, i === activeImageIndex && styles.dotActive]} />
              ))}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.noImageGallery}>
          <Ionicons name="image-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.noImageText}>No images</Text>
        </View>
      )}

      {/* Price & Title */}
      <View style={styles.headerSection}>
        <Text style={styles.price}>{formatPrice(car.price)}</Text>
        {car.originalPrice && car.originalPrice > car.price && (
          <Text style={styles.originalPrice}>{formatPrice(car.originalPrice)}</Text>
        )}
        {car.priceNegotiable && <Text style={styles.negotiable}>Price negotiable</Text>}
        <Text style={styles.title}>
          {car.make} {car.model} {car.variant || ''} {car.year}
        </Text>
        <Text style={styles.location}>{car.location}{car.city ? `, ${car.city}` : ''}</Text>
      </View>

      {/* Key Specs */}
      <View style={styles.keySpecs}>
        <View style={styles.specChip}>
          <Ionicons name="speedometer-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.specChipText}>{formatMileage(car.mileage)}</Text>
        </View>
        <View style={styles.specChip}>
          <Ionicons name="flash-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.specChipText}>{formatEnum(car.fuelType)}</Text>
        </View>
        <View style={styles.specChip}>
          <Ionicons name="cog-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.specChipText}>{formatEnum(car.transmission)}</Text>
        </View>
        <View style={styles.specChip}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.specChipText}>{car.year}</Text>
        </View>
      </View>

      {/* Specifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Specifications</Text>
        <SpecRow label="Vehicle Type" value={formatEnum(car.vehicleType)} />
        <SpecRow label="Condition" value={formatEnum(car.condition)} />
        <SpecRow label="Color" value={car.color} />
        <SpecRow label="Interior" value={car.interiorColor} />
        <SpecRow label="Engine" value={car.engineSize ? formatEngineSize(car.engineSize) : undefined} />
        <SpecRow label="Power" value={car.horsePower ? `${car.horsePower} HP` : undefined} />
        <SpecRow label="Drivetrain" value={car.drivetrain ? formatEnum(car.drivetrain) : undefined} />
        <SpecRow label="Doors" value={car.doors} />
        <SpecRow label="Seats" value={car.seats} />
      </View>

      {/* Description */}
      {car.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{car.description}</Text>
        </View>
      )}

      {/* Features */}
      {car.features?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.chipContainer}>
            {car.features.map((f: string, i: number) => (
              <View key={i} style={styles.featureChip}>
                <Text style={styles.featureChipText}>{f}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Safety */}
      {car.safetyFeatures?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety</Text>
          <View style={styles.chipContainer}>
            {car.safetyFeatures.map((f: string, i: number) => (
              <View key={i} style={styles.featureChip}>
                <Text style={styles.featureChipText}>{f}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Seller Card */}
      <View style={styles.sellerCard}>
        <Text style={styles.sectionTitle}>Seller</Text>
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
          <View style={{ flex: 1 }}>
            <Text style={styles.sellerName}>
              {isDealer ? car.seller.dealerName : car.seller.name}
            </Text>
            {isDealer && (
              <View style={styles.dealerBadge}>
                <Text style={styles.dealerBadgeText}>Dealer</Text>
              </View>
            )}
          </View>
        </View>

        {/* Contact Buttons */}
        <View style={styles.contactButtons}>
          {phone && (
            <Pressable
              style={[styles.contactButton, { backgroundColor: COLORS.success }]}
              onPress={() => Linking.openURL(`tel:${phone}`)}
            >
              <Ionicons name="call" size={18} color={COLORS.white} />
              <Text style={styles.contactButtonText}>Call</Text>
            </Pressable>
          )}
          {(car.contactEmail || car.seller?.email) && (
            <Pressable
              style={[styles.contactButton, { backgroundColor: COLORS.primary }]}
              onPress={() => Linking.openURL(`mailto:${car.contactEmail || car.seller.email}`)}
            >
              <Ionicons name="mail" size={18} color={COLORS.white} />
              <Text style={styles.contactButtonText}>Email</Text>
            </Pressable>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: SPACING.xxl },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.md },
  errorText: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary },
  galleryImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.5625 },
  pagination: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: SPACING.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  dotActive: { backgroundColor: COLORS.primary, width: 20 },
  noImageGallery: { height: 200, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', gap: SPACING.xs },
  noImageText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },
  headerSection: { padding: SPACING.md },
  price: { fontSize: FONT_SIZE.heading, fontWeight: '700', color: COLORS.primary },
  originalPrice: { fontSize: FONT_SIZE.md, color: COLORS.textMuted, textDecorationLine: 'line-through' },
  negotiable: { fontSize: FONT_SIZE.sm, color: COLORS.success, fontWeight: '500' },
  title: { fontSize: FONT_SIZE.xl, fontWeight: '600', color: COLORS.text, marginTop: SPACING.xs },
  location: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: 2 },
  keySpecs: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, paddingHorizontal: SPACING.md, paddingBottom: SPACING.md },
  specChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.surface, paddingHorizontal: SPACING.sm, paddingVertical: 6, borderRadius: BORDER_RADIUS.sm, borderWidth: 1, borderColor: COLORS.border },
  specChipText: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, fontWeight: '500' },
  section: { padding: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border },
  specLabel: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  specValue: { fontSize: FONT_SIZE.sm, color: COLORS.text, fontWeight: '500' },
  description: { fontSize: FONT_SIZE.sm, color: COLORS.text, lineHeight: 22 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  featureChip: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.sm, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.border },
  featureChipText: { fontSize: FONT_SIZE.xs, color: COLORS.text },
  sellerCard: { padding: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border },
  sellerInfo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  sellerAvatar: { width: 48, height: 48, borderRadius: 24 },
  sellerAvatarPlaceholder: { backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  sellerName: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  dealerBadge: { backgroundColor: COLORS.primary + '15', borderRadius: BORDER_RADIUS.sm, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 2 },
  dealerBadgeText: { color: COLORS.primary, fontSize: 10, fontWeight: '600' },
  contactButtons: { flexDirection: 'row', gap: SPACING.sm },
  contactButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, paddingVertical: 14, borderRadius: BORDER_RADIUS.md },
  contactButtonText: { color: COLORS.white, fontSize: FONT_SIZE.md, fontWeight: '600' },
});
