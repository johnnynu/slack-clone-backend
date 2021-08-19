import bcrypt from 'bcrypt';

export default {
  Query: {
    getUser: (parent, { id }, { models }) =>
      models.User.findOne({ where: { id } }),
    allUsers: (parent, args, { models }) => models.User.findAll(),
  },
  Mutation: {
    register: async (parent, { password, ...otherArgs }, { models }) => {
      try {
        const hashedPW = await bcrypt.hash(password, 12);
        await models.User.create({ ...otherArgs, password: hashedPW });
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  },
};
