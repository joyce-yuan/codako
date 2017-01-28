const Joi = require('joi');
const db = require('../database');
const Boom = require('boom');

const WorldShape = Joi.object().keys({
  name: Joi.string(),
  thumbnail: Joi.string(),
  data: Joi.object(),
});

module.exports = (server) => {
  server.route({
    method: 'GET',
    path: `/worlds`,
    config: {
      description: `worlds`,
      tags: ['worlds'],
    },
    handler: (request, reply) => {
      const {user} = request.auth.credentials;
      db.World.findAll({where: {userId: user.id}}).then((worlds) => {
        reply(worlds.map(s => s.serialize()));
      });
    },
  });

  server.route({
    method: 'GET',
    path: `/worlds/{objectId}/data`,
    config: {
      description: `worlds`,
      tags: ['worlds'],
    },
    handler: (request, reply) => {
      const {user} = request.auth.credentials;
      const {objectId} = request.params;
      db.World.findOne({where: {userId: user.id, id: objectId}}).then((world) => {
        reply(JSON.parse(world.data));
      });
    },
  });

  server.route({
    method: ['POST'],
    path: `/worlds`,
    config: {
      description: `Create world`,
      tags: ['worlds'],
    },
    handler: (request, reply) => {
      const {user} = request.auth.credentials;
      db.World.create({
        userId: user.id,
        name: "Untitled",
        data: "{}",
        thumbnail: '#',
      })
      .then((world) => {
        reply(world.serialize());
      })
      .catch((err) => {
        reply(Boom.badRequest(err.toString));
      });
    },
  });

  server.route({
    method: ['POST'],
    path: `/worlds/{objectId}/duplicate`,
    config: {
      description: `Duplicate a world`,
      tags: ['worlds'],
    },
    handler: (request, reply) => {
      const {user} = request.auth.credentials;
      const {objectId} = request.params;

      db.World.findOne({where: {userId: user.id, id: objectId}}).then((world) =>
        db.World.create({
          userId: user.id,
          name: `${world.name} Copy`,
          data: world.data,
          thumbnail: world.thumbnail,
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
    path: `/worlds/{objectId}`,
    config: {
      description: `Update world`,
      tags: ['worlds'],
      validate: {
        payload: WorldShape,
      },
    },
    handler: (request, reply) => {
      const {user} = request.auth.credentials;
      const {objectId} = request.params;

      db.World.findOne({where: {userId: user.id, id: objectId}}).then((world) => {
        world.name = request.payload.name || world.name;
        world.thumbnail = request.payload.thumbnail || world.thumbnail;
        world.data = request.payload.data ? JSON.stringify(request.payload.data) : world.data;

        return world.save().then((saved) => {
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
    path: `/worlds/{objectId}`,
    config: {
      description: `Delete world`,
      tags: ['worlds'],
      validate: {
        params: {
          objectId: Joi.number().integer(),
        },
      },
    },
    handler: (request, reply) => {
      const {user} = request.auth.credentials;
      const {objectId} = request.params;

      db.World.findOne({where: {userId: user.id, id: objectId}}).then((world) =>
        world.destroy().then(() => {
          reply({success: true});
        })
      ).catch((err) => {
        reply(Boom.notFound(err.toString()));
      });
    },
  });
};
