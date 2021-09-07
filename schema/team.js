const { gql } = require('apollo-server-express');

export default gql`
  type Team {
    id: Int!
    name: String!
    owner: User!
    members: [User!]!
    channels: [Channel!]!
  }

  type CreateTeamResponse {
    success: Boolean!
    errors: [Error!]
  }

  type Query {
    allTeams: [Team!]!
  }

  type VoidResponse {
    success: Boolean!
    errors: [Error!]
  }

  type Mutation {
    createTeam(name: String!): CreateTeamResponse!
    addTeamMember(email: String!, teamId: Int!): VoidResponse!
  }
`;
