const Joi = require('joi');
const db = require('../database');
const Boom = require('boom');

const StageShape = Joi.object().keys({
  name: Joi.string(),
  thumbnail: Joi.string(),
  state: Joi.object(),
});

module.exports = (server) => {
  server.route({
    method: 'GET',
    path: `/stages`,
    config: {
      description: `stages`,
      tags: ['stages'],
    },
    handler: (request, reply) => {
      const {user} = request.auth.credentials;
      db.Stage.findAll({where: {userId: user.id}}).then((stages) => {
        reply(stages.map(s => s.serialize()));
      });
    },
  });

  server.route({
    method: 'GET',
    path: `/stages/{objectId}/state`,
    config: {
      description: `stages`,
      tags: ['stages'],
    },
    handler: (request, reply) => {
      const {user} = request.auth.credentials;
      const {objectId} = request.params;
      db.Stage.findOne({where: {userId: user.id, id: objectId}}).then((stage) => {
        reply(JSON.parse(stage.data));
      });
    },
  });

  server.route({
    method: ['POST'],
    path: `/stages`,
    config: {
      description: `Create stage`,
      tags: ['stages'],
    },
    handler: (request, reply) => {
      const {user} = request.auth.credentials;
      db.Stage.create({
        userId: user.id,
        name: "Untitled",
        data: "{}",
        thumbnail: '#',
      })
      .then((stage) => {
        reply(stage.serialize());
      })
      .catch((err) => {
        reply(Boom.badRequest(err.toString));
      });
    },
  });

  server.route({
    method: ['POST'],
    path: `/stages/{objectId}/duplicate`,
    config: {
      description: `Duplicate a stage`,
      tags: ['stages'],
    },
    handler: (request, reply) => {
      const {user} = request.auth.credentials;
      const {objectId} = request.params;

      db.Stage.findOne({where: {userId: user.id, id: objectId}}).then((stage) =>
        db.Stage.create({
          userId: user.id,
          name: `${stage.name} Copy`,
          data: stage.data,
          thumbnail: stage.thumbnail,
        })
        .then((clone) => {
          reply(clone.serialize());
        })
      )
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
        stage.name = request.payload.name || stage.name;
        stage.thumbnail = request.payload.thumbnail || stage.thumbnail;
        stage.data = request.payload.state ? JSON.stringify(request.payload.state) : stage.data;

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
