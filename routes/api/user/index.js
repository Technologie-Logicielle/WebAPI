"use strict";

import bcrypt from "bcrypt";
import { sql } from "../../../utils/sql.js";
import { security, tags as allTags } from "../../../constants/schema.js";

export const UserInfo = {
  type: "object",
  properties: {
    id: { type: "number" },
    username: { type: "string" },
    first_name: { type: "string" },
    last_name: { type: "string" },
    email: { type: "string" },
    role: { type: "string" },
  },
};

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}
async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

const tags = [allTags.user]

const email = { type: "string", format: "email" };
const username = { type: "string", pattern: "^[a-z][a-z0-9_]+$", minLength: 6, maxLength: 20 };
const password = { type: "string", pattern: "^[a-zA-Z0-9]+$", minLength: 6, maxLength: 20 };

/**
 * @implements {import('fastify').FastifySchema}
 */
const AuthBodySchema = {
  tags,
  body: {
    type: "object",
    properties: {
      email,
      password,
    },
    required: ["email", "password"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        ...UserInfo.properties,
        token: { type: "string" },
      },
    },
  },
};

const SignupSchema = {
  tags,
  body: {
    type: "object",
    properties: {
      username,
      first_name: { type: "string" },
      last_name: { type: "string" },
      email,
      password,
    },
    required: ["username", "first_name", "last_name", "email", "password"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        ...UserInfo.properties,
        token: { type: "string" },
      },
    },
  },
};

const ResetPasswordSchema = {
  tags,
  security: security,
  body: {
    type: "object",
    required: ["password", "new_password"],
    properties: {
      password,
      new_password: password,
    },
  },
};

/**
 * @type {import('fastify').FastifyPluginCallback}
 */
export default async function(fastify, opts) {
  const TYPES = fastify.mssql.sqlTypes;
  function getToken(user) {
    const token = fastify.jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      { expiresIn: "1d" },
    );
    return `Bearer ${token}`;
  }

  fastify.post(
    "/signin",
    { schema: AuthBodySchema },
    async function(request, reply) {
      const pool = await fastify.mssql.pool.connect();

      const res = await pool
        .request()
        .input("email", TYPES.VarChar, request.body.email)
        .query(sql`SELECT * FROM users WHERE email = @email`);
      if (!res.recordset.length) {
        throw fastify.httpErrors.unauthorized();
      }

      const user = res.recordset[0];

      const match = await bcrypt.compare(
        request.body.password,
        user.hashed_password,
      );
      if (!match) {
        throw fastify.httpErrors.unauthorized();
      }

      const token = getToken(user);
      return {
        ...user,
        token,
      };
    },
  );

  fastify.post(
    "/signup",
    { schema: SignupSchema },
    async function(request, reply) {
      const pool = await fastify.mssql.pool.connect();
      const { password, ...user } = request.body;
      const req = pool.request();
      const hashedPassword = await hashPassword(password);
      Object.keys(user).forEach((key) => {
        req.input(key, TYPES.VarChar, user[key]);
      });
      req.input("hashed_password", TYPES.VarChar, hashedPassword);

      const res = await req.query(sql`
        INSERT INTO users (username, hashed_password, first_name, last_name, email, role)
        OUTPUT INSERTED.id, INSERTED.role
        VALUES
        (@username, @hashed_password, @first_name, @last_name, @email, 'user');
    `);
      const inserted = res.recordset[0];
      const token = getToken({ ...user, ...inserted });

      return {
        ...user,
        ...inserted,
        token,
      };
    },
  );

  fastify.post(
    "/password",
    { schema: ResetPasswordSchema, onRequest: [fastify.authenticate] },
    async function(request, reply) {
      const pool = await fastify.mssql.pool.connect();
      let res = await pool
        .request()
        .input("id", TYPES.Int, request.user.id)
        .query(sql`SELECT * FROM users WHERE id = @id`);
      if (!res.recordset.length) {
        throw fastify.httpErrors.forbidden();
      }
      const user = res.recordset[0];
      if (
        !(await verifyPassword(request.body.password, user.hashed_password))
      ) {
        throw fastify.httpErrors.forbidden();
      }
      const newHashedPassword = await hashPassword(request.body.new_password);
      res = await pool
        .request()
        .input("hashed_password", TYPES.VarChar, newHashedPassword)
        .input("id", TYPES.Int, request.user.id).query(sql`
          UPDATE users SET hashed_password = @hashed_password 
          WHERE id=@id;
      `);
      reply.code(204).send();
    },
  );
}
