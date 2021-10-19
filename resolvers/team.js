import formatErrors from '../formatErrors';
import member from '../models/member';
import requiresAuth from '../permissions';

export default {
  Query: {
    getTeamMembers: requiresAuth.createResolver(
      async (parent, { teamId }, { models, user }) => {
        return models.sequelize.query(
          'select distinct * from users as u join members as m on m.user_id = u.id where m.team_id = ?',
          {
            replacements: [teamId],
            model: models.User,
            raw: true,
          }
        );
      }
    ),
  },
  Mutation: {
    createTeam: requiresAuth.createResolver(
      async (parent, args, { models, user }) => {
        const check = await models.sequelize.transaction();
        try {
          const team = await models.Team.create(
            { ...args },
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
          await models.Member.create(
            {
              teamId: team.id,
              userId: user.id,
              admin: true,
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
          const memberToAdd = await models.Member.findOne(
            { where: { teamId, userId: user.id } },
            { raw: true }
          );
          if (!memberToAdd.admin) {
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
          const userToAdd = await models.User.findOne(
            { where: { email } },
            { raw: true }
          );
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
    directMessageMembers: ({ id }, args, { models, user }) =>
      models.sequelize.query(
        'select distinct on (u.id) u.id, u.username from users u join direct_messages dm on (u.id = dm.sender_id) or (u.id = dm.receiver_id) where (:currentUserId = dm.sender_id or :currentUserId = dm.receiver_id) and dm.team_id = :teamId',
        {
          replacements: { currentUserId: user.id, teamId: id },
          model: models.User,
          raw: true,
        }
      ),
  },
};
