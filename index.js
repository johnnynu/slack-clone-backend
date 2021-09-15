const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { SubscriptionServer } from 'subscriptions-transport-ws';

import models from './models';

import path from 'path';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import cors from 'cors';
import { refreshTokens } from './auth';
import jwt from 'jsonwebtoken';

const SECRET = 'asdgasdgfsdgdfgsdfgiso';
const SECRET2 = 'ASDFSDAFASFASFISO';
const PORT = 4000;

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './schema')));

const resolvers = mergeResolvers(
  fileLoader(path.join(__dirname, './resolvers'))
);

const schema = makeExecutableSchema({ typeDefs, resolvers });

async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            },
          };
        },
      },
    ],
    context: ({ req }) => ({
      models,
      user: req.user,
      SECRET,
      SECRET2,
    }),
  });
  await server.start();

  const app = express();
  app.use(cors('*'));

  const corsOptions = {
    origin: '*',
    credentials: true,
    exposedHeaders: ['x-token', 'x-refresh-token'],
  };

  const addUser = async (req, res, next) => {
    const token = req.headers['x-token'];
    if (token) {
      try {
        const { user } = jwt.verify(token, SECRET);
        req.user = user;
      } catch (err) {
        const refreshToken = req.headers['x-refresh-token'];
        const newTokens = await refreshTokens(
          token,
          refreshToken,
          models,
          SECRET,
          SECRET2
        );
        if (newTokens.token && newTokens.refreshToken) {
          res.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token');
          res.set('x-token', newTokens.token);
          res.set('x-refresh-token', newTokens.refreshToken);
        }
        req.user = newTokens.user;
      }
    }
    next();
  };
  app.use(addUser);

  const httpServer = createServer(app);

  const subscriptionServer = SubscriptionServer.create(
    {
      // This is the `schema` we just created.
      schema,
      // These are imported from `graphql`.
      execute,
      subscribe,
    },
    {
      // This is the `httpServer` we created in a previous step.
      server: httpServer,
      // This `server` is the instance returned from `new ApolloServer`.
      path: server.graphqlPath,
    }
  );

  server.applyMiddleware({ app, cors: false });

  await new Promise((resolve) =>
    models.sequelize.sync({}).then(() => {
      httpServer.listen({ port: 4000 }, resolve);
    })
  );
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
  return { server, app };
}

startApolloServer();
