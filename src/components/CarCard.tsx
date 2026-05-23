import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';
import { formatPrice, formatMileage, translateEnum } from '../utils/formatters';
import { Car } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { LOCALE_MAP } from '../i18n';

function getMainImage(images: Car['images']): string | null {
  if (!images || images.length === 0) return null;
  const main = images.find((img) => img.isMain);
  return main?.url || images[0]?.url || null;
}

function getDaysListed(createdAt: string): number {
  if (!createdAt) return 999;
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000);
}

interface CarCardProps {
  car: Car;
  onPress: () => void;
  layout?: 'grid' | 'list' | 'suggestion';
  isSaved?: boolean;
  onToggleSave?: () => void;
}

export function CarCard({ car, onPress, layout = 'grid', isSaved, onToggleSave }: CarCardProps) {
  const { t, language } = useLanguage();
  const imageUrl = getMainImage(car.images);
  const isDealer = car.seller?.role === 'DEALER';
  const locale = LOCALE_MAP[language];

  // ── Suggestion layout (homepage InterestingSuggestions) ──
  if (layout === 'suggestion') {
    const daysListed = getDaysListed(car.createdAt);
    return (
      <Pressable style={styles.suggestionCard} onPress={onPress} accessibilityLabel={`${car.year} ${car.make} ${car.model}, ${formatPrice(car.price)}`} accessibilityRole="button">
        <View style={styles.suggestionImageWrap}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.suggestionImage} resizeMode="cover" />
          ) : (
            <View style={[styles.suggestionImage, styles.noImage]}>
              <Ionicons name="car-outline" size={40} color={COLORS.zinc400} />
            </View>
          )}
          {/* Heart */}
          {onToggleSave && (
            <Pressable style={styles.heartButton} onPress={onToggleSave} hitSlop={8} accessibilityLabel={isSaved ? t.common.removeSaved : t.common.saveCar} accessibilityRole="button">
              <Ionicons
                name={isSaved ? 'heart' : 'heart-outline'}
                size={18}
                color={isSaved ? COLORS.heartActive : COLORS.zinc400}
              />
            </Pressable>
          )}
          {/* Dealer badge (bottom-left) */}
          {isDealer && car.seller?.dealerName && (
            <View style={styles.sugDealerBadge}>
              <Text style={styles.sugDealerText} numberOfLines={1}>{car.seller.dealerName}</Text>
            </View>
          )}
          {/* New listing badge (top-left) */}
          {daysListed <= 7 && (
            <View style={styles.sugNewBadge}>
              <Ionicons name="time-outline" size={11} color={COLORS.white} />
              <Text style={styles.sugNewText}>
                {daysListed === 0
                  ? t.formatters.justNow
                  : t.formatters.daysAgo.replace('{count}', String(daysListed))}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.sugContent}>
          <Text style={styles.sugTitle} numberOfLines={1}>
            {car.year} {car.make} {car.model}{car.variant ? ` ${car.variant}` : ''}
          </Text>
          <Text style={styles.sugPrice}>{formatPrice(car.price)}</Text>

          {/* Row 1: Year + Mileage */}
          <View style={styles.sugSpecRow}>
            <View style={styles.sugSpec}>
              <Ionicons name="calendar-outline" size={12} color={COLORS.textMuted} />
              <Text style={styles.sugSpecText}>{car.year}</Text>
            </View>
            <View style={styles.sugSpec}>
              <Ionicons name="speedometer-outline" size={12} color={COLORS.textMuted} />
              <Text style={styles.sugSpecText}>{formatMileage(car.mileage, locale)}</Text>
            </View>
          </View>
          {/* Row 2: Fuel + Transmission */}
          <View style={styles.sugSpecRow}>
            <View style={styles.sugSpec}>
              <Ionicons name="water-outline" size={12} color={COLORS.textMuted} />
              <Text style={styles.sugSpecText}>{translateEnum('fuelTypes', car.fuelType, t.enums)}</Text>
            </View>
            <View style={styles.sugSpec}>
              <Ionicons name="cog-outline" size={12} color={COLORS.textMuted} />
              <Text style={styles.sugSpecText}>{translateEnum('transmissions', car.transmission, t.enums)}</Text>
            </View>
          </View>

          {/* Location */}
          {car.location && (
            <View style={styles.sugLocationRow}>
              <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
              <Text style={styles.sugLocationText} numberOfLines={1}>{car.location}</Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  }

  if (layout === 'list') {
    return (
      <Pressable style={styles.listCard} onPress={onPress} accessibilityLabel={`${car.year} ${car.make} ${car.model}, ${formatPrice(car.price)}`} accessibilityRole="button">
        <View style={styles.listImageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.listImage} resizeMode="cover" />
          ) : (
            <View style={[styles.listImage, styles.noImage]}>
              <Ionicons name="car-outline" size={32} color={COLORS.zinc400} />
            </View>
          )}
          {onToggleSave && (
            <Pressable style={styles.heartButton} onPress={onToggleSave} hitSlop={8} accessibilityLabel={isSaved ? t.common.removeSaved : t.common.saveCar} accessibilityRole="button">
              <Ionicons
                name={isSaved ? 'heart' : 'heart-outline'}
                size={18}
                color={isSaved ? COLORS.heartActive : COLORS.zinc400}
              />
            </Pressable>
          )}
        </View>
        <View style={styles.listContent}>
          <Text style={styles.listTitle} numberOfLines={1}>
            {car.year} {car.make} {car.model}
          </Text>
          {isDealer && car.seller?.dealerName && (
            <Text style={styles.sellerText} numberOfLines={1}>{car.seller.dealerName}</Text>
          )}
          <View style={styles.specGrid}>
            <View style={styles.specRow}>
              <Ionicons name="speedometer-outline" size={14} color={COLORS.specMileage} />
              <Text style={styles.specText}>{formatMileage(car.mileage, locale)}</Text>
            </View>
            <View style={styles.specRow}>
              <Ionicons name="water-outline" size={14} color={COLORS.specFuel} />
              <Text style={styles.specText}>{translateEnum('fuelTypes', car.fuelType, t.enums)}</Text>
            </View>
            <View style={styles.specRow}>
              <Ionicons name="cog-outline" size={14} color={COLORS.specYear} />
              <Text style={styles.specText}>{translateEnum('transmissions', car.transmission, t.enums)}</Text>
            </View>
            <View style={styles.specRow}>
              <Ionicons name="calendar-outline" size={14} color={COLORS.specYear} />
              <Text style={styles.specText}>{car.year}</Text>
            </View>
          </View>
          {car.location && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color={COLORS.specLocation} />
              <Text style={styles.locationText} numberOfLines={1}>{car.location}</Text>
            </View>
          )}
          <Text style={styles.listPrice}>{formatPrice(car.price)}</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable style={styles.card} onPress={onPress} accessibilityLabel={`${car.year} ${car.make} ${car.model}, ${formatPrice(car.price)}`} accessibilityRole="button">
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={[styles.cardImage, styles.noImage]}>
            <Ionicons name="car-outline" size={32} color={COLORS.zinc400} />
          </View>
        )}
        {/* Image count badge */}
        {car.images?.length > 1 && (
          <View style={styles.imageCountBadge}>
            <Ionicons name="images-outline" size={10} color={COLORS.white} />
            <Text style={styles.imageCountText}>{car.images.length}</Text>
          </View>
        )}
        {/* Price overlay on image */}
        <View style={styles.priceOverlay}>
          <Text style={styles.priceText}>{formatPrice(car.price)}</Text>
        </View>
        {/* Condition badges */}
        {car.condition === 'NEW' && (
          <View style={[styles.conditionBadge, { backgroundColor: COLORS.success }]}>
            <Text style={styles.conditionText}>{t.enums.conditions.new}</Text>
          </View>
        )}
        {car.condition === 'CERTIFIED' && (
          <View style={[styles.conditionBadge, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.conditionText}>{t.carDetail.certifiedPreOwned}</Text>
          </View>
        )}
        {car.isFeatured && car.condition !== 'NEW' && car.condition !== 'CERTIFIED' && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>{t.home.featured}</Text>
          </View>
        )}
        {/* Heart button */}
        {onToggleSave && (
          <Pressable style={styles.heartButton} onPress={onToggleSave} hitSlop={8} accessibilityLabel={isSaved ? t.common.removeSaved : t.common.saveCar} accessibilityRole="button">
            <Ionicons
              name={isSaved ? 'heart' : 'heart-outline'}
              size={18}
              color={isSaved ? COLORS.heartActive : COLORS.zinc400}
            />
          </Pressable>
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {car.year} {car.make} {car.model}
        </Text>
        {isDealer && car.seller?.dealerName && (
          <Text style={styles.sellerText} numberOfLines={1}>{car.seller.dealerName}</Text>
        )}
        {/* Specs grid with colored icons */}
        <View style={styles.specGrid}>
          <View style={styles.specRow}>
            <Ionicons name="speedometer-outline" size={14} color={COLORS.specMileage} />
            <Text style={styles.specText}>{formatMileage(car.mileage, locale)}</Text>
          </View>
          <View style={styles.specRow}>
            <Ionicons name="water-outline" size={14} color={COLORS.specFuel} />
            <Text style={styles.specText}>{translateEnum('fuelTypes', car.fuelType, t.enums)}</Text>
          </View>
          <View style={styles.specRow}>
            <Ionicons name="cog-outline" size={14} color={COLORS.specYear} />
            <Text style={styles.specText}>{translateEnum('transmissions', car.transmission, t.enums)}</Text>
          </View>
          <View style={styles.specRow}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.specYear} />
            <Text style={styles.specText}>{car.year}</Text>
          </View>
        </View>
        {/* Location */}
        {car.location && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={13} color={COLORS.specLocation} />
            <Text style={styles.locationText} numberOfLines={1}>{car.location}</Text>
          </View>
        )}
        {/* Action buttons */}
        <View style={styles.actionRow}>
          <Pressable style={styles.viewButton} onPress={onPress}>
            <Text style={styles.viewButtonText}>{t.common.viewDetails}</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Grid card
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderZinc,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  noImage: {
    backgroundColor: COLORS.zinc100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCountBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  imageCountText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  priceOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  priceText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: BORDER_RADIUS.full,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  conditionBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  conditionText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: COLORS.featuredBg,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  featuredText: {
    color: COLORS.featuredText,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  cardContent: {
    padding: SPACING.md,
    gap: 8,
  },
  cardTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 22,
  },
  sellerText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: '47%',
  },
  specText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 4,
  },
  viewButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS['2xl'],
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  viewButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
  },
  // List layout
  listCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderZinc,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  listImageContainer: {
    position: 'relative',
    width: 140,
  },
  listImage: {
    width: 140,
    height: 110,
  },
  listContent: {
    flex: 1,
    padding: SPACING.sm,
    justifyContent: 'center',
    gap: 4,
  },
  listTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  listPrice: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.price,
    marginTop: 2,
  },
  // Suggestion layout
  suggestionCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderZinc,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  suggestionImageWrap: {
    position: 'relative',
  },
  suggestionImage: {
    width: '100%',
    height: 180,
  },
  sugDealerBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    maxWidth: '70%',
  },
  sugDealerText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  sugNewBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#f97316',
    borderRadius: BORDER_RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sugNewText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  sugContent: {
    padding: SPACING.sm,
    gap: 4,
  },
  sugTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  sugPrice: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.price,
    marginBottom: 2,
  },
  sugSpecRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  sugSpec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flex: 1,
  },
  sugSpecText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
  sugLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  sugLocationText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
});
