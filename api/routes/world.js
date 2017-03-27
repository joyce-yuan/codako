const Joi = require('joi');
const db = require('../database');
const Boom = require('boom');

const WorldShape = Joi.object().keys({
  name: Joi.string(),
  thumbnail: Joi.string(),
  data: Joi.object(),
});

const WorldIncludes = [db.User, {as: 'forkParent', model: db.World, include: [db.User]}];


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
      let {objectId} = request.params;
      if (objectId === 'tutorial') {
        objectId = process.env.TUTORIAL_WORLD_ID;
      }
      db.World.findOne({where: {id: objectId}, include: WorldIncludes}).then((world) => {
        if (!world) {
          reply(Boom.notFound("Sorry, this world could not be found."));
          return;
        }

        world.playCount += 1;
        world.save();

        reply(Object.assign({}, world.serialize(), {
          data: world.data ? JSON.parse(world.data) : null,
        }));
      });
    },
  });

  server.route({
    method: 'GET',
    path: `/worlds/explore`,
    config: {
      description: `worlds`,
      tags: ['worlds'],
      auth: {
        strategy: 'api-consumer',
        mode: 'optional',
      },
    },
    handler: (request, reply) => {
      db.World.findAll({
        limit: 50,
        order: '`world`.`playCount` DESC',
        include: WorldIncludes,
      }).then((worlds) => {
        reply(worlds.map(w => w.serialize()));
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
        db.World.findAll({where: {userId: user.id}, include: WorldIncludes}).then((worlds) => {
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
      const {fork} = request.query;
      let {from} = request.query;

      let fetchSource = Promise.resolve(null);
      if (from) {
        if (from === 'tutorial') {
          from = process.env.TUTORIAL_WORLD_ID;
        }
        fetchSource = db.World.findOne({where: {id: from}});
      }

      fetchSource.then((sourceWorld) => {
        if (sourceWorld) {
          if (fork) {
            sourceWorld.forkCount += 1;
            sourceWorld.save();
          }
          return db.World.create({
            userId: user.id,
            name: sourceWorld.name,
            data: sourceWorld.data,
            thumbnail: sourceWorld.thumbnail,
            forkParentId: fork ? sourceWorld.id : null,
          });
        }
        return db.World.create({
          userId: user.id,
          name: "Untitled",
          data: null,
          thumbnail: '#',
        });
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
        if (!world) {
          reply(Boom.notFound("No world with that ID exists for that user."));
          return Promise.resolve();
        }
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
