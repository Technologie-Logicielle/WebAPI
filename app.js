'use strict'

import { join } from 'path'
import AutoLoad from '@fastify/autoload'
import mssql from 'fastify-mssql'
import { warn } from 'console'
import fastify from 'fastify'

const __dirname = import.meta.dirname;
export const options = {}

/**
 * @type {import('fastify').FastifyPluginCallback}
 */
export default async function(fastify, opts) {
  // Place here your custom code!

  fastify.register(mssql, {
    server: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    options: {
      trustServerCertificate: true,
    },
  })

  if (process.env.NODE_ENV === 'development') {
    const swagger = await import  ('@fastify/swagger')
    const reference = await import ('@scalar/fastify-api-reference')
    fastify.register(swagger)
    fastify.register(reference, {routePrefix: '/reference',})
    fastify.get('/doc', opts, (request, reply) => {
      reply.send(fastify.swagger())
    });
  }
  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: Object.assign({}, opts)
  })

}
