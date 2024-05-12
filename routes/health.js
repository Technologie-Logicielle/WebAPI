import p from "../package.json" assert { type: "json" };

/**
 * @type {import('fastify').FastifyPluginCallback}
 */
export default async function(fastify, opts) {
  fastify.get('/',
    async function(request, reply) {
      return { message: "OK", version: p.version }
    }
  )
}
