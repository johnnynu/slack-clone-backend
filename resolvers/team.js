import formatErrors from '../formatErrors';

export default {
  Mutation: {
    createTeam: async (parent, args, { models, user }) => {
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
    },
  },
};
