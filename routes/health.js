import p from "../package.json" assert { type: "json" };
import { sql } from "../utils/sql.js";

/**
 * @type {import('fastify').FastifyPluginCallback}
 */
export default async function(fastify, opts) {
  fastify.get('/',
    async function(request, reply) {
      const pool = await fastify.mssql.pool.connect();

      await pool.query(sql`SELECT 1;`);
      return { message: "OK", version: p.version }
    }
  )
}
