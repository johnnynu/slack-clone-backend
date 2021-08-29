import formatErrors from '../formatErrors';
import requiresAuth from '../permissions';

export default {
  Query: {
    allTeams: requiresAuth.createResolver(
      async (parent, args, { models, user }) => {
        const teams = await models.Team.findAll(
          {
            where: {
              owner: user.id,
            },
          },
          { raw: true }
        );
        return teams;
      }
    ),
  },
  Mutation: {
    createTeam: requiresAuth.createResolver(
      async (parent, args, { models, user }) => {
        try {
          await models.Team.create({ ...args, owner: user.id });
          return {
            success: true,
          };
        } catch (err) {
          return {
            success: false,
            errors: formatErrors(err),
          };
        }
      }
    ),
  },
  Team: {
    channels: ({ id }, args, { models }) =>
      models.Channel.findAll({ teamId: id }),
  },
};
