import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, TextInput, Pressable, Modal,
  ScrollView, RefreshControl, Switch,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../src/constants/theme';
import { formatEnum, translateEnum } from '../../src/utils/formatters';
import { CarCard } from '../../src/components/CarCard';
import { CarFilter } from '../../src/types';
import { CAR_MAKES, CAR_MODELS_BY_MAKE, POPULAR_MAKE_NAMES } from '../../src/constants/car-data';
import { MUNICIPALITIES_MK } from '../../src/constants/locations';
import { FuelType, TransmissionType, CarCondition, VehicleType, DrivetrainType } from '../../src/constants/enums';
import { useSavedCarIds, useToggleSave } from '../../src/hooks/useSaveCar';
import { useLocation } from '../../src/hooks/useLocation';
import { useLanguage } from '../../src/context/LanguageContext';

const SEARCH_CARS = gql`
  query SearchCars($filters: CarFilterInput) {
    getCars(filters: $filters) {
      id make model year price mileage fuelType transmission
      location condition isAvailable isFeatured createdAt
      images { id url isMain sortOrder }
      seller { id name role dealerName dealerLogoUrl }
    }
  }
`;

// ── Data Constants ──────────────────────────────────────────────

const SORT_OPTION_KEYS = [
  { key: 'sortNewestFirst' as const, sortBy: 'createdAt', sortOrder: 'DESC' },
  { key: 'sortPriceLowHigh' as const, sortBy: 'price', sortOrder: 'ASC' },
  { key: 'sortPriceHighLow' as const, sortBy: 'price', sortOrder: 'DESC' },
  { key: 'sortYearNewest' as const, sortBy: 'year', sortOrder: 'DESC' },
  { key: 'sortYearOldest' as const, sortBy: 'year', sortOrder: 'ASC' },
  { key: 'sortMileageLow' as const, sortBy: 'mileage', sortOrder: 'ASC' },
];

const YEAR_OPTIONS = (() => {
  const current = new Date().getFullYear();
  const years: number[] = [];
  for (let y = current + 1; y >= 1990; y--) years.push(y);
  return years;
})();

const PRICE_PRESETS = [1000, 2000, 5000, 10000, 15000, 20000, 30000, 50000, 75000, 100000];

const MILEAGE_OPTIONS = [
  { label: '0 km', value: '0' },
  { label: '10,000 km', value: '10000' },
  { label: '25,000 km', value: '25000' },
  { label: '50,000 km', value: '50000' },
  { label: '100,000 km', value: '100000' },
  { label: '150,000 km', value: '150000' },
  { label: '200,000 km', value: '200000' },
  { label: '250,000 km', value: '250000' },
  { label: '300,000 km', value: '300000' },
];

const POWER_OPTIONS = [
  { label: '50 HP', value: '50' },
  { label: '75 HP', value: '75' },
  { label: '100 HP', value: '100' },
  { label: '150 HP', value: '150' },
  { label: '200 HP', value: '200' },
  { label: '250 HP', value: '250' },
  { label: '300 HP', value: '300' },
  { label: '400 HP', value: '400' },
  { label: '500 HP', value: '500' },
];

const ENGINE_SIZE_OPTIONS = [
  { label: '0.8 L', value: '0.8' },
  { label: '1.0 L', value: '1.0' },
  { label: '1.2 L', value: '1.2' },
  { label: '1.4 L', value: '1.4' },
  { label: '1.6 L', value: '1.6' },
  { label: '1.8 L', value: '1.8' },
  { label: '2.0 L', value: '2.0' },
  { label: '2.5 L', value: '2.5' },
  { label: '3.0 L', value: '3.0' },
  { label: '4.0 L', value: '4.0' },
  { label: '5.0 L', value: '5.0' },
];

const DOOR_OPTIONS = [
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
];

const SEAT_OPTIONS = [
  { label: '2', value: '2' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '7', value: '7' },
  { label: '9+', value: '9' },
];

const COLOR_KEYS = ['Black', 'White', 'Silver', 'Gray', 'Blue', 'Red', 'Green', 'Brown', 'Yellow', 'Orange', 'Beige', 'Gold'];

type PickerField =
  | 'make' | 'model' | 'fuelType' | 'transmission' | 'condition' | 'vehicleType'
  | 'drivetrain' | 'location' | 'color' | 'doors' | 'seats' | 'sellerType'
  | 'minYear' | 'maxYear' | 'minMileage' | 'maxMileage'
  | 'minHorsePower' | 'maxHorsePower' | 'minEngineSize' | 'maxEngineSize'
  | 'sortBy';

// ── Collapsible Filter Section ──────────────────────────────────

function FilterSection({ title, icon, children, defaultOpen = true }: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={styles.filterSectionCard}>
      <Pressable style={styles.filterSectionHeader} onPress={() => setOpen(!open)}>
        <View style={styles.filterSectionHeaderLeft}>
          <View style={styles.filterSectionIconWrap}>
            <Ionicons name={icon} size={16} color={COLORS.primary} />
          </View>
          <Text style={styles.filterSectionHeaderText}>{title}</Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textMuted} />
      </Pressable>
      {open && <View style={styles.filterSectionBody}>{children}</View>}
    </View>
  );
}

// ── Toggle Row ──────────────────────────────────────────────────

function ToggleRow({ label, value, onToggle }: { label: string; value?: boolean; onToggle: (v: boolean) => void }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value ?? false}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.zinc200, true: COLORS.primary }}
        thumbColor={COLORS.white}
      />
    </View>
  );
}

// ── Component ─────────────────────────────────────────────────────

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    make?: string; model?: string; minPrice?: string; maxPrice?: string;
    minYear?: string; maxYear?: string; maxMileage?: string; location?: string;
    vehicleType?: string;
  }>();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<CarFilter>({});
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const { savedIds } = useSavedCarIds();
  const { toggleSave } = useToggleSave();
  const { location: userLocation, loading: locationLoading, requestLocation } = useLocation();
  const [pickerField, setPickerField] = useState<PickerField>('make');
  const [refreshing, setRefreshing] = useState(false);

  // Apply incoming search params from home screen
  const lastAppliedParams = useRef('');
  useEffect(() => {
    const incoming: CarFilter = {};
    if (params.make) incoming.make = params.make;
    if (params.model) incoming.model = params.model;
    if (params.minPrice) incoming.minPrice = Number(params.minPrice);
    if (params.maxPrice) incoming.maxPrice = Number(params.maxPrice);
    if (params.minYear) incoming.minYear = Number(params.minYear);
    if (params.maxYear) incoming.maxYear = Number(params.maxYear);
    if (params.maxMileage) incoming.maxMileage = Number(params.maxMileage);
    if (params.location) incoming.location = params.location;
    if (params.vehicleType) incoming.vehicleType = params.vehicleType as any;
    if (Object.keys(incoming).length > 0) {
      const key = JSON.stringify(incoming);
      if (key !== lastAppliedParams.current) {
        setFilters(incoming);
        lastAppliedParams.current = key;
      }
    }
  }, [params]);

  const [draftFilters, setDraftFilters] = useState<CarFilter>({});
  const [draftSortBy, setDraftSortBy] = useState('createdAt');
  const [draftSortOrder, setDraftSortOrder] = useState('DESC');

  // Dynamic model options
  const modelOptions = useMemo(() => {
    const make = draftFilters.make;
    if (!make) return [];
    return (CAR_MODELS_BY_MAKE[make] || []).map((m) => ({ label: m, value: m }));
  }, [draftFilters.make]);

  // Location options
  const locationOptions = useMemo(() => {
    return MUNICIPALITIES_MK.map((loc) => ({ label: loc.label, value: loc.value }));
  }, []);

  // Color options (translated)
  const colorOptions = useMemo(() => {
    return COLOR_KEYS.map((c) => ({ label: t.enums.colors[c] || c, value: c }));
  }, [t.enums.colors]);

  const filterInput: Record<string, unknown> = {};
  if (filters.make) filterInput.make = filters.make;
  if (filters.model) filterInput.model = filters.model;
  if (filters.minPrice) filterInput.minPrice = filters.minPrice;
  if (filters.maxPrice) filterInput.maxPrice = filters.maxPrice;
  if (filters.minYear) filterInput.minYear = filters.minYear;
  if (filters.maxYear) filterInput.maxYear = filters.maxYear;
  if (filters.fuelType) filterInput.fuelType = filters.fuelType;
  if (filters.transmission) filterInput.transmission = filters.transmission;
  if (filters.condition) filterInput.condition = filters.condition;
  if (filters.vehicleType) filterInput.vehicleType = filters.vehicleType;
  if (filters.drivetrain) filterInput.drivetrain = filters.drivetrain;
  if (filters.location) filterInput.location = filters.location;
  if (filters.color) filterInput.color = filters.color;
  if (filters.minMileage) filterInput.minMileage = filters.minMileage;
  if (filters.maxMileage) filterInput.maxMileage = filters.maxMileage;
  if (filters.minHorsePower) filterInput.minHorsePower = filters.minHorsePower;
  if (filters.maxHorsePower) filterInput.maxHorsePower = filters.maxHorsePower;
  if (filters.minEngineSize) filterInput.minEngineSize = filters.minEngineSize;
  if (filters.maxEngineSize) filterInput.maxEngineSize = filters.maxEngineSize;
  if (filters.doors) filterInput.doors = filters.doors;
  if (filters.seats) filterInput.seats = filters.seats;
  if (filters.sellerType) filterInput.sellerType = filters.sellerType;
  if (filters.allowTestDrive !== undefined) filterInput.allowTestDrive = filters.allowTestDrive;
  if (filters.acceptsTradeIn !== undefined) filterInput.acceptsTradeIn = filters.acceptsTradeIn;
  if (filters.priceNegotiable !== undefined) filterInput.priceNegotiable = filters.priceNegotiable;

  // Note: sorting, pagination, and text search are handled client-side since the
  // production backend's CarFilterInput doesn't support limit/offset/sortBy/sortOrder/query.

  const variables = { filters: Object.keys(filterInput).length > 0 ? filterInput : undefined };

  const { data, loading, error, refetch } = useQuery(SEARCH_CARS, { variables });

  const rawCars = (data as any)?.getCars || [];

  // Client-side text search + sorting
  const cars = useMemo(() => {
    let filtered = rawCars;
    const q = query.trim().toLowerCase();
    if (q) {
      filtered = rawCars.filter((c: any) =>
        `${c.make} ${c.model} ${c.location || ''}`.toLowerCase().includes(q),
      );
    }
    const sorted = [...filtered];
    sorted.sort((a: any, b: any) => {
      const aVal = a[sortBy] ?? '';
      const bVal = b[sortBy] ?? '';
      if (sortOrder === 'ASC') return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    });
    return sorted;
  }, [rawCars, sortBy, sortOrder, query]);
  const total = cars.length;

  const activeFilterCount = Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '' && v !== false).length;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // No server-side pagination — all results returned at once

  const openPicker = (field: PickerField) => {
    setPickerField(field);
    setPickerVisible(true);
  };

  const getPickerOptions = (): { label: string; value: string }[] => {
    switch (pickerField) {
      case 'make':
        return CAR_MAKES.map((m) => ({ label: m, value: m }));
      case 'model':
        return modelOptions;
      case 'fuelType':
        return Object.values(FuelType).map((v) => ({ label: translateEnum('fuelTypes', v, t.enums), value: v }));
      case 'transmission':
        return Object.values(TransmissionType).map((v) => ({ label: translateEnum('transmissions', v, t.enums), value: v }));
      case 'condition':
        return Object.values(CarCondition).map((v) => ({ label: translateEnum('conditions', v, t.enums), value: v }));
      case 'vehicleType':
        return Object.values(VehicleType).map((v) => ({ label: translateEnum('vehicleTypes', v, t.enums), value: v }));
      case 'drivetrain':
        return Object.values(DrivetrainType).map((v) => ({ label: translateEnum('drivetrains', v, t.enums), value: v }));
      case 'location':
        return locationOptions;
      case 'color':
        return colorOptions;
      case 'doors':
        return DOOR_OPTIONS;
      case 'seats':
        return SEAT_OPTIONS;
      case 'sellerType':
        return [
          { label: t.search.sellerPrivate, value: 'USER' },
          { label: t.search.sellerDealer, value: 'DEALER' },
        ];
      case 'minYear':
      case 'maxYear':
        return YEAR_OPTIONS.map((y) => ({ label: String(y), value: String(y) }));
      case 'minMileage':
      case 'maxMileage':
        return MILEAGE_OPTIONS;
      case 'minHorsePower':
      case 'maxHorsePower':
        return POWER_OPTIONS;
      case 'minEngineSize':
      case 'maxEngineSize':
        return ENGINE_SIZE_OPTIONS;
      case 'sortBy':
        return SORT_OPTION_KEYS.map((o) => ({ label: t.search[o.key], value: `${o.sortBy}|${o.sortOrder}` }));
      default:
        return [];
    }
  };

  const numericFields: PickerField[] = [
    'minYear', 'maxYear', 'minMileage', 'maxMileage',
    'minHorsePower', 'maxHorsePower', 'doors', 'seats',
  ];
  const floatFields: PickerField[] = ['minEngineSize', 'maxEngineSize'];

  const handlePickerSelect = (value: string) => {
    if (pickerField === 'sortBy') {
      const [sb, so] = value.split('|');
      setDraftSortBy(sb);
      setDraftSortOrder(so);
    } else if (pickerField === 'make') {
      setDraftFilters((f) => ({ ...f, make: value, model: undefined }));
    } else if (numericFields.includes(pickerField)) {
      setDraftFilters((f) => ({ ...f, [pickerField]: parseInt(value) }));
    } else if (floatFields.includes(pickerField)) {
      setDraftFilters((f) => ({ ...f, [pickerField]: parseFloat(value) }));
    } else {
      setDraftFilters((f) => ({ ...f, [pickerField]: value }));
    }
    setPickerVisible(false);
  };

  const getFilterDisplay = (field: PickerField): string => {
    if (field === 'sortBy') {
      const opt = SORT_OPTION_KEYS.find((o) => o.sortBy === draftSortBy && o.sortOrder === draftSortOrder);
      return opt ? t.search[opt.key] : t.search.sortNewestFirst;
    }
    const val = draftFilters[field as keyof CarFilter];
    if (val === undefined || val === '') return t.common.any;
    if (numericFields.includes(field) || floatFields.includes(field)) return String(val);
    const enumMap: Record<string, 'fuelTypes' | 'transmissions' | 'conditions' | 'vehicleTypes' | 'drivetrains' | 'colors'> = {
      fuelType: 'fuelTypes',
      transmission: 'transmissions',
      condition: 'conditions',
      vehicleType: 'vehicleTypes',
      drivetrain: 'drivetrains',
      color: 'colors',
    };
    const category = enumMap[field];
    if (category) return translateEnum(category, String(val), t.enums);
    if (field === 'sellerType') return val === 'DEALER' ? t.search.sellerDealer : t.search.sellerPrivate;
    return formatEnum(String(val));
  };

  const getPickerTitle = (): string => {
    const titleMap: Partial<Record<PickerField, string>> = {
      sortBy: t.search.sortBy,
      make: t.search.filterMake,
      model: t.search.filterModel,
      fuelType: t.search.filterFuelType,
      transmission: t.search.filterTransmission,
      condition: t.search.filterCondition,
      vehicleType: t.search.filterVehicleType,
      drivetrain: t.search.filterDrivetrain,
      location: t.search.filterLocation,
      color: t.search.filterColor,
      doors: t.search.filterDoors,
      seats: t.search.filterSeats,
      sellerType: t.search.filterSellerType,
      minYear: t.search.fromYear,
      maxYear: t.search.toYear,
      minMileage: t.search.mileageFrom,
      maxMileage: t.search.mileageTo,
      minHorsePower: t.search.powerFrom,
      maxHorsePower: t.search.powerTo,
      minEngineSize: t.search.engineFrom,
      maxEngineSize: t.search.engineTo,
    };
    return titleMap[pickerField] || formatEnum(pickerField);
  };

  const openFilters = () => {
    setDraftFilters({ ...filters });
    setDraftSortBy(sortBy);
    setDraftSortOrder(sortOrder);
    setFiltersVisible(true);
  };

  const applyFilters = () => {
    setFilters({ ...draftFilters });
    setSortBy(draftSortBy);
    setSortOrder(draftSortOrder);
    setFiltersVisible(false);
  };

  const clearFilters = () => {
    setDraftFilters({});
    setDraftSortBy('createdAt');
    setDraftSortOrder('DESC');
  };

  const removeFilter = (key: keyof CarFilter) => {
    const updated = { ...filters };
    delete updated[key];
    setFilters(updated);
  };

  // Filter chip label map
  const getChipLabel = (key: string): string => {
    const labelMap: Record<string, string> = {
      make: t.search.filterMake,
      model: t.search.filterModel,
      fuelType: t.search.filterFuelType,
      transmission: t.search.filterTransmission,
      condition: t.search.filterCondition,
      vehicleType: t.search.filterVehicleType,
      drivetrain: t.search.filterDrivetrain,
      location: t.search.filterLocation,
      color: t.search.filterColor,
      doors: t.search.filterDoors,
      seats: t.search.filterSeats,
      sellerType: t.search.filterSellerType,
      minYear: t.search.fromYear,
      maxYear: t.search.toYear,
      minPrice: t.common.min,
      maxPrice: t.common.max,
      minMileage: t.search.mileageFrom,
      maxMileage: t.search.mileageTo,
      minHorsePower: t.search.powerFrom,
      maxHorsePower: t.search.powerTo,
      minEngineSize: t.search.engineFrom,
      maxEngineSize: t.search.engineTo,
      allowTestDrive: t.search.testDriveAvailable,
      acceptsTradeIn: t.search.tradeInAccepted,
      priceNegotiable: t.search.priceNegotiableFilter,
    };
    return labelMap[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
  };

  const getChipDisplay = (key: string, value: unknown): string => {
    if (typeof value === 'boolean') return value ? t.common.yes : t.common.no;
    if (typeof value === 'number') return String(value);
    const enumMap: Record<string, 'fuelTypes' | 'transmissions' | 'conditions' | 'vehicleTypes' | 'drivetrains' | 'colors'> = {
      fuelType: 'fuelTypes', transmission: 'transmissions', condition: 'conditions',
      vehicleType: 'vehicleTypes', drivetrain: 'drivetrains', color: 'colors',
    };
    const cat = enumMap[key];
    if (cat) return translateEnum(cat, String(value), t.enums);
    if (key === 'sellerType') return value === 'DEALER' ? t.search.sellerDealer : t.search.sellerPrivate;
    return formatEnum(String(value));
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t.search.placeholder}
            placeholderTextColor={COLORS.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} style={styles.clearSearch}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <Pressable style={styles.pillButton} onPress={openFilters}>
          <Ionicons name="options-outline" size={16} color={COLORS.text} />
          <Text style={styles.pillButtonText}>{t.search.filters}</Text>
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>

        <Pressable
          style={styles.pillButton}
          onPress={() => {
            setDraftSortBy(sortBy);
            setDraftSortOrder(sortOrder);
            setPickerField('sortBy');
            setPickerVisible(true);
          }}
        >
          <Ionicons name="swap-vertical-outline" size={16} color={COLORS.text} />
          <Text style={styles.pillButtonText}>{t.common.sort}</Text>
        </Pressable>

        <Pressable
          style={[styles.pillButton, userLocation && styles.pillButtonActive]}
          onPress={async () => {
            const loc = await requestLocation();
            if (loc?.city) {
              setFilters((f) => ({ ...f, location: loc.city }));
            }
          }}
          disabled={locationLoading}
        >
          {locationLoading ? (
            <ActivityIndicator size={14} color={COLORS.black} />
          ) : (
            <Ionicons name="location-outline" size={16} color={userLocation ? COLORS.white : COLORS.text} />
          )}
          <Text style={[styles.pillButtonText, userLocation && styles.pillButtonTextActive]}>
            {userLocation?.city || t.search.nearMe}
          </Text>
        </Pressable>

        <View style={styles.layoutToggleContainer}>
          <Pressable
            style={[styles.layoutToggleBtn, layout === 'grid' && styles.layoutToggleBtnActive]}
            onPress={() => setLayout('grid')}
          >
            <Ionicons name="grid-outline" size={16} color={layout === 'grid' ? COLORS.white : COLORS.textMuted} />
          </Pressable>
          <Pressable
            style={[styles.layoutToggleBtn, layout === 'list' && styles.layoutToggleBtnActive]}
            onPress={() => setLayout('list')}
          >
            <Ionicons name="list-outline" size={16} color={layout === 'list' ? COLORS.white : COLORS.textMuted} />
          </Pressable>
        </View>
      </View>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipScrollContent}>
          {Object.entries(filters).map(([key, value]) => {
            if (value === undefined || value === '' || value === false) return null;
            return (
              <Pressable key={key} style={styles.activeChip} onPress={() => removeFilter(key as keyof CarFilter)}>
                <Text style={styles.activeChipText}>{getChipLabel(key)}: {getChipDisplay(key, value)}</Text>
                <Ionicons name="close" size={12} color={COLORS.text} />
              </Pressable>
            );
          })}
          <Pressable style={styles.clearChip} onPress={() => setFilters({})}>
            <Text style={styles.clearChipText}>{t.common.clearAll}</Text>
          </Pressable>
        </ScrollView>
      )}

      {/* Results Count */}
      <View style={styles.resultDivider}>
        <Text style={styles.resultCountText}>
          {loading ? t.search.searching : t.search.resultsCount.replace('{count}', String(total))}
        </Text>
      </View>

      {/* Results */}
      {layout === 'grid' ? (
        <FlatList
          data={cars}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <CarCard car={item} onPress={() => router.push(`/car/${item.id}`)} isSaved={savedIds.includes(item.id)} onToggleSave={() => toggleSave(item.id)} />
            </View>
          )}
          ListEmptyComponent={
            loading ? (
              <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>
            ) : error ? (
              <View style={styles.centered}>
                <View style={styles.emptyIcon}><Ionicons name="cloud-offline-outline" size={48} color={COLORS.zinc400} /></View>
                <Text style={styles.emptyText}>{t.common.error}</Text>
              </View>
            ) : (
              <View style={styles.centered}>
                <View style={styles.emptyIcon}><Ionicons name="car-outline" size={48} color={COLORS.zinc400} /></View>
                <Text style={styles.emptyText}>{t.search.noCarsFound}</Text>
                <Text style={styles.emptySubText}>{t.search.tryAdjusting}</Text>
              </View>
            )
          }
          ListFooterComponent={
            cars.length > 0 && cars.length < total ? (
              <View style={styles.loadingMore}><ActivityIndicator size="small" color={COLORS.primary} /></View>
            ) : null
          }
        />
      ) : (
        <FlatList
          data={cars}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => (
            <CarCard car={item} onPress={() => router.push(`/car/${item.id}`)} layout="list" isSaved={savedIds.includes(item.id)} onToggleSave={() => toggleSave(item.id)} />
          )}
          ListEmptyComponent={
            loading ? (
              <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>
            ) : error ? (
              <View style={styles.centered}>
                <View style={styles.emptyIcon}><Ionicons name="cloud-offline-outline" size={48} color={COLORS.zinc400} /></View>
                <Text style={styles.emptyText}>{t.common.error}</Text>
              </View>
            ) : (
              <View style={styles.centered}>
                <View style={styles.emptyIcon}><Ionicons name="car-outline" size={48} color={COLORS.zinc400} /></View>
                <Text style={styles.emptyText}>{t.search.noCarsFound}</Text>
                <Text style={styles.emptySubText}>{t.search.tryAdjusting}</Text>
              </View>
            )
          }
          ListFooterComponent={
            cars.length > 0 && cars.length < total ? (
              <View style={styles.loadingMore}><ActivityIndicator size="small" color={COLORS.primary} /></View>
            ) : null
          }
        />
      )}

      {/* ── Filter Modal (Advanced Search) ── */}
      <Modal visible={filtersVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setFiltersVisible(false)} style={styles.modalHeaderBtn}>
              <Text style={styles.modalCancel}>{t.common.cancel}</Text>
            </Pressable>
            <Text style={styles.modalTitle}>{t.search.filters}</Text>
            <Pressable onPress={clearFilters} style={styles.modalHeaderBtn}>
              <Text style={styles.modalClear}>{t.common.clear}</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalBody} contentContainerStyle={styles.modalBodyContent}>
            {/* Sort */}
            <Text style={styles.filterFieldLabel}>{t.search.sortBy}</Text>
            <Pressable style={styles.filterSelect} onPress={() => openPicker('sortBy')}>
              <Text style={styles.filterSelectText}>{getFilterDisplay('sortBy')}</Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
            </Pressable>

            {/* ── Section 1: Basic Information ── */}
            <FilterSection title={t.search.sectionBasicInfo} icon="car-outline">
              {/* Make */}
              <Text style={styles.filterFieldLabel}>{t.search.filterMake}</Text>
              <Pressable style={styles.filterSelect} onPress={() => openPicker('make')}>
                <Text style={styles.filterSelectText}>{draftFilters.make || t.search.allMakes}</Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
              </Pressable>

              {/* Model */}
              <Text style={styles.filterFieldLabel}>{t.search.filterModel}</Text>
              <Pressable
                style={[styles.filterSelect, !draftFilters.make && styles.filterSelectDisabled]}
                onPress={() => draftFilters.make && openPicker('model')}
              >
                <Text style={styles.filterSelectText}>{draftFilters.model || t.search.allModels}</Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
              </Pressable>

              {/* Vehicle Type */}
              <Text style={styles.filterFieldLabel}>{t.search.filterVehicleType}</Text>
              <Pressable style={styles.filterSelect} onPress={() => openPicker('vehicleType')}>
                <Text style={styles.filterSelectText}>{getFilterDisplay('vehicleType')}</Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
              </Pressable>

              {/* Condition */}
              <Text style={styles.filterFieldLabel}>{t.search.filterCondition}</Text>
              <Pressable style={styles.filterSelect} onPress={() => openPicker('condition')}>
                <Text style={styles.filterSelectText}>{getFilterDisplay('condition')}</Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
              </Pressable>

              {/* Color */}
              <Text style={styles.filterFieldLabel}>{t.search.filterColor}</Text>
              <Pressable style={styles.filterSelect} onPress={() => openPicker('color')}>
                <Text style={styles.filterSelectText}>{draftFilters.color ? (t.enums.colors[draftFilters.color] || draftFilters.color) : t.search.anyColor}</Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
              </Pressable>
            </FilterSection>

            {/* ── Section 2: Registration & Price ── */}
            <FilterSection title={t.search.sectionPriceYear} icon="pricetag-outline">
              {/* Year */}
              <Text style={styles.filterFieldLabel}>{t.search.filterYear}</Text>
              <View style={styles.rangeRow}>
                <Pressable style={styles.filterSelectHalf} onPress={() => openPicker('minYear')}>
                  <Text style={styles.filterSelectText}>{draftFilters.minYear || t.common.from}</Text>
                  <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
                </Pressable>
                <Text style={styles.rangeDash}>—</Text>
                <Pressable style={styles.filterSelectHalf} onPress={() => openPicker('maxYear')}>
                  <Text style={styles.filterSelectText}>{draftFilters.maxYear || t.common.to}</Text>
                  <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
                </Pressable>
              </View>

              {/* Price */}
              <Text style={styles.filterFieldLabel}>{t.search.filterPrice}</Text>
              <View style={styles.rangeRow}>
                <View style={styles.priceInputWrapper}>
                  <TextInput
                    style={styles.priceInput}
                    placeholder={t.common.min}
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="numeric"
                    value={draftFilters.minPrice ? String(draftFilters.minPrice) : ''}
                    onChangeText={(txt) => setDraftFilters((f) => ({ ...f, minPrice: txt ? parseInt(txt) || undefined : undefined }))}
                  />
                </View>
                <Text style={styles.rangeDash}>—</Text>
                <View style={styles.priceInputWrapper}>
                  <TextInput
                    style={styles.priceInput}
                    placeholder={t.common.max}
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="numeric"
                    value={draftFilters.maxPrice ? String(draftFilters.maxPrice) : ''}
                    onChangeText={(txt) => setDraftFilters((f) => ({ ...f, maxPrice: txt ? parseInt(txt) || undefined : undefined }))}
                  />
                </View>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
                {PRICE_PRESETS.map((p) => (
                  <Pressable
                    key={p}
                    style={[styles.presetChip, draftFilters.maxPrice === p && styles.presetChipActive]}
                    onPress={() => setDraftFilters((f) => ({ ...f, maxPrice: f.maxPrice === p ? undefined : p }))}
                  >
                    <Text style={[styles.presetChipText, draftFilters.maxPrice === p && styles.presetChipTextActive]}>
                      €{p.toLocaleString('de-DE')}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </FilterSection>

            {/* ── Section 3: Location ── */}
            <FilterSection title={t.search.sectionLocation} icon="location-outline" defaultOpen={false}>
              <Text style={styles.filterFieldLabel}>{t.search.filterLocation}</Text>
              <Pressable style={styles.filterSelect} onPress={() => openPicker('location')}>
                <Text style={styles.filterSelectText}>{draftFilters.location || t.search.anyLocation}</Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
              </Pressable>
            </FilterSection>

            {/* ── Section 4: Technical Specifications ── */}
            <FilterSection title={t.search.sectionTechnical} icon="settings-outline" defaultOpen={false}>
              {/* Fuel Type */}
              <Text style={styles.filterFieldLabel}>{t.search.filterFuelType}</Text>
              <Pressable style={styles.filterSelect} onPress={() => openPicker('fuelType')}>
                <Text style={styles.filterSelectText}>{getFilterDisplay('fuelType')}</Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
              </Pressable>

              {/* Transmission */}
              <Text style={styles.filterFieldLabel}>{t.search.filterTransmission}</Text>
              <Pressable style={styles.filterSelect} onPress={() => openPicker('transmission')}>
                <Text style={styles.filterSelectText}>{getFilterDisplay('transmission')}</Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
              </Pressable>

              {/* Drivetrain */}
              <Text style={styles.filterFieldLabel}>{t.search.filterDrivetrain}</Text>
              <Pressable style={styles.filterSelect} onPress={() => openPicker('drivetrain')}>
                <Text style={styles.filterSelectText}>{getFilterDisplay('drivetrain')}</Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
              </Pressable>

              {/* Mileage */}
              <Text style={styles.filterFieldLabel}>{t.search.filterMileage}</Text>
              <View style={styles.rangeRow}>
                <Pressable style={styles.filterSelectHalf} onPress={() => openPicker('minMileage')}>
                  <Text style={styles.filterSelectText}>
                    {draftFilters.minMileage ? `${draftFilters.minMileage.toLocaleString('de-DE')} km` : t.common.from}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
                </Pressable>
                <Text style={styles.rangeDash}>—</Text>
                <Pressable style={styles.filterSelectHalf} onPress={() => openPicker('maxMileage')}>
                  <Text style={styles.filterSelectText}>
                    {draftFilters.maxMileage ? `${draftFilters.maxMileage.toLocaleString('de-DE')} km` : t.common.to}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
                </Pressable>
              </View>

              {/* Power */}
              <Text style={styles.filterFieldLabel}>{t.search.filterPower}</Text>
              <View style={styles.rangeRow}>
                <Pressable style={styles.filterSelectHalf} onPress={() => openPicker('minHorsePower')}>
                  <Text style={styles.filterSelectText}>
                    {draftFilters.minHorsePower ? `${draftFilters.minHorsePower} HP` : t.common.from}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
                </Pressable>
                <Text style={styles.rangeDash}>—</Text>
                <Pressable style={styles.filterSelectHalf} onPress={() => openPicker('maxHorsePower')}>
                  <Text style={styles.filterSelectText}>
                    {draftFilters.maxHorsePower ? `${draftFilters.maxHorsePower} HP` : t.common.to}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
                </Pressable>
              </View>

              {/* Engine Size */}
              <Text style={styles.filterFieldLabel}>{t.search.filterEngineSize}</Text>
              <View style={styles.rangeRow}>
                <Pressable style={styles.filterSelectHalf} onPress={() => openPicker('minEngineSize')}>
                  <Text style={styles.filterSelectText}>
                    {draftFilters.minEngineSize ? `${draftFilters.minEngineSize} L` : t.common.from}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
                </Pressable>
                <Text style={styles.rangeDash}>—</Text>
                <Pressable style={styles.filterSelectHalf} onPress={() => openPicker('maxEngineSize')}>
                  <Text style={styles.filterSelectText}>
                    {draftFilters.maxEngineSize ? `${draftFilters.maxEngineSize} L` : t.common.to}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
                </Pressable>
              </View>

              {/* Doors + Seats */}
              <View style={styles.rangeRow}>
                <View style={styles.flex1}>
                  <Text style={styles.filterFieldLabel}>{t.search.filterDoors}</Text>
                  <Pressable style={styles.filterSelect} onPress={() => openPicker('doors')}>
                    <Text style={styles.filterSelectText}>{draftFilters.doors || t.search.anyDoors}</Text>
                    <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
                  </Pressable>
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.filterFieldLabel}>{t.search.filterSeats}</Text>
                  <Pressable style={styles.filterSelect} onPress={() => openPicker('seats')}>
                    <Text style={styles.filterSelectText}>{draftFilters.seats || t.search.anySeats}</Text>
                    <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
                  </Pressable>
                </View>
              </View>
            </FilterSection>

            {/* ── Section 5: Seller & Options ── */}
            <FilterSection title={t.search.sectionSellerOptions} icon="person-outline" defaultOpen={false}>
              <Text style={styles.filterFieldLabel}>{t.search.filterSellerType}</Text>
              <Pressable style={styles.filterSelect} onPress={() => openPicker('sellerType')}>
                <Text style={styles.filterSelectText}>{getFilterDisplay('sellerType')}</Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
              </Pressable>

              <ToggleRow
                label={t.search.testDriveAvailable}
                value={draftFilters.allowTestDrive}
                onToggle={(v) => setDraftFilters((f) => ({ ...f, allowTestDrive: v || undefined }))}
              />
              <ToggleRow
                label={t.search.tradeInAccepted}
                value={draftFilters.acceptsTradeIn}
                onToggle={(v) => setDraftFilters((f) => ({ ...f, acceptsTradeIn: v || undefined }))}
              />
              <ToggleRow
                label={t.search.priceNegotiableFilter}
                value={draftFilters.priceNegotiable}
                onToggle={(v) => setDraftFilters((f) => ({ ...f, priceNegotiable: v || undefined }))}
              />
            </FilterSection>
          </ScrollView>

          {/* Apply Button */}
          <View style={styles.modalFooter}>
            <Pressable style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>{t.search.showResults}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ── Picker Modal ── */}
      <Modal visible={pickerVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setPickerVisible(false)} style={styles.modalHeaderBtn}>
              <Text style={styles.modalCancel}>{t.common.cancel}</Text>
            </Pressable>
            <Text style={styles.modalTitle}>{getPickerTitle()}</Text>
            {pickerField !== 'sortBy' ? (
              <Pressable onPress={() => {
                if (pickerField === 'make') {
                  setDraftFilters((f) => ({ ...f, make: undefined, model: undefined }));
                } else {
                  setDraftFilters((f) => ({ ...f, [pickerField]: undefined }));
                }
                setPickerVisible(false);
              }} style={styles.modalHeaderBtn}>
                <Text style={styles.modalClear}>{t.common.clear}</Text>
              </Pressable>
            ) : (
              <View style={styles.modalHeaderBtn} />
            )}
          </View>
          <FlatList
            data={getPickerOptions()}
            keyExtractor={(item) => item.value}
            renderItem={({ item, index }) => {
              const currentVal = pickerField === 'sortBy'
                ? `${draftSortBy}|${draftSortOrder}`
                : String(draftFilters[pickerField as keyof CarFilter] ?? '');
              const isSelected = currentVal === item.value;
              return (
                <>
                  {pickerField === 'make' && index === POPULAR_MAKE_NAMES.length && (
                    <View style={{ height: 1, backgroundColor: '#e0e0e0', marginVertical: 8 }} />
                  )}
                  <Pressable style={styles.pickerItem} onPress={() => handlePickerSelect(item.value)}>
                    <Text style={[styles.pickerItemText, isSelected && styles.pickerItemSelected]}>{item.label}</Text>
                    {isSelected && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
                  </Pressable>
                </>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundMuted },
  flex1: { flex: 1 },

  // Search bar
  searchBarWrapper: { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.full,
    height: 48,
  },
  searchIcon: { marginLeft: 16 },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  clearSearch: { paddingHorizontal: 12 },

  // Action bar
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: 6,
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.zinc100,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
  },
  pillButtonText: { fontSize: FONT_SIZE.sm, color: COLORS.text, fontWeight: '500' },
  pillButtonActive: { backgroundColor: COLORS.black },
  pillButtonTextActive: { color: COLORS.white },
  filterBadge: {
    backgroundColor: COLORS.black,
    borderRadius: BORDER_RADIUS.full,
    width: 18, height: 18,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 2,
  },
  filterBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },

  // Layout toggle
  layoutToggleContainer: {
    marginLeft: 'auto',
    flexDirection: 'row',
    backgroundColor: COLORS.zinc100,
    borderRadius: BORDER_RADIUS.full,
    padding: 2,
  },
  layoutToggleBtn: {
    width: 36, height: 32,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: BORDER_RADIUS.full,
  },
  layoutToggleBtnActive: {
    backgroundColor: COLORS.black,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 2, elevation: 1,
  },

  // Chips
  chipScroll: { maxHeight: 40, paddingHorizontal: SPACING.md },
  chipScrollContent: { gap: SPACING.xs, alignItems: 'center' },
  activeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.zinc100,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  activeChipText: { fontSize: FONT_SIZE.xs, color: COLORS.text, fontWeight: '500' },
  clearChip: { paddingHorizontal: SPACING.sm, paddingVertical: 6 },
  clearChipText: { fontSize: FONT_SIZE.xs, color: COLORS.error, fontWeight: '500' },

  // Results
  resultDivider: {
    paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderZinc,
    marginBottom: SPACING.sm,
  },
  resultCountText: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted },
  row: { paddingHorizontal: SPACING.md, gap: SPACING.sm },
  listContent: { paddingBottom: SPACING.xl },
  listContentList: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl },
  gridItem: { flex: 1, maxWidth: '50%', paddingBottom: SPACING.sm },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.xxl, gap: SPACING.sm },
  emptyIcon: {
    backgroundColor: COLORS.zinc100,
    borderRadius: BORDER_RADIUS.full,
    width: 96, height: 96,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emptyText: { fontSize: FONT_SIZE.md, color: COLORS.textMuted, fontWeight: '600' },
  emptySubText: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted },
  loadingMore: { paddingVertical: SPACING.md, alignItems: 'center' },

  // Filter Modal
  modalContainer: { flex: 1, backgroundColor: COLORS.white },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderZinc,
  },
  modalHeaderBtn: { width: 60 },
  modalCancel: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary },
  modalTitle: { fontSize: FONT_SIZE.lg, fontWeight: '500', color: COLORS.text },
  modalClear: { fontSize: FONT_SIZE.md, color: COLORS.error, textAlign: 'right' },
  modalBody: { flex: 1 },
  modalBodyContent: { padding: SPACING.md, paddingBottom: SPACING.xxl },

  // Filter section (collapsible card)
  filterSectionCard: {
    backgroundColor: COLORS.zinc50,
    borderRadius: BORDER_RADIUS['2xl'],
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderZinc,
    overflow: 'hidden',
  },
  filterSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
  },
  filterSectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  filterSectionIconWrap: {
    width: 32, height: 32,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center',
  },
  filterSectionHeaderText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  filterSectionBody: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },

  // Filter field label
  filterFieldLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    marginBottom: 4,
    marginLeft: 4,
  },

  // Filter selects
  filterSelect: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.full,
    height: 44,
    paddingHorizontal: 16,
  },
  filterSelectDisabled: {
    opacity: 0.5,
  },
  filterSelectHalf: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.full,
    height: 44,
    paddingHorizontal: 16,
  },
  filterSelectText: { fontSize: FONT_SIZE.sm, color: COLORS.text },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  rangeDash: { color: COLORS.textMuted, fontSize: FONT_SIZE.lg },

  priceInputWrapper: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.full,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  priceInput: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    fontWeight: '500',
    padding: 0,
  },
  presetScroll: { marginTop: SPACING.sm },
  presetChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.zinc100,
    marginRight: SPACING.xs,
  },
  presetChipActive: { backgroundColor: COLORS.black },
  presetChipText: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
  presetChipTextActive: { color: COLORS.white, fontWeight: '600' },

  // Toggle row
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderZinc,
  },
  toggleLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    flex: 1,
  },

  modalFooter: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderZinc,
  },
  applyButton: {
    backgroundColor: COLORS.black,
    borderRadius: BORDER_RADIUS.full,
    height: 48,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
  },
  applyButtonText: { color: COLORS.white, fontSize: FONT_SIZE.sm, fontWeight: '500' },

  // Picker Modal
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderZinc,
  },
  pickerItemText: { fontSize: FONT_SIZE.md, color: COLORS.text },
  pickerItemSelected: { color: COLORS.primary, fontWeight: '600' },
});
