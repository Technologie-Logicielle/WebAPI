import { UserInfo } from '../../user/index.js';
import { security } from '../../../constants/schema.js';
import { tags } from '../index.js';
import { sql } from '../../../utils/sql.js';

const UserListSchema = {
  security,
  tags,
  response: {
    200: {
      users: {
        type: 'array',
        items: UserInfo
      },
      count: { type: 'number' }
    }
  }
}

/**
 * @type {import('fastify').FastifyPluginCallback}
 */
export default async function(fastify, opts) {
  const onRequest = [fastify.authenticate, fastify.isAdmin];

  fastify.get(
    "/",
    { schema: UserListSchema, onRequest: onRequest },
    async function(request, reply) {
      await fastify.mssql.pool.connect();
      const res = await fastify.mssql.pool.query(sql`SELECT * FROM users; SELECT count(*) as c FROM users;`);
      return { users: res.recordsets[0], count: res.recordsets[1][0].c };
    },
  );
}
