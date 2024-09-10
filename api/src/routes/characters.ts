import express from "express";
import fs from "fs";
import path from "path";

const CHARACTERS_DIR = "./presets-characters";

function b64Image(filepath: string) {
  const data = fs.readFileSync(filepath).toString("base64");
  return `data:image/png;base64,${data}`;
}

function characterForDirectory(dir: string): Character {
  const appearances: { [key: string]: string[] } = {};
  const appearanceNames: { [key: string]: string } = {};

  fs.readdirSync(path.join(CHARACTERS_DIR, dir))
    .filter((filename) => filename.endsWith(".png"))
    .forEach((filename) => {
      const key = filename.replace(" ", "").toLowerCase();
      appearances[key] = [b64Image(`${CHARACTERS_DIR}/${dir}/${filename}`)];
      appearanceNames[key] = filename.replace(".png", "");
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

type Character = {
  name: string;
  rules: any[];
  variables: { [key: string]: string };
  spritesheet: {
    width: number;
    appearances: { [key: string]: string[] };
    appearanceNames: { [key: string]: string };
  };
};

const characters: Character[] = [];
for (const dir of fs.readdirSync(CHARACTERS_DIR)) {
  if (fs.statSync(path.join(CHARACTERS_DIR, dir)).isDirectory()) {
    characters.push(characterForDirectory(dir));
  }
}

const router = express.Router();

router.get("/characters", async (req, res) => {
  res.json(characters);
});

export default router;
