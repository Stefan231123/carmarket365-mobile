// User & auth queries
// TODO: Convert to Apollo Client gql tag

export const GET_ME = `
  query GetMe {
    me {
      id
      email
      firstName
      lastName
      name
      phone
      avatarUrl
      role
      isActive
      isEmailVerified
      languagePreference
      countryPreference
      marketingEmailsEnabled
      smsNotificationsEnabled
      dealerName
      dealerStatus
      dealerLogoUrl
      createdAt
    }
  }
`;

export const GET_MY_CARS = `
  query GetMyCars {
    myCars {
      id
      make
      model
      year
      price
      mileage
      fuelType
      isAvailable
      isFeatured
      viewCount
      favoriteCount
      inquiryCount
      createdAt
      soldAt
      images {
        id
        url
        isPrimary
      }
    }
  }
`;

export const GET_MY_SAVED_CARS = `
  query GetMySavedCars {
    mySavedCars {
      id
      carId
      createdAt
      car {
        id
        make
        model
        year
        price
        mileage
        fuelType
        location
        isAvailable
        images {
          id
          url
          isPrimary
        }
      }
    }
  }
`;
