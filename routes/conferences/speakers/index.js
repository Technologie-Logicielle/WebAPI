
/**
  * @type {import('fastify').FastifyPluginCallback}
  */
export default async function(fastify, opts) {

  fastify.get('/:id', {}, async function(request, reply) {
    // await fastify.mssql.pool.connect();
    // const res = await fastify.mssql.pool.query(sql`SELECT 1`);
    return {};
  })
}
