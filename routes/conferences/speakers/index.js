import { tags } from '../index.js'
import { sql } from '../../../utils/sql.js';
/**
 * @type {import('fastify').FastifyPluginCallback}
 */
export default async function(fastify, opts) {
  fastify.get("/:id", { schema: { params: { type: 'object', properties: { id: { type: 'number' } } }, tags } }, async function(request, reply) {
    const pool = await fastify.mssql.pool.connect();
    const res = await pool
      .request()
      .input('id', request.params.id)
      .query(sql`
        SELECT * FROM speakers WHERE id = @id
      `);
    if (!res.recordset.length) { reply.callNotFound(); return; }
    return res.recordset[0];
  });
}
