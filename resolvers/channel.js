import formatErrors from '../formatErrors';
import requiresAuth from '../permissions';

export default {
  Mutation: {
    createChannel: requiresAuth.createResolver(
      async (parent, args, { models, user }) => {
        try {
          const team = await models.Team.findOne(
            { where: { id: args.teamId } },
            { raw: true }
          );
          if (team.owner != user.id) {
            return {
              success: false,
              errors: [
                {
                  path: 'name',
                  message:
                    'You cannot create a channel because you are not the owner of the team.',
                },
              ],
            };
          }

          const channel = await models.Channel.create(args);
          return {
            success: true,
            channel,
          };
        } catch (error) {
          console.log(error);
          return {
            success: false,
            errors: formatErrors(error, models),
          };
        }
      }
    ),
  },
};
