'use strict'

// import { sql } from '../../utils/sql.js'

const SearchParams = {
  type: 'object',
  properties: {
    name: { type: 'string'},
    country: { type: 'string'},
    city: { type: 'string'},
    date: { type: 'string'},
    topic: { type: 'string'},
    page: {type: 'number'},
    pageSize: {type: 'number'}
  }
}

const Deadline = {
  type: 'object',
  properties: {
    date: { type: 'string'},
    info: { type: 'string'},
  }
}

const Notification = {
  type: 'object',
  properties: {
    date: { type: 'string'},
    data: { type: 'string'},
  }
}

const Conference = {
  type: 'object',
  properties: {
    code: { type: 'string'},
    name: { type: 'string'},
    country: { type: 'string'},
    city: { type: 'string'},
    date: { type: 'string'},
  }
}

const ConferenceDetails = {
  type: 'object',
  properties: {
    ...Conference.properties,
    deadlines: {
      type: 'array',
      items: Deadline,
    },
    notifications: {
      type: 'array',
      items: Notification
    },
    
    papers: {
      type: 'array',
      items: { type: 'string'}
    },

    speakers: {
      type: 'array',
      items: { type: 'string'}
    },
  }
}

const ConferenceSchema = {
  response: {
    200: ConferenceDetails
  }
}
const ConferenceListSchema = {
  querystring: SearchParams,
  response: {
    200: {
      type: 'array',
      items: Conference
    }
  }
}

/**
  * @type {import('fastify').FastifyPluginCallback}
  */
export default async function(fastify, opts) {
  fastify.get('/', { schema: ConferenceListSchema }, async function(request, reply) {
    // await fastify.mssql.pool.connect();
    // const res = await fastify.mssql.pool.query(sql`SELECT 1`);
    return [];
  })

  fastify.get('/:id', { schema: ConferenceSchema }, async function(request, reply) {
    // await fastify.mssql.pool.connect();
    // const res = await fastify.mssql.pool.query(sql`SELECT 1`);
    return {};
  })

  
  fastify.put('/:id/follow', { schema: ConferenceSchema }, async function(request, reply) {
    // await fastify.mssql.pool.connect();
    // const res = await fastify.mssql.pool.query(sql`SELECT 1`);
    return {};
  })

  fastify.put('/:id/unfollow', { schema: ConferenceSchema }, async function(request, reply) {
    // await fastify.mssql.pool.connect();
    // const res = await fastify.mssql.pool.query(sql`SELECT 1`);
    return {};
  })
}
