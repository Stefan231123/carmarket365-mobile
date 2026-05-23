import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, Pressable, RefreshControl, Modal, FlatList, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../src/constants/theme';
import { CarCard } from '../../src/components/CarCard';
import { useSavedCarIds, useToggleSave } from '../../src/hooks/useSaveCar';
import { useLanguage } from '../../src/context/LanguageContext';
import { CAR_MAKES, CAR_MODELS_BY_MAKE } from '../../src/constants/car-data';
import { MUNICIPALITIES_MK } from '../../src/constants/locations';

// ── Data ──────────────────────────────────────────────────────────

const GET_FEATURED_CARS = gql`
  query GetFeaturedCars {
    getFeaturedCars(limit: 8) {
      id make model year price mileage fuelType transmission
      location condition isAvailable isFeatured
      images { id url isMain sortOrder }
      seller { id name role dealerName dealerLogoUrl }
    }
  }
`;

const GET_RECENT_CARS = gql`
  query GetRecentCars {
    getCars {
      id make model year price mileage fuelType transmission
      location condition isAvailable isFeatured createdAt
      images { id url isMain sortOrder }
      seller { id name role dealerName dealerLogoUrl }
    }
  }
`;

const BRAND_LOGOS: Record<string, any> = {
  'BMW': require('../../assets/brands/bmw.png'),
  'Mercedes-Benz': require('../../assets/brands/mercedes-benz.png'),
  'Audi': require('../../assets/brands/audi.png'),
  'Volkswagen': require('../../assets/brands/volkswagen.png'),
  'Toyota': require('../../assets/brands/toyota.png'),
  'Opel': require('../../assets/brands/opel.png'),
  'Ford': require('../../assets/brands/ford.png'),
  'Renault': require('../../assets/brands/renault.png'),
  'Peugeot': require('../../assets/brands/peugeot.png'),
  'Škoda': require('../../assets/brands/skoda.png'),
  'Fiat': require('../../assets/brands/fiat.png'),
  'Hyundai': require('../../assets/brands/hyundai.png'),
};

const POPULAR_BRANDS = [
  { name: 'BMW', color: '#0066B1' },
  { name: 'Mercedes-Benz', color: '#333333' },
  { name: 'Audi', color: '#BB0A30' },
  { name: 'Volkswagen', color: '#001E50' },
  { name: 'Toyota', color: '#EB0A1E' },
  { name: 'Opel', color: '#F7A600' },
  { name: 'Ford', color: '#003478' },
  { name: 'Renault', color: '#FFCC00' },
  { name: 'Peugeot', color: '#1B3C6D' },
  { name: 'Škoda', color: '#4BA82E' },
  { name: 'Fiat', color: '#9E1B32' },
  { name: 'Hyundai', color: '#002C5F' },
];

const PRICE_FROM_OPTIONS = [
  { label: '€1,000', value: '1000' },
  { label: '€5,000', value: '5000' },
  { label: '€10,000', value: '10000' },
  { label: '€20,000', value: '20000' },
  { label: '€30,000', value: '30000' },
];

const PRICE_TO_OPTIONS = [
  { label: '€10,000', value: '10000' },
  { label: '€20,000', value: '20000' },
  { label: '€30,000', value: '30000' },
  { label: '€50,000', value: '50000' },
  { label: '€100,000+', value: '100000' },
];

const YEAR_OPTIONS = Array.from({ length: 15 }, (_, i) => {
  const y = new Date().getFullYear() - i;
  return { label: String(y), value: String(y) };
});

const MILEAGE_OPTIONS = [
  { label: '50,000 km', value: '50000' },
  { label: '100,000 km', value: '100000' },
  { label: '150,000 km', value: '150000' },
  { label: '200,000 km', value: '200000' },
  { label: '300,000 km', value: '300000' },
];

type HomeVehicleType = 'cars' | 'motorbikes' | 'trucks';

// ── Component ─────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { savedIds } = useSavedCarIds();
  const { toggleSave } = useToggleSave();

  const { data: featuredData, loading: featuredLoading, error: featuredError, refetch: refetchFeatured } = useQuery(GET_FEATURED_CARS);
  const { data: recentData, loading: recentLoading, error: recentError, refetch: refetchRecent } = useQuery(GET_RECENT_CARS);
  const [refreshing, setRefreshing] = useState(false);
  const featuredCars = (featuredData as any)?.getFeaturedCars || [];
  const allRecentCars = (recentData as any)?.getCars || [];
  // Sort by newest and take first 4 client-side (backend doesn't support limit/sortBy in CarFilterInput)
  const recentCars = useMemo(() =>
    [...allRecentCars].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4),
    [allRecentCars],
  );
  const isLoading = featuredLoading || recentLoading;

  // Search form state
  const [vehicleType, setVehicleType] = useState<HomeVehicleType>('cars');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [mileage, setMileage] = useState('');
  const [location, setLocation] = useState('');

  // Picker modal state
  const [pickerModal, setPickerModal] = useState<{
    visible: boolean;
    title: string;
    options: { label: string; value: string }[];
    selected: string;
    onSelect: (value: string) => void;
  }>({ visible: false, title: '', options: [], selected: '', onSelect: () => {} });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchFeatured(), refetchRecent()]);
    setRefreshing(false);
  };

  const openPicker = (
    title: string,
    options: { label: string; value: string }[],
    selected: string,
    onSelect: (value: string) => void,
  ) => {
    setPickerModal({ visible: true, title, options, selected, onSelect });
  };

  const handleMakeChange = (value: string) => {
    setMake(value);
    setModel(''); // Reset model when make changes
  };

  const handleSearch = () => {
    const params: Record<string, string> = {};
    if (make) params.make = make;
    if (model) params.model = model;
    if (priceFrom) params.minPrice = priceFrom;
    if (priceTo) params.maxPrice = priceTo;
    if (yearFrom) params.minYear = yearFrom;
    if (yearTo) params.maxYear = yearTo;
    if (mileage) params.maxMileage = mileage;
    if (location) params.location = location;
    if (vehicleType !== 'cars') params.vehicleType = vehicleType.toUpperCase();
    router.push({ pathname: '/(tabs)/search', params });
  };

  const handleBrandPress = (brandName: string) => {
    router.push({ pathname: '/(tabs)/search', params: { make: brandName } });
  };

  const vehicleTypes: { id: HomeVehicleType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'cars', label: t.home.cars, icon: 'car-outline' },
    { id: 'motorbikes', label: t.home.motorbikes, icon: 'bicycle-outline' },
    { id: 'trucks', label: t.home.trucks, icon: 'bus-outline' },
  ];

  const makeOptions = CAR_MAKES.map(m => ({ label: m, value: m }));

  const modelOptions = useMemo(() => {
    if (!make) return [];
    const models = CAR_MODELS_BY_MAKE[make] || [];
    return models.map(m => ({ label: m, value: m }));
  }, [make]);

  const locationOptions = useMemo(() => {
    return MUNICIPALITIES_MK.map(loc => ({ label: loc.label, value: loc.value }));
  }, []);

  const getDisplayValue = (value: string, options: { label: string; value: string }[], placeholder: string) => {
    if (!value) return placeholder;
    return options.find(o => o.value === value)?.label || value;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if ((featuredError || recentError) && featuredCars.length === 0 && recentCars.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons name="cloud-offline-outline" size={48} color={COLORS.zinc400} />
        </View>
        <Text style={styles.emptyText}>{t.common.error}</Text>
        <Pressable style={styles.searchButton} onPress={onRefresh}>
          <Text style={styles.searchButtonText}>{t.common.retry}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* ── Hero Section ── */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>{t.home.heroTitle}</Text>
          <Text style={styles.heroSubtitle}>{t.home.heroSubtitle}</Text>

          {/* Search Card */}
          <View style={styles.searchCard}>
            {/* Vehicle Type Toggle */}
            <View style={styles.vehicleTypeRow}>
              {vehicleTypes.map((type) => (
                <Pressable
                  key={type.id}
                  style={[styles.vehicleTypeBtn, vehicleType === type.id && styles.vehicleTypeBtnActive]}
                  onPress={() => setVehicleType(type.id)}
                >
                  <Ionicons
                    name={type.icon}
                    size={16}
                    color={vehicleType === type.id ? COLORS.white : COLORS.textMuted}
                  />
                  <Text style={[styles.vehicleTypeBtnText, vehicleType === type.id && styles.vehicleTypeBtnTextActive]}>
                    {type.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Row 1: Make + Model */}
            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>{t.home.make}</Text>
                <Pressable
                  style={styles.selectInput}
                  onPress={() => openPicker(t.home.make, makeOptions, make, handleMakeChange)}
                >
                  <Text style={[styles.selectText, !make && styles.selectPlaceholder]} numberOfLines={1}>
                    {make || t.home.anyMake}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
                </Pressable>
              </View>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>{t.home.model}</Text>
                <Pressable
                  style={[styles.selectInput, !make && styles.selectInputDisabled]}
                  onPress={() => make && openPicker(t.home.model, modelOptions, model, setModel)}
                  disabled={!make}
                >
                  <Text style={[styles.selectText, !model && styles.selectPlaceholder]} numberOfLines={1}>
                    {model || t.home.anyModel}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
                </Pressable>
              </View>
            </View>

            {/* Row 2: Price From + Price To */}
            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>{t.home.priceFrom}</Text>
                <Pressable
                  style={styles.selectInput}
                  onPress={() => openPicker(t.home.priceFrom, PRICE_FROM_OPTIONS, priceFrom, setPriceFrom)}
                >
                  <Text style={[styles.selectText, !priceFrom && styles.selectPlaceholder]} numberOfLines={1}>
                    {getDisplayValue(priceFrom, PRICE_FROM_OPTIONS, t.home.minPrice)}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
                </Pressable>
              </View>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>{t.home.priceTo}</Text>
                <Pressable
                  style={styles.selectInput}
                  onPress={() => openPicker(t.home.priceTo, PRICE_TO_OPTIONS, priceTo, setPriceTo)}
                >
                  <Text style={[styles.selectText, !priceTo && styles.selectPlaceholder]} numberOfLines={1}>
                    {getDisplayValue(priceTo, PRICE_TO_OPTIONS, t.home.maxPrice)}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
                </Pressable>
              </View>
            </View>

            {/* Row 3: Year From + Year To */}
            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>{t.home.yearFrom}</Text>
                <Pressable
                  style={styles.selectInput}
                  onPress={() => openPicker(t.home.yearFrom, YEAR_OPTIONS, yearFrom, setYearFrom)}
                >
                  <Text style={[styles.selectText, !yearFrom && styles.selectPlaceholder]} numberOfLines={1}>
                    {yearFrom || t.home.minYear}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
                </Pressable>
              </View>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>{t.home.yearTo}</Text>
                <Pressable
                  style={styles.selectInput}
                  onPress={() => openPicker(t.home.yearTo, YEAR_OPTIONS, yearTo, setYearTo)}
                >
                  <Text style={[styles.selectText, !yearTo && styles.selectPlaceholder]} numberOfLines={1}>
                    {yearTo || t.home.maxYear}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
                </Pressable>
              </View>
            </View>

            {/* Row 4: Mileage + Location */}
            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>{t.home.mileage}</Text>
                <Pressable
                  style={styles.selectInput}
                  onPress={() => openPicker(t.home.mileage, MILEAGE_OPTIONS, mileage, setMileage)}
                >
                  <Text style={[styles.selectText, !mileage && styles.selectPlaceholder]} numberOfLines={1}>
                    {getDisplayValue(mileage, MILEAGE_OPTIONS, t.home.maxMileage)}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
                </Pressable>
              </View>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>{t.home.location}</Text>
                <Pressable
                  style={styles.selectInput}
                  onPress={() => openPicker(t.home.location, locationOptions, location, setLocation)}
                >
                  <Text style={[styles.selectText, !location && styles.selectPlaceholder]} numberOfLines={1}>
                    {location || t.home.anyLocation}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
                </Pressable>
              </View>
            </View>

            {/* Search Button */}
            <Pressable style={styles.searchButton} onPress={handleSearch}>
              <Ionicons name="search" size={18} color={COLORS.white} />
              <Text style={styles.searchButtonText}>{t.home.searchCars}</Text>
            </Pressable>

            {/* Advanced Search Link */}
            <Pressable onPress={() => router.push('/(tabs)/search')} style={styles.advancedLink}>
              <Text style={styles.advancedLinkText}>{t.home.advancedSearch}</Text>
            </Pressable>
          </View>

          <Text style={styles.availableText}>{t.home.availableCars}</Text>
        </View>

        {/* ── Interesting Suggestions ── */}
        {featuredCars.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="sparkles" size={18} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>{t.home.interestingSuggestions}</Text>
              </View>
              <Pressable
                style={styles.seeMoreButton}
                onPress={() => router.push('/(tabs)/search')}
              >
                <Text style={styles.seeMoreText}>{t.home.seeMore}</Text>
              </Pressable>
            </View>
            <Text style={styles.sectionSubtitle}>{t.home.suggestionsSubtitle}</Text>

            <FlatList
              data={featuredCars}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsRow}
              renderItem={({ item }) => (
                <View style={styles.suggestionCardWrap}>
                  <CarCard
                    car={item}
                    layout="suggestion"
                    onPress={() => router.push(`/car/${item.id}`)}
                    isSaved={savedIds.includes(item.id)}
                    onToggleSave={() => toggleSave(item.id)}
                  />
                </View>
              )}
            />
          </View>
        )}

        {/* ── Popular Brands ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderCentered}>
            <Text style={styles.sectionTitle}>{t.home.popularBrands}</Text>
            <Text style={styles.sectionSubtitle}>{t.home.popularBrandsSubtitle}</Text>
          </View>

          <View style={styles.brandsGrid}>
            {POPULAR_BRANDS.map((brand) => (
              <Pressable
                key={brand.name}
                style={styles.brandCard}
                onPress={() => handleBrandPress(brand.name)}
              >
                <View style={[styles.brandLogoCircle, { backgroundColor: brand.color + '10' }]}>
                  {BRAND_LOGOS[brand.name] ? (
                    <Image source={BRAND_LOGOS[brand.name]} style={styles.brandLogo} resizeMode="contain" />
                  ) : (
                    <Text style={[styles.brandInitials, { color: brand.color }]}>{brand.name[0]}</Text>
                  )}
                </View>
                <Text style={styles.brandName} numberOfLines={1}>{brand.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Recent Listings ── */}
        {recentCars.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t.home.recentListings}</Text>
              <Pressable
                style={styles.viewAllButton}
                onPress={() => router.push('/(tabs)/search')}
              >
                <Text style={styles.viewAllText}>{t.home.viewAll}</Text>
                <Ionicons name="arrow-forward" size={14} color={COLORS.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.recentGrid}>
              {recentCars.map((car: any) => (
                <View key={car.id} style={styles.recentGridItem}>
                  <CarCard
                    car={car}
                    onPress={() => router.push(`/car/${car.id}`)}
                    isSaved={savedIds.includes(car.id)}
                    onToggleSave={() => toggleSave(car.id)}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Empty state */}
        {featuredCars.length === 0 && recentCars.length === 0 && !isLoading && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="car-outline" size={48} color={COLORS.zinc400} />
            </View>
            <Text style={styles.emptyText}>{t.home.noListings}</Text>
          </View>
        )}
      </ScrollView>

      {/* ── Picker Modal ── */}
      <Modal visible={pickerModal.visible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setPickerModal(p => ({ ...p, visible: false }))}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{pickerModal.title}</Text>
              <Pressable onPress={() => setPickerModal(p => ({ ...p, visible: false }))}>
                <Ionicons name="close" size={22} color={COLORS.text} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll}>
              {/* Clear / Any option */}
              <Pressable
                style={[styles.modalOption, !pickerModal.selected && styles.modalOptionSelected]}
                onPress={() => {
                  pickerModal.onSelect('');
                  setPickerModal(p => ({ ...p, visible: false }));
                }}
              >
                <Text style={[styles.modalOptionText, !pickerModal.selected && styles.modalOptionTextSelected]}>
                  {t.common.any}
                </Text>
                {!pickerModal.selected && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
              </Pressable>

              {pickerModal.options.map((opt) => (
                <Pressable
                  key={opt.value}
                  style={[styles.modalOption, pickerModal.selected === opt.value && styles.modalOptionSelected]}
                  onPress={() => {
                    pickerModal.onSelect(opt.value);
                    setPickerModal(p => ({ ...p, visible: false }));
                  }}
                >
                  <Text
                    style={[styles.modalOptionText, pickerModal.selected === opt.value && styles.modalOptionTextSelected]}
                    numberOfLines={1}
                  >
                    {opt.label}
                  </Text>
                  {pickerModal.selected === opt.value && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.backgroundMuted,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundMuted,
  },

  // Hero
  heroSection: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  heroSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    maxWidth: 320,
  },

  // Search Card
  searchCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    padding: SPACING.md,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.borderZinc,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  vehicleTypeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  vehicleTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.zinc100,
  },
  vehicleTypeBtnActive: {
    backgroundColor: COLORS.black,
  },
  vehicleTypeBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  vehicleTypeBtnTextActive: {
    color: COLORS.white,
  },

  // Form
  formRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  formField: {
    flex: 1,
    marginBottom: SPACING.sm,
  },
  fieldLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginBottom: 4,
    marginLeft: 4,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.zinc100,
    borderRadius: BORDER_RADIUS.full,
    height: 44,
    paddingHorizontal: 14,
  },
  selectText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    flex: 1,
  },
  selectPlaceholder: {
    color: COLORS.textMuted,
  },
  selectInputDisabled: {
    opacity: 0.5,
  },

  // Search button
  searchButton: {
    backgroundColor: COLORS.black,
    borderRadius: BORDER_RADIUS.full,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
  },
  advancedLink: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  advancedLinkText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
  availableText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },

  // Sections
  section: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sectionHeaderCentered: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '500',
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  seeMoreButton: {
    borderWidth: 1,
    borderColor: COLORS.borderZinc,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  seeMoreText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },

  // Suggestions
  suggestionsRow: {
    paddingTop: SPACING.md,
    paddingRight: SPACING.md,
    gap: SPACING.sm,
  },
  suggestionCardWrap: {
    width: 280,
  },

  // Brands
  brandsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  brandCard: {
    width: '31%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    borderWidth: 1,
    borderColor: COLORS.borderZinc,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  brandLogoCircle: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogo: {
    width: 32,
    height: 32,
  },
  brandInitials: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  brandName: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
    color: COLORS.text,
  },

  // Recent grid
  recentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  recentGridItem: {
    width: '48.5%',
  },

  // Empty
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyIcon: {
    backgroundColor: COLORS.zinc100,
    borderRadius: BORDER_RADIUS.full,
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted,
  },

  // Picker modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS['2xl'],
    borderTopRightRadius: BORDER_RADIUS['2xl'],
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderZinc,
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalScroll: {
    paddingHorizontal: SPACING.md,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderZinc,
  },
  modalOptionSelected: {
    backgroundColor: COLORS.zinc50,
  },
  modalOptionText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    flex: 1,
  },
  modalOptionTextSelected: {
    fontWeight: '600',
    color: COLORS.primary,
  },
});
