// Auth mutations
// TODO: Convert to Apollo Client gql tag

export const LOGIN = `
  mutation Login($email: String!, $password: String!) {
    login(loginInput: { email: $email, password: $password }) {
      accessToken
      user {
        id
        email
        firstName
        lastName
        name
        role
        avatarUrl
      }
    }
  }
`;

export const REGISTER = `
  mutation Register(
    $email: String!
    $password: String!
    $firstName: String
    $lastName: String
  ) {
    register(registerInput: {
      email: $email
      password: $password
      firstName: $firstName
      lastName: $lastName
    }) {
      accessToken
      user {
        id
        email
        firstName
        lastName
        name
        role
      }
    }
  }
`;

export const LOGOUT = `
  mutation Logout {
    logout
  }
`;
