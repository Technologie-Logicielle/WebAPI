"use strict";

import { sql } from "../../utils/sql.js";
import { security } from "../../constants/schema.js";
import { Conference } from "../conferences/index.js";
import { tags as allTags } from "../../constants/schema.js";

export const tags = [allTags.admin]

const { conference_id: _, ...UpdateConferenceProps } = Conference.properties

const UpdateConferenceSchema = {
  tags,
  security,
  params: {
    id: { type: "number" },
  },
  body: {
    type: "object",
    properties: UpdateConferenceProps,
  },
  response: {
    200: Conference
  }
};

const ConfigSchema = {
  security,
  tags,
};

const ConferenceListSchema = {
  tags,
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
export default async function(fastify, opts) {
  const onRequest = [fastify.authenticate, fastify.isAdmin];

  fastify.get(
    "/conferences",
    { schema: ConferenceListSchema, onRequest: onRequest },
    async function(request, reply) {
      const pool = await fastify.mssql.pool.connect();
      const res = await pool.query(sql`SELECT * FROM conference`);
      return res.recordset;
    },
  );

  fastify.patch(
    "/conferences/:id",
    {
      schema: UpdateConferenceSchema,
      onRequest,
    },
    async function(request, reply) {
      await fastify.mssql.pool.connect();
      const { id, ...update } = request.body
      if (!request.body || Object.keys(request.body) === 0) {
        throw fastify.httpErrors.badRequest("Request body cannot be empty");
      }
      const find = await fastify.mssql.pool
        .request()
        .input('id', request.params.id)
        .query(sql`
        SELECT * FROM conference WHERE conference_id=@id
      `);
      if (!find.recordset.length) {
        reply.callNotFound();
        return;
      }

      const req = fastify.mssql.pool
        .request()
        .input('id', request.params.id)
      const updates = []
      for (const key in update) {
        req.input(key, update[key])
        updates.push(sql`${key} = @${key}`)
      }

      await req
        .query(sql`
          UPDATE conference set ${updates.join()}
          WHERE conference_id = @id
        `)
      reply.code(204);
    },
  );

  fastify.get(
    "/configs",
    { schema: ConfigSchema, onRequest: onRequest },
    async function(request, reply) {
      await fastify.mssql.pool.connect();
      const res = await fastify.mssql.pool.query("SELECT * FROM crawler");
      return res.recordset;
    },
  );

  // fastify.post(
  //   "/configs",
  //   { schema: ConfigSchema, onRequest },
  //   async function (request, reply) {
  //     await fastify.mssql.pool.connect();
  //     const res = await fastify.mssql.pool.query("SELECT * FROM crawlers");
  //     return { users: res.recordset };
  //   },
  // );
  //
  // fastify.put(
  //   "/configs/:id",
  //   { schema: ConfigSchema, onRequest },
  //   async function (request, reply) {
  //     await fastify.mssql.pool.connect();
  //     const res = await fastify.mssql.pool.query("SELECT * FROM users");
  //     return { users: res.recordset };
  //   },
  // );
}
