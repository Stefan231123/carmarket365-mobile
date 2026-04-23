// Car listing queries — mirrors web app GraphQL operations
// TODO: Implement with Apollo Client gql tag

export const GET_CARS = `
  query GetCars(
    $limit: Int
    $offset: Int
    $make: String
    $model: String
    $yearMin: Int
    $yearMax: Int
    $priceMin: Float
    $priceMax: Float
    $fuelType: FuelType
    $transmission: TransmissionType
    $vehicleType: VehicleType
    $condition: CarCondition
    $location: String
    $sortBy: String
    $sortOrder: String
  ) {
    cars(
      limit: $limit
      offset: $offset
      make: $make
      model: $model
      yearMin: $yearMin
      yearMax: $yearMax
      priceMin: $priceMin
      priceMax: $priceMax
      fuelType: $fuelType
      transmission: $transmission
      vehicleType: $vehicleType
      condition: $condition
      location: $location
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      cars {
        id
        make
        model
        variant
        year
        price
        mileage
        fuelType
        transmission
        vehicleType
        condition
        location
        city
        isAvailable
        isFeatured
        viewCount
        favoriteCount
        createdAt
        images {
          id
          url
          isPrimary
          sortOrder
        }
        seller {
          id
          name
          role
          dealerName
          dealerLogoUrl
        }
      }
      total
      hasMore
    }
  }
`;

export const GET_CAR_BY_ID = `
  query GetCarById($id: String!) {
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
      countryCode
      latitude
      longitude
      isAvailable
      isFeatured
      isCertified
      viewCount
      favoriteCount
      inquiryCount
      contactPhone
      contactEmail
      allowTestDrive
      acceptsTradeIn
      originalPrice
      priceNegotiable
      quickSale
      createdAt
      updatedAt
      soldAt
      images {
        id
        url
        publicId
        isPrimary
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
        dealerDescription
        dealerCity
        dealerPhoneNumber
        dealerWebsite
        dealerWorkingHours
        dealerServices
      }
    }
  }
`;
