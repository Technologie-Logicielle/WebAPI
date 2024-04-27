'use strict'

import { sql } from '../../utils/sql.js'

const AuthBodySchema = {
  body: {
    type: 'object',
    properties: {
      email: { type: 'string' },
      password: { type: 'string' }
    },
    required: ['email', 'password']
  }
}

const ResetPasswordSchema = {
  body: {
    type: 'object',
    required: [ 'password', 'newPassword'],
    properties: {
      password: {
        type: 'string',
      },
      newPassword: {
        type: 'string',
      },
    }
  }
}

/**
  * @type {import('fastify').FastifyPluginCallback}
  */
export default async function(fastify, opts) {
  fastify.post('/signin', { schema: AuthBodySchema }, async function(request, reply) {
    await fastify.mssql.pool.connect();
    const res = await fastify.mssql.pool.query(sql`SELECT * FROM users WHERE email = '${request.body.email}'`);
    return { users: res.recordset };
  })

  fastify.post('/signup', { schema: AuthBodySchema },  async function(request, reply) {
    await fastify.mssql.pool.connect();
    const res = await fastify.mssql.pool.query('SELECT * FROM users');
    return { users: res.recordset };
  })

  fastify.post('/password', { schema: ResetPasswordSchema }, async function(request, reply) {
    await fastify.mssql.pool.connect();
    const res = await fastify.mssql.pool.query('SELECT * FROM users');
    return { users: res.recordset };
  })
}
