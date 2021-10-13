import Sequelize from 'sequelize';

const sequelize = new Sequelize('slack', 'postgres', 'Nurtureily1!', {
  dialect: 'postgres',
  define: {
    underscored: true,
  },
});

const models = {
  User: require('./user').default(sequelize, Sequelize.DataTypes),
  Channel: require('./channel').default(sequelize, Sequelize.DataTypes),
  Message: require('./message').default(sequelize, Sequelize.DataTypes),
  Team: require('./team').default(sequelize, Sequelize.DataTypes),
  Member: require('./member').default(sequelize, Sequelize.DataTypes),
  DirectMessage: require('./directMessage').default(
    sequelize,
    Sequelize.DataTypes
  ),
};

Object.keys(models).forEach((modelName) => {
  if ('associate' in models[modelName]) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

export default models;
