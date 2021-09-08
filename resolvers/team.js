import formatErrors from '../formatErrors';
import team from '../models/team';
import requiresAuth from '../permissions';

export default {
  Query: {
    allTeams: requiresAuth.createResolver(
      async (parent, args, { models, user }) => {
        const teams = await models.Team.findAll(
          {
            where: {
              owner: user.id,
            },
          },
          { raw: true }
        );
        return teams;
      }
    ),
  },
  Mutation: {
    createTeam: requiresAuth.createResolver(
      async (parent, args, { models, user }) => {
        const check = await models.sequelize.transaction();
        try {
          const team = await models.Team.create(
            { ...args, owner: user.id },
            { transaction: check }
          );
          await models.Channel.create(
            {
              name: 'general',
              public: true,
              teamId: team.id,
            },
            { transaction: check }
          );
          await check.commit();
          return {
            success: true,
            team, // If error in the future, do team: check
          };
        } catch (err) {
          await check.rollback();
          return {
            success: false,
            errors: formatErrors(err, models),
          };
        }
      }
    ),
    addTeamMember: requiresAuth.createResolver(
      async (parent, { email, teamId }, { models, user }) => {
        // Made 3 requests to DB, if error occurs later on: check back here
        try {
          console.log(1);
          const teamToAdd = await models.Team.findOne(
            { where: { id: teamId } },
            { raw: true }
          );
          console.log(2);
          if (teamToAdd.owner !== user.id) {
            return {
              success: false,
              errors: [
                {
                  path: 'email',
                  message:
                    'You cannot add members to the team. Only the owner can.',
                },
              ],
            };
          }
          console.log(3);
          const userToAdd = await models.User.findOne(
            { where: { email } },
            { raw: true }
          );
          console.log(4);
          if (!userToAdd) {
            return {
              success: false,
              errors: [
                {
                  path: 'email',
                  message: 'Could not find user with email.',
                },
              ],
            };
          }
          await models.Member.create({ userId: userToAdd.id, teamId });
          return {
            success: true,
          };
        } catch (err) {
          return {
            success: false,
            errors: formatErrors(err, models),
          };
        }
      }
    ),
  },
  Team: {
    channels: ({ id }, args, { models }) =>
      models.Channel.findAll({ where: { teamId: id } }),
  },
};
