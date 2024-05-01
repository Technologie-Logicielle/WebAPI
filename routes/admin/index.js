'use strict'

import { sql } from '../../utils/sql.js'
import { Security } from '../user/index.js'

const UpdateConferenceSchema = {
  security: Security,
  body: {
  }
}

const ConfigSchema = {}

/**
  * @type {import('fastify').FastifyPluginCallback}
  */
export default async function(fastify, opts) {
  fastify.get('/conferences', { onRequest: [fastify.authenticate, fastify.isAdmin] }, async function(request, reply) {
    await fastify.mssql.pool.connect();
    const res = await fastify.mssql.pool.query('SELECT * FROM users');
    return { users: res.recordset };
  })

  fastify.put('/conferences/:id', {
    schema: UpdateConferenceSchema,
    onRequest: [fastify.authenticate, fastify.isAdmin]
  }, async function(request, reply) {
    await fastify.mssql.pool.connect();
    const res = await fastify.mssql.pool.query('SELECT * FROM users');
    return { users: res.recordset };
  })
  

  fastify.get('/configs', { schema: ConfigSchema }, async function(request, reply) {
    await fastify.mssql.pool.connect();
    const res = await fastify.mssql.pool.query('SELECT * FROM users');
    return { users: res.recordset };
  })

  fastify.post('/configs', { schema: ConfigSchema }, async function(request, reply) {
    await fastify.mssql.pool.connect();
    const res = await fastify.mssql.pool.query('SELECT * FROM users');
    return { users: res.recordset };
  })

  fastify.put('/configs/:id', { schema: ConfigSchema }, async function(request, reply) {
    await fastify.mssql.pool.connect();
    const res = await fastify.mssql.pool.query('SELECT * FROM users');
    return { users: res.recordset };
  })
}
