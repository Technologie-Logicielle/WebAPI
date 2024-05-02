"use strict";

import { sql } from "../../utils/sql.js";

const security = [
  {
    bearerAuth: [],
  },
];

const Conference = {
  type: "object",
  properties: {
    id: { type: "number" },
  },
};

const UpdateConferenceSchema = {
  security,
  params: {
    id: { type: "number" },
  },
  body: {
    type: "object",
    properties: {
      ...Conference.properties,
    },
  },
};

const ConfigSchema = {};

const ConferencesSchema = {
  security,
  response: {
    200: {
      type: "array",
      items: Conference,
    },
  },
};

/**
 * @type {import('fastify').FastifyPluginCallback}
 */
export default async function (fastify, opts) {
  const onRequest = [fastify.authenticate, fastify.isAdmin];

  fastify.get(
    "/conferences",
    { schema: ConferencesSchema, onRequest: onRequest },
    async function (request, reply) {
      const pool = await fastify.mssql.pool.connect();
      const res = await pool.query(sql`SELECT * FROM conferences`);
      return [];
    },
  );

  fastify.put(
    "/conferences/:id",
    {
      schema: UpdateConferenceSchema,
      onRequest,
    },
    async function (request, reply) {
      await fastify.mssql.pool.connect();
      const res = await fastify.mssql.pool.query("SELECT * FROM users");
      return { users: res.recordset };
    },
  );

  fastify.get(
    "/configs",
    { schema: ConfigSchema, onRequest: onRequest },
    async function (request, reply) {
      await fastify.mssql.pool.connect();
      const res = await fastify.mssql.pool.query("SELECT * FROM users");
      return { users: res.recordset };
    },
  );

  fastify.post(
    "/configs",
    { schema: ConfigSchema, onRequest },
    async function (request, reply) {
      await fastify.mssql.pool.connect();
      const res = await fastify.mssql.pool.query("SELECT * FROM users");
      return { users: res.recordset };
    },
  );

  fastify.put(
    "/configs/:id",
    { schema: ConfigSchema, onRequest },
    async function (request, reply) {
      await fastify.mssql.pool.connect();
      const res = await fastify.mssql.pool.query("SELECT * FROM users");
      return { users: res.recordset };
    },
  );
}
