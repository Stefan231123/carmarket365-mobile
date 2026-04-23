// TypeScript interfaces — mirrors backend GraphQL schema

import {
  VehicleType,
  FuelType,
  TransmissionType,
  CarCondition,
  DrivetrainType,
  UserRole,
  DealerStatus,
  InquiryType,
  InquiryStatus,
} from '../constants/enums';

export interface User {
  id: string;
  email: string;
  authProvider?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  languagePreference?: string;
  countryPreference?: string;
  cookieConsent?: boolean;
  marketingEmailsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  // Dealer fields
  dealerName?: string;
  dealerBusinessNumber?: string;
  dealerLicenseNumber?: string;
  dealerStatus?: DealerStatus;
  dealerLogoUrl?: string;
  dealerDescription?: string;
  dealerAddress?: string;
  dealerCity?: string;
  dealerRegion?: string;
  dealerCountry?: string;
  dealerPhoneNumber?: string;
  dealerWebsite?: string;
  dealerLatitude?: number;
  dealerLongitude?: number;
  dealerWorkingHours: string[];
  dealerServices: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CarImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  publicId: string;
  isMain: boolean;
  isInterior?: boolean;
  sortOrder: number;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
}

export interface Car {
  id: string;
  make: string;
  model: string;
  variant?: string;
  year: number;
  price: number;
  mileage: number;
  vehicleType: VehicleType;
  fuelType: FuelType;
  transmission: TransmissionType;
  condition: CarCondition;
  color?: string;
  interiorColor?: string;
  description?: string;
  engineSize?: number;
  horsePower?: number;
  doors?: number;
  seats?: number;
  drivetrain?: DrivetrainType;
  vin?: string;
  licensePlate?: string;
  features: string[];
  safetyFeatures: string[];
  location: string;
  city?: string;
  region?: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isCertified: boolean;
  viewCount: number;
  favoriteCount: number;
  inquiryCount: number;
  contactPhone?: string;
  contactEmail?: string;
  allowTestDrive: boolean;
  acceptsTradeIn: boolean;
  originalPrice?: number;
  priceNegotiable?: boolean;
  quickSale?: boolean;
  sellerId: string;
  seller: User;
  images: CarImage[];
  createdAt: string;
  updatedAt: string;
  soldAt?: string;
}

export interface SavedCar {
  id: string;
  userId: string;
  carId: string;
  car: Car;
  createdAt: string;
}

export interface SearchAlert {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  isActive: boolean;
  lastNotifiedAt?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface PaginatedCars {
  cars: Car[];
  total: number;
  hasMore: boolean;
}

export interface CarInquiry {
  id: string;
  carId: string;
  car?: Car;
  inquirerName: string;
  inquirerEmail: string;
  inquirerPhone?: string;
  inquiryType: InquiryType;
  message: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CarFilter {
  make?: string;
  model?: string;
  vehicleType?: VehicleType;
  condition?: CarCondition;
  color?: string;
  location?: string;
  countryCode?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  minMileage?: number;
  maxMileage?: number;
  fuelType?: FuelType;
  transmission?: TransmissionType;
  drivetrain?: DrivetrainType;
  minEngineSize?: number;
  maxEngineSize?: number;
  minHorsePower?: number;
  maxHorsePower?: number;
  doors?: number;
  seats?: number;
  maxPreviousOwners?: number;
  nonSmokingVehicle?: boolean;
  fullServiceHistory?: boolean;
  isFeatured?: boolean;
  isCertified?: boolean;
  allowTestDrive?: boolean;
  acceptsTradeIn?: boolean;
  priceNegotiable?: boolean;
  quickSale?: boolean;
  features?: string[];
  sellerType?: 'USER' | 'DEALER';
}
