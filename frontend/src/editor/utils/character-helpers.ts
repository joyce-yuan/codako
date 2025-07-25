import { Character } from "../../types";

export function defaultAppearanceId(spritesheet: Character["spritesheet"]): string {
  return Object.keys(spritesheet.appearances)[0];
}