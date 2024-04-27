'use strict'

import { sql } from '../../utils/sql.js'

const UpdateConfigSchema = {
  body: {
    type: 'object',
    required: [ 'email',],
    properties: {
      email: {
        type: 'string',
      },
    }
  }
}

/**
  * @type {import('fastify').FastifyPluginCallback}
  */
export default async function(fastify, opts) {
  fastify.get('/conferences', {}, async function(request, reply) {
    await fastify.mssql.pool.connect();
    const res = await fastify.mssql.pool.query('SELECT * FROM users');
    return { users: res.recordset };
  })

  fastify.put('/conferences/:id', { schema: UpdateConfigSchema }, async function(request, reply) {
    await fastify.mssql.pool.connect();
    const res = await fastify.mssql.pool.query('SELECT * FROM users');
    return { users: res.recordset };
  })
}
