
export default async function(fastify, opts) {
  fastify.get('/configs', { schema: ResetPasswordSchema }, async function(request, reply) {
    await fastify.mssql.pool.connect();
    const res = await fastify.mssql.pool.query('SELECT * FROM users');
    return { users: res.recordset };
  })

  fastify.post('/configs', { schema: ResetPasswordSchema }, async function(request, reply) {
    await fastify.mssql.pool.connect();
    const res = await fastify.mssql.pool.query('SELECT * FROM users');
    return { users: res.recordset };
  })

  fastify.put('/configs/:id', { schema: ResetPasswordSchema }, async function(request, reply) {
    await fastify.mssql.pool.connect();
    const res = await fastify.mssql.pool.query('SELECT * FROM users');
    return { users: res.recordset };
  })
}
