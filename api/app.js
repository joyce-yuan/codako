const Hapi = require('hapi');
const HapiBasicAuth = require('hapi-auth-basic');
const Inert = require('inert');
const Vision = require('vision');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
global.Logger = require('winston');

const db = require('./database');

const server = new Hapi.Server({
  debug: { request: ['error'] },
  connections: {
    router: {
      stripTrailingSlash: true,
    },
    routes: {
      cors: {
        origin: ['*.lvh.me:3000', '*.codako.com'],
      },
    },
  },
});

server.connection({ port: process.env.PORT });

const validate = (incomingRequest, username, password, callback) => {
  db.User.find({
    where: {
      $or: [{email: username}, {username: username}],
    },
  }).then((user) => {
    if (!user) {
      callback(null, false, {});
      return;
    }
    const hash = crypto.createHmac('sha512', user.passwordSalt);
    hash.update(password);
    if (user.passwordHash !== hash.digest('hex')) {
      callback(null, false, {});
      return;
    }

    callback(null, true, {user});
  });
};

const attach = (directory) => {
  const routesDir = path.join(__dirname, directory)
  fs.readdirSync(routesDir).forEach((filename) => {
    if (filename.endsWith('.js')) {
      const routeFactory = require(path.join(routesDir, filename));
      routeFactory(server);
    }
  });
};

server.register([Inert, Vision, HapiBasicAuth], (err) => {
  if (err) { throw err; }

  attach('./routes/');
  attach('./decorators/');

  server.auth.strategy('api-consumer', 'basic', { validateFunc: validate });
  server.auth.default('api-consumer');

  server.start((startErr) => {
    if (startErr) { throw startErr; }
    global.Logger.info({url: server.info.uri}, 'API running');
  });
});
