import formatErrors from '../formatErrors';
import requiresAuth from '../permissions';

export default {
  Mutation: {
    createChannel: requiresAuth.createResolver(
      async (parent, args, { models, user }) => {
        try {
          const member = await models.Member.findOne(
            { where: { teamId: args.teamId, userId: user.id } },
            { raw: true }
          );
          if (!member.admin) {
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
