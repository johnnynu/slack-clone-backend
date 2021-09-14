import user from '../models/user';
import requiresAuth from '../permissions';

export default {
  Message: {
    user: ({ userId }, args, { models }) => {
      return models.User.findOne({ where: { id: userId } }, { raw: true });
    },
  },
  Query: {
    allMessages: requiresAuth.createResolver(
      async (parent, { channelId }, { models }) => {
        const messages = await models.Message.findAll(
          { order: [['created_at', 'ASC']], where: { channelId } },
          { raw: true }
        );
        return messages;
      }
    ),
  },
  Mutation: {
    createMessage: requiresAuth.createResolver(
      async (parent, args, { models, user }) => {
        try {
          await models.Message.create({
            ...args,
            userId: user.id,
          });
          return true;
        } catch (err) {
          console.log(err);
          return false;
        }
      }
    ),
  },
};
