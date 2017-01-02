const Sequelize = require('sequelize');
const fs = require('fs');
const path = require('path');

const STORAGE_DIR = path.join(__dirname, 'storage');
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR);
}

function readModelsInDirectory(sequelize, dirname) {
  const db = {};
  const paths = [];
  for (const filename of fs.readdirSync(dirname)) {
    if (filename.endsWith('.js')) {
      paths.push(path.join(dirname, filename));
    }
  }

  for (const filepath of paths) {
    const model = sequelize.import(filepath);
    db[model.name[0].toUpperCase() + model.name.substr(1)] = model;
  }

  Object.keys(db).forEach((modelName) => {
    if ("associate" in db[modelName]) {
      db[modelName].associate(db);
    }
  });

  return db;
}

let sequelize = null;

if (process.env.DB_HOSTNAME) {
  sequelize = new Sequelize('codako', process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOSTNAME,
    dialect: "mysql",
    charset: 'utf8',
    logging: false,
    pool: {
      min: 1,
      max: 15,
      idle: 5000,
    },
    define: {
      charset: 'utf8',
      collate: 'utf8_general_ci',
    },
  });
} else {
  sequelize = new Sequelize('codako', '', '', {
    storage: path.join(STORAGE_DIR, `codako.sqlite`),
    dialect: "sqlite",
    logging: false,
  });
}

const db = readModelsInDirectory(sequelize, path.join(__dirname, 'models'));
db.sequelize = sequelize;
db.Sequelize = Sequelize;

sequelize.authenticate().then(() =>
  sequelize.sync()
);

module.exports = db;