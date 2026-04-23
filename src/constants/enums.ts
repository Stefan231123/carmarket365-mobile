// Mirror of backend enums — keep in sync with server/src/cars/car.entity.ts

export enum VehicleType {
  CAR = 'CAR',
  MOTORCYCLE = 'MOTORCYCLE',
  TRUCK = 'TRUCK',
  VAN = 'VAN',
  SUV = 'SUV',
  COUPE = 'COUPE',
  CONVERTIBLE = 'CONVERTIBLE',
  WAGON = 'WAGON',
  HATCHBACK = 'HATCHBACK',
  SEDAN = 'SEDAN',
}

export enum FuelType {
  GASOLINE = 'GASOLINE',
  DIESEL = 'DIESEL',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID',
  PLUGIN_HYBRID = 'PLUGIN_HYBRID',
  LPG = 'LPG',
  CNG = 'CNG',
  HYDROGEN = 'HYDROGEN',
}

export enum TransmissionType {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC',
  SEMI_AUTOMATIC = 'SEMI_AUTOMATIC',
  CVT = 'CVT',
}

export enum CarCondition {
  NEW = 'NEW',
  USED = 'USED',
  CERTIFIED = 'CERTIFIED',
  DAMAGED = 'DAMAGED',
}

export enum DrivetrainType {
  FWD = 'FWD',
  RWD = 'RWD',
  AWD = 'AWD',
  FOUR_WD = 'FOUR_WD',
}

export enum UserRole {
  USER = 'USER',
  DEALER = 'DEALER',
  ADMIN = 'ADMIN',
}

export enum DealerStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED',
}
