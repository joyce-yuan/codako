const Joi = require('joi');
const db = require('../database');
const Boom = require('boom');

const StageShape = {
  name: Joi.string(),
  thumbnail: Joi.string(),
  data: Joi.string(),
}

module.exports = (server) => {
  server.route({
    method: 'GET',
    path: `/stages`,
    config: {
      description: `stages`,
      tags: ['stages'],
      validate: {
        query: {
          limit: Joi.number().integer().min(1).max(2000).default(100),
          offset: Joi.number().integer().min(0).default(0),
        },
      },
    },
    handler: (request, reply) => {
      const {user} = request.auth.credentials;
      db.Stage.findAll({where: {userId: user.id}}).then((stages) => {
        reply(stages.map(s => s.serialize()));
      });
    },
  });

  server.route({
    method: ['POST'],
    path: `/stages`,
    config: {
      description: `Create stage`,
      tags: ['stages'],
      validate: {
        payload: StageShape,
      },
    },
    handler: (request, reply) => {
      const {user} = request.auth.credentials;
      db.Stage.create({
        userId: user.id,
        name: request.payload.name,
        data: request.payload.data,
        thumbnail: request.payload.thumbnail,
      }).then((stage) => {
        reply(stage.serialize());
      })
      .catch((err) => {
        reply(Boom.badRequest(err.toString));
      });
    },
  });

  server.route({
    method: ['PUT'],
    path: `/stages/{objectId}`,
    config: {
      description: `Update stage`,
      tags: ['stages'],
      validate: {
        payload: StageShape,
      },
    },
    handler: (request, reply) => {
      const {user} = request.auth.credentials;
      const {objectId} = request.params;

      db.Stage.findOne({where: {userId: user.id, id: objectId}}).then((stage) => {
        stage.name = request.payload.name;
        stage.data = request.payload.data;
        stage.thumbnail = request.payload.thumbnail;
        return stage.save().then((saved) => {
          reply(saved.serialize());
        });
      })
      .catch((err) => {
        reply(Boom.badRequest(err.toString));
      });
    },
  });

  server.route({
    method: 'DELETE',
    path: `/stages/{objectId}`,
    config: {
      description: `Delete stage`,
      tags: ['stages'],
      validate: {
        params: {
          objectId: Joi.number().integer(),
        },
      },
    },
    handler: (request, reply) => {
      const {user} = request.auth.credentials;
      const {objectId} = request.params;

      db.Stage.findOne({where: {userId: user.id, id: objectId}}).then((stage) =>
        stage.destroy().then(() => {
          reply({success: true});
        })
      ).catch((err) => {
        reply(Boom.notFound(err.toString()));
      });
    },
  });
};
