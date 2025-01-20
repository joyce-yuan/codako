export const STAGE_CELL_SIZE = 40;

export enum WORLDS {
  ROOT = "root",
  BEFORE = "before",
  AFTER = "after",
}

export enum MODALS {
  STAGES = "STAGES",
  STAGE_SETTINGS = "STAGE_SETTINGS",
  VIDEOS = "VIDEOS",
}

export const SPEED_OPTIONS = {
  Slow: 1000,
  Normal: 500,
  Fast: 250,
};

export enum TOOLS {
  POINTER = "pointer",
  TRASH = "trash",
  RECORD = "record",
  PAINT = "paint",
  IGNORE_SQUARE = "ignore-square",
}

export enum RECORDING_PHASE {
  SETUP = "setup",
  RECORD = "record",
}
