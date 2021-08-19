import user from "../models/user";

export default {
  Mutation: {
    createMessage: async (parent, args, { models }) => {
      try {
        await models.Message.create({ ...args, userId: user.userId });
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  },
};
