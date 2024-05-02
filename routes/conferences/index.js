"use strict";

import mssql from "mssql";
import { sql } from "../../utils/sql.js";

const security = [
  {
    bearerAuth: [],
  },
];
export const tags = ['conferences'];

const SearchParams = {
  type: "object",
  properties: {
    name: { type: "string" },
    country: { type: "string" },
    city: { type: "string" },
    page: { type: "number", default: 1 },
    pageSize: { type: "number", default: 20, minimum: 10, maximum: 50 },
    orderBy: {
      type: "string",
      default: "end_date",
      enum: ["start_date", "end_date", "name", "city", "country"],
    },
    order: { type: "string", default: "desc", enum: ["asc", "desc"] },
  },
  additionalProperties: false,
};

const Deadline = {
  type: "object",
  properties: {
    date: { type: "string" },
    info: { type: "string" },
  },
};

const Notification = {
  type: "object",
  properties: {
    date: { type: "string" },
    data: { type: "string" },
  },
};

const Conference = {
  type: "object",
  properties: {
    conference_id: {type: "number"},
    code: { type: "string" },
    name: { type: "string" },
    country: { type: "string" },
    city: { type: "string" },
    date: { type: "string" },
    start_date: { type: "string", format: "date" },
    end_date: { type: "string", format: "date" },
    description: { type: "string", },
    url: { type: "string", },
  },
};

const Paper = {
  type: "object",
  properties: {
    id: { type: "number" },
    title: { type: "string" },
    abstract: { type: "string" },
    accepted: { type: "boolean" },
  },
};

const Speaker = {
  type: "object",
  properties: {
    id: { type: "number" },
    name: { type: "string" },
    bio: { type: "string" },
    organization: { type: "string" },
  },
};

const ConferenceDetails = {
  type: "object",
  properties: {
    ...Conference.properties,
    deadlines: {
      type: "array",
      items: Deadline,
    },
    notifications: {
      type: "array",
      items: Notification,
    },

    papers: {
      type: "array",
      items: Paper,
    },

    speakers: {
      type: "array",
      items: Speaker,
    },
  },
};

const ConferenceSchema = {
  tags,
  response: {
    200: ConferenceDetails,
  },
};
const ConferenceListSchema = {
  tags,
  querystring: SearchParams,
  response: {
    200: {
      conferences: {
      type: "array",
      items: Conference,
      },
      count: { type: 'number'}
    },
  },
};

const FollowSchema = {
  tags,
  security,
};

/**
 * @type {import('fastify').FastifyPluginCallback}
 */
export default async function (fastify, opts) {
  fastify.get(
    "/",
    { schema: ConferenceListSchema },
    async function (request, reply) {
      console.log(request.query);
      const { name, page, pageSize, orderBy, order, ...others } = request.query;

      const pool = await fastify.mssql.pool.connect();
      const req = pool.request();

      const wheres = ["1=1"]; // default match all
      if (name) {
        req.input("name", mssql.TYPES.VarChar, name);
        wheres.push(sql`name LIKE @name + '%'`);
      }
      for (const key in others) {
        req.input(key, others[key]);
        wheres.push(sql`${key} = @${key}`);
      }

      req.input("offset", mssql.TYPES.Int, (page - 1) * pageSize);
      req.input("limit", mssql.TYPES.Int, pageSize);
      const res = await req.query(
        sql`
        SELECT 
          *
        FROM conference c
        WHERE ${wheres.join(sql` AND `)}
        ORDER BY ${orderBy} ${order}
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY;

        SELECT 
          count(*) as c
        FROM conference
        WHERE ${wheres.join(sql` AND `)}
      `,
      );
      return { conferences: res.recordsets[0], count: res.recordsets[1][0].c };
    },
  );

  fastify.get(
    "/:id",
    { schema: ConferenceSchema },
    async function (request, reply) {
      const pool = await fastify.mssql.pool.connect();
      const res = await pool
        .request()
        .input("id", mssql.TYPES.Int, request.params.id)
        .query(
          sql`
        SELECT 
          c.*,
          (SELECT n.* FOR JSON PATH) as notifications,
          (SELECT p.* FOR JSON PATH) as papers,
          (SELECT d.* FOR JSON PATH) as deadlines
        FROM conference c
        LEFT JOIN papers p ON c.conference_id = p.conference_id
        LEFT JOIN deadline d ON c.conference_id = d.conference_code
        LEFT JOIN notification n ON c.conference_id = n.conference_code
        WHERE c.conference_id = @id
      `,
        );
      if (!res.recordset.length) {
        return reply.callNotFound();
      }

      return res.recordset.map((c) => ({
        ...c,
        notifications: JSON.parse(c.notifications),
        papers: JSON.parse(c.papers),
        deadlines: JSON.parse(c.deadlines),
      }))[0];
    },
  );

  fastify.put(
    "/:id/follow",
    { schema: FollowSchema, onRequest: [fastify.authenticate] },
    async function (request, reply) {
      const pool = await fastify.mssql.pool.connect();
      const res = await pool
        .request()
        .input("userId", mssql.TYPES.Int, request.user.id)
        .input("id", mssql.TYPES.Int, request.params.id).query(sql`
      SELECT * FROM user_follow_conference
      WHERE conf_code = @id AND user_id = @userId
    `);
      if (res.recordset.length) {
        return reply.code(204);
      }
      await pool
        .request()
        .input("userId", mssql.TYPES.Int, request.user.id)
        .input("id", mssql.TYPES.Int, request.params.id).query(sql`
        INSERT INTO user_follow_conference (conf_code, user_id)
        VALUES(@id, @userId);   
      `);
      return reply.code(204);
    },
  );

  fastify.put(
    "/:id/unfollow",
    { schema: FollowSchema, onRequest: [fastify.authenticate] },
    async function (request, reply) {
      const pool = await fastify.mssql.pool.connect();
      await pool
        .request()
        .input("userId", mssql.TYPES.Int, request.user.id)
        .input("id", mssql.TYPES.Int, request.params.id).query(sql`
        DELETE FROM user_follow_conference
        WHERE conf_code = @id AND user_id = @userId
      `);
      return reply.code(204);
    },
  );
}
