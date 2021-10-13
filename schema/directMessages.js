const { gql } = require('apollo-server-express');

// we dont pass any variables to directMessages query because the receiverId is you yourself as the user.
export default gql`
  type DirectMessage {
    id: Int!
    text: String!
    sender: User!
    receiverId: Int!
  }
  type Query {
    directMessages: [DirectMessage!]!
  }
  type Mutation {
    createDirectMessage(receiverId: Int!, text: String!): Boolean!
  }
`;
