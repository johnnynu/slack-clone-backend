import formatErrors from '../formatErrors';
import requiresAuth from '../permissions';

export default {
  Mutation: {
    createTeam: requiresAuth.createResolver(
      async (parent, args, { models, user }) => {
        console.log(user);
        try {
          await models.Team.create({ ...args, owner: user.id });
          return {
            success: true,
          };
        } catch (err) {
          console.log(err);
          return {
            success: false,
            errors: formatErrors(err),
          };
        }
      }
    ),
  },
};
