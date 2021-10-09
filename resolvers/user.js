import { tryLogin } from '../auth';
import formatErrors from '../formatErrors';
import requiresAuth from '../permissions';

export default {
  User: {
    teams: async (parent, args, { models, user }) => {
      const teams = await models.Team.findAll(
        {
          include: [
            {
              model: models.User,
              where: { id: user.id },
            },
          ],
        },
        { raw: true }
      );
      return teams;
    },
  },
  Query: {
    allUsers: (parent, args, { models }) => models.User.findAll(),
    getUser: requiresAuth.createResolver((parent, args, { models, user }) =>
      models.User.findOne({ where: { id: user.id } })
    ),
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
      } catch (err) {
        return {
          success: false,
          errors: formatErrors(err, models),
        };
      }
    },
  },
};
