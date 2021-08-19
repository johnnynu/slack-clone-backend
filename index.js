const express = require('express');
const { ApolloServer } = require('apollo-server-express');

import models from './models';

import path from 'path';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import cors from 'cors';

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './schema')));

const resolvers = mergeResolvers(
  fileLoader(path.join(__dirname, './resolvers'))
);

async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: {
      models,
      user: {
        id: 1,
      },
    },
  });
  await server.start();

  const app = express();
  app.use(cors('*'));
  server.applyMiddleware({ app });

  await new Promise((resolve) =>
    models.sequelize.sync({}).then(() => {
      app.listen({ port: 4000 }, resolve);
    })
  );
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
  return { server, app };
}

startApolloServer();
