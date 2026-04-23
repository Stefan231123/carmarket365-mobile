// Car listing mutations
// TODO: Convert to Apollo Client gql tag

export const CREATE_CAR = `
  mutation CreateCar($input: CreateCarInput!) {
    createCar(createCarInput: $input) {
      id
      make
      model
      year
      price
    }
  }
`;

export const UPDATE_CAR = `
  mutation UpdateCar($id: String!, $input: UpdateCarInput!) {
    updateCar(id: $id, updateCarInput: $input) {
      id
      make
      model
      year
      price
      isAvailable
    }
  }
`;

export const DELETE_CAR = `
  mutation DeleteCar($id: String!) {
    deleteCar(id: $id)
  }
`;

export const TOGGLE_SAVE_CAR = `
  mutation ToggleSaveCar($carId: String!) {
    toggleSaveCar(carId: $carId) {
      id
      carId
    }
  }
`;

export const RECORD_CAR_VIEW = `
  mutation RecordCarView($carId: String!) {
    recordCarView(carId: $carId) {
      id
    }
  }
`;

export const CREATE_INQUIRY = `
  mutation CreateInquiry($input: CreateInquiryInput!) {
    createInquiry(createInquiryInput: $input) {
      id
      message
      createdAt
    }
  }
`;
