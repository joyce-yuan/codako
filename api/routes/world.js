const Joi = require('joi');
const db = require('../database');
const Boom = require('boom');

const WorldShape = Joi.object().keys({
  name: Joi.string(),
  thumbnail: Joi.string(),
  data: Joi.object(),
});

module.exports = (server) => {
  // Public:

  server.route({
    method: 'GET',
    path: `/worlds/{objectId}`,
    config: {
      description: `worlds`,
      tags: ['worlds'],
      auth: {
        strategy: 'api-consumer',
        mode: 'optional',
      },
    },
    handler: (request, reply) => {
      // const {user} = request.auth.credentials;
      const {objectId} = request.params;
      db.World.findOne({where: {id: objectId}, include: {model: db.User}}).then((world) => {
        if (!world) {
          reply(Boom.notFound("Sorry, this would could not be found."));
          return;
        }
        reply(Object.assign({}, world.serialize(), {data: JSON.parse(world.data)}));
      });
    },
  });

  // Auth Required:

  server.route({
    method: 'GET',
    path: `/worlds`,
    config: {
      description: `worlds`,
      tags: ['worlds'],
      auth: {
        strategy: 'api-consumer',
        mode: 'optional',
      },
    },
    handler: (request, reply) => {
      let userPromise = null;
      if (request.query.user === 'me') {
        if (request.auth.credentials && request.auth.credentials.user) {
          userPromise = Promise.resolve(request.auth.credentials.user);
        } else {
          return reply(Boom.notFound("Sorry, you must sign in."));
        }
      } else {
        userPromise = db.User.find({where: {username: request.query.user}});
      }

      userPromise.then((user) => {
        db.World.findAll({where: {userId: user.id}, include: {model: db.User}}).then((worlds) => {
          reply(worlds.map(s => s.serialize()));
        });
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
        reply(Boom.badRequest(err.toString()));
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
        reply(Boom.badRequest(err.toString()));
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
        reply(Boom.badRequest(err.toString()));
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
