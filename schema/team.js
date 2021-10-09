const { gql } = require('apollo-server-express');

export default gql`
  type Team {
    id: Int!
    name: String!
    members: [User!]!
    channels: [Channel!]!
  }

  type CreateTeamResponse {
    success: Boolean!
    team: Team
    errors: [Error!]
  }

  type Query {
    allTeams: [Team!]!
    inviteTeams: [Team!]!
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
