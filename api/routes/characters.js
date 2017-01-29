const fs = require('fs');
const path = require('path');

const CHARACTERS_DIR = './presets-characters';

function b64Image(filepath) {
  const data = fs.readFileSync(filepath).toString('base64');
  return `data:image/png;base64,${data}`;
}

function characterForDirectory(dir) {
  const appearances = {};
  const appearanceNames = {};

  fs.readdirSync(
    path.join(CHARACTERS_DIR, dir)
  ).filter(filename => filename.endsWith('.png')
  ).forEach(filename => {
    const key = filename.replace(' ', '').toLowerCase();
    appearances[key] = [b64Image(`${CHARACTERS_DIR}/${dir}/${filename}`)];
    appearanceNames[key] = filename.replace('.png', '');
  });

  return {
    name: dir,
    rules: [],
    variables: {},
    spritesheet: {
      width: 40,
      appearances,
      appearanceNames,
    },
  };
}

const characters = [];
for (const dir of fs.readdirSync(CHARACTERS_DIR)) {
  if (fs.statSync(path.join(CHARACTERS_DIR, dir)).isDirectory()) {
    characters.push(characterForDirectory(dir));
  }
}

module.exports = (server) => {
  server.route({
    method: 'GET',
    path: `/characters`,
    config: {
      description: `characters`,
      tags: ['characters'],
    },
    handler: (request, reply) => {
      reply(characters);
    }
  });
};
