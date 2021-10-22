const { gql } = require('apollo-server-express');

export default gql`
  type User {
    id: Int!
    username: String!
    email: String!
    teams: [Team!]!
  }

  type Query {
    allUsers: [User!]!
    getUser: User!
    getUserWithNameDisplay(userId: Int!): User
  }

  type RegisterResponse {
    success: Boolean!
    user: User
    errors: [Error!]
  }

  type LoginResponse {
    success: Boolean!
    token: String
    refreshToken: String
    errors: [Error!]
  }

  type Mutation {
    register(
      username: String!
      email: String!
      password: String!
    ): RegisterResponse!
    login(email: String!, password: String!): LoginResponse!
  }
`;
