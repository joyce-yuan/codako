import * as types from '../constants/action-types';
import objectAssign from 'object-assign';

import {selectStageId} from './ui-actions';

// stage collection actions

export function createStage(worldId, stageName) {
  const stageId =  `${Date.now()}`;
  return (dispatch) => {
    dispatch({
      type: types.CREATE_STAGE,
      worldId,
      stageId,
      stageName,
    });
    dispatch(selectStageId(stageId));
  };
}

export function deleteStageId(worldId, stageId) {
  return {
    type: types.DELETE_STAGE_ID,
    worldId,
    stageId,
  };
}

// individual stage actions (Require world id, act on current stage in that world)

export function advanceGameState(worldId) {
  return {
    type: types.ADVANCE_GAME_STATE,
    worldId,
  };
}

export function stepBackGameState(worldId) {
  return {
    type: types.STEP_BACK_GAME_STATE,
    worldId,
  };
}

export function saveInitialGameState(worldId, {thumbnail, actors}) {
  return {
    type: types.SAVE_INITIAL_GAME_STATE,
    worldId,
    thumbnail,
    actors,
  };
}

export function restoreInitialGameState(worldId) {
  return {
    type: types.RESTORE_INITIAL_GAME_STATE,
    worldId,
  };
}

export function updateStageSettings(worldId, stageId, settings) {
  return {
    type: types.UPDATE_STAGE_SETTINGS,
    worldId,
    stageId,
    settings,
  };
}

export function recordKeyForGameState(worldId, key) {
  return {
    type: types.INPUT_FOR_GAME_STATE,
    worldId,
    keys: {[key]: true},
    clicks: {},
  };
}

export function recordClickForGameState(worldId, actorId) {
  return {
    type: types.INPUT_FOR_GAME_STATE,
    worldId,
    keys: {},
    clicks: {[actorId]: true},
  };
}

export function createActor({worldId, stageId}, character, initialValues) {
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
    worldId,
    stageId,
    actorId: newID,
    values: newActor,
  };
}
export function changeActor({worldId, stageId, actorId}, values) {
  return {
    type: types.UPSERT_ACTOR,
    worldId,
    stageId,
    actorId,
    values,
  };
}
export function deleteActor({worldId, stageId, actorId}) {
  return {
    type: types.DELETE_ACTOR,
    worldId,
    stageId,
    actorId,
  };
}
