import requiresAuth from '../permissions';
import { withFilter, PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

const NEW_CHANNEL_MESSAGE = 'NEW_CHANNEL_MESSAGE';

export default {
  Subscription: {
    newChannelMessage: {
      subscribe: withFilter(
        (parent, { channelId }, { models, user }) =>
          // check if part of the team
          // const channel = await models.Channel.findOne({ where: { id: channelId } });
          // const member = await models.Member.findOne({
          //   where: { teamId: channel.teamId, userId: user.id },
          // });
          // if (!member) {
          //   throw new Error("You have to be a member of the team to subcribe to it's messages");
          // }
          pubsub.asyncIterator(NEW_CHANNEL_MESSAGE),
        (payload, args) => payload.channelId === args.channelId
      ),
    },
  },
  Message: {
    user: ({ user, userId }, args, { models }) => {
      if (user) {
        return user;
      }
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
          const message = await models.Message.create({
            ...args,
            userId: user.id,
          });

          const asyncFunc = async () => {
            const currentUser = await models.User.findOne({
              where: {
                id: user.id,
              },
            });
            pubsub.publish(NEW_CHANNEL_MESSAGE, {
              channelId: args.channelId,
              newChannelMessage: {
                ...message.dataValues,
                user: currentUser.dataValues,
              },
            });
          };

          asyncFunc();

          return true;
        } catch (err) {
          console.log(err);
          return false;
        }
      }
    ),
  },
};
