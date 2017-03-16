const Joi = require('joi');
const crypto = require('crypto');
const db = require('../database');
const {UniqueConstraintError} = require('sequelize');
const Boom = require('boom');

module.exports = (server) => {
  server.route({
    method: ['GET'],
    path: `/users/me`,
    config: {
      description: `Retrieve the current user's account`,
      tags: ['auth'],
    },
    handler: (request, reply) => {
      const {user} = request.auth.credentials;
      reply(user.serialize());
    },
  });

  server.route({
    method: ['POST'],
    path: `/users`,
    config: {
      description: `Create an account`,
      tags: ['auth'],
      auth: false,
      validate: {
        payload: {
          username: Joi.string(),
          email: Joi.string(),
          password: Joi.string(),
        },
      },
    },
    handler: (request, reply) => {
      const {username, email, password} = request.payload;

      const passwordSalt = `${ Math.round((new Date().valueOf() * Math.random()))}`;
      const hash = crypto.createHmac('sha512', passwordSalt);
      hash.update(password);
      const passwordHash = hash.digest('hex');

      db.User.create({
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        passwordHash,
        passwordSalt,
      }).then((user) => {
        reply(user.serialize());
      }).catch((err) => {
        if (err instanceof UniqueConstraintError) {
          reply(Boom.badRequest(`Sorry, the ${err.fields.join(',')} you provided has already been taken.`));
        } else {
          reply(Boom.badRequest(err.toString()));
        }
      });
    },
  });

  server.route({
    method: ['GET'],
    path: `/users/{username}`,
    config: {
      description: `Retrieve another user's account`,
      tags: ['auth'],
      auth: {
        strategy: 'api-consumer',
        mode: 'optional',
      },
    },
    handler: (request, reply) => {
      db.User.findOne({
        where: {username: request.params.username},
      }).then((user) => {
        reply(user.serialize());
      });
    },
  });

};