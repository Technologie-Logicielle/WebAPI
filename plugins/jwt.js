import fp from "fastify-plugin"
import jwt from "@fastify/jwt"

export default fp(async function(fastify, opts) {
  fastify.register(jwt, {
    secret: process.env.SECRET
  })

  fastify.decorate("authenticate", async function(request, reply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err)
    }
  })

  fastify.decorate("isAdmin", async function(request, reply) {
    try {
      if (request.user?.role !== "admin") {
        throw fastify.httpErrors.unauthorized();
      }
    } catch (err) {
      reply.send(err)
    }
  })

})
