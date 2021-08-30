import formatErrors from '../formatErrors';

export default {
  Mutation: {
    createChannel: async (parent, args, { models }) => {
      try {
        const channel = await models.Channel.create(args);
        return {
          success: true,
          channel,
        };
      } catch (error) {
        console.log(error);
        return {
          success: false,
          errors: formatErrors(error),
        };
      }
    },
  },
};
