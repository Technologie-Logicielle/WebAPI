/**
 * @type {import('fastify').FastifyPluginCallback}
 */
export default async function (fastify, opts) {
  const onRequest = [fastify.authenticate, fastify.isAdmin];
}
