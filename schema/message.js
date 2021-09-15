const { gql } = require('apollo-server-express');

export default gql`
  type Message {
    id: Int!
    text: String!
    user: User!
    channel: Channel!
    createdAt: String!
  }
  type Subscription {
    newChannelMessage(channelId: Int!): Message!
  }
  type Query {
    allMessages(channelId: Int!): [Message!]!
  }
  type Mutation {
    createMessage(channelId: Int!, text: String!): Boolean!
  }
`;
