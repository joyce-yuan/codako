import * as types from '../constants/action-types';
import objectAssign from 'object-assign';

export function advanceGameState(stageUid) {
  return {
    type: types.ADVANCE_GAME_STATE,
    stageUid,
  };
}

export function saveInitialGameState(stageUid, {thumbnail, actors}) {
  return {
    type: types.SAVE_INITIAL_GAME_STATE,
    stageUid,
    thumbnail,
    actors,
  };
}

export function restoreInitialGameState(stageUid) {
  return {
    type: types.RESTORE_INITIAL_GAME_STATE,
    stageUid,
  };
}

export function updateStageSettings(stageUid, settings) {
  return {
    type: types.UPDATE_STAGE_SETTINGS,
    stageUid, settings,
  };
}

export function recordKeyForGameState(stageUid, key) {
  return {
    type: types.INPUT_FOR_GAME_STATE,
    stageUid,
    keys: {[key]: true},
    clicks: {},
  };
}

export function recordClickForGameState(stageUid, actorId) {
  return {
    type: types.INPUT_FOR_GAME_STATE,
    stageUid,
    keys: {},
    clicks: {[actorId]: true},
  };
}

export function createActor(stageUid, character, initialValues) {
  const newID = `${Date.now()}`;

  const newActor = objectAssign({
    variableValues: {},
    appearance: Object.keys(character.spritesheet.appearances)[0],
  }, initialValues, {
    characterId: character.id,
    id: newID,
  });

  return {
    type: types.UPSERT_ACTOR,
    stageUid,
    id: newID,
    values: newActor,
  };
}
export function changeActor(stageUid, id, values) {
  return {
    type: types.UPSERT_ACTOR,
    stageUid,
    id,
    values,
  };
}
export function deleteActor(stageUid, id) {
  return {
    type: types.DELETE_ACTOR,
    stageUid,
    id,
  };
}
