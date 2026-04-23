// TypeScript interfaces — mirrors backend GraphQL schema

import {
  VehicleType,
  FuelType,
  TransmissionType,
  CarCondition,
  DrivetrainType,
  UserRole,
  DealerStatus,
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
  publicId: string;
  isPrimary: boolean;
  sortOrder: number;
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
