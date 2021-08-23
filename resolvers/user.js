import bcrypt from 'bcrypt';
import _ from 'lodash';

import { tryLogin } from '../auth';

const formatErrors = (e, models) => {
  if (e instanceof models.Sequelize.ValidationError) {
    // _.pick({hello: 'world', b: 2}, 'hello') => {hello: 'world'}
    return e.errors.map((x) => _.pick(x, ['path', 'message']));
  }
  return [{ path: 'name', message: 'something went wrong!' }];
};

export default {
  Query: {
    getUser: (parent, { id }, { models }) =>
      models.User.findOne({ where: { id } }),
    allUsers: (parent, args, { models }) => models.User.findAll(),
  },
  Mutation: {
    login: (parent, { email, password }, { models, SECRET, SECRET2 }) =>
      tryLogin(email, password, models, SECRET, SECRET2),
    register: async (parent, args, { models }) => {
      try {
        const user = await models.User.create(args);
        return {
          success: true,
          user,
        };
      } catch (error) {
        return {
          success: false,
          errors: formatErrors(error, models),
        };
      }
    },
  },
};
