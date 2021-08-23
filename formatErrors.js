import _ from 'lodash';

export default (e, models) => {
  if (e instanceof models.Sequelize.ValidationError) {
    // _.pick({hello: 'world', b: 2}, 'hello') => {hello: 'world'}
    return e.errors.map((x) => _.pick(x, ['path', 'message']));
  }
  return [{ path: 'name', message: 'something went wrong!' }];
};
