import * as types from '../constants/action-types';
import objectAssign from 'object-assign';

import {selectStageId} from './ui-actions';

export function createStage() {
  const stageId =  `${Date.now()}`;
  return (dispatch) => {
    dispatch({
      type: types.CREATE_STAGE,
      stageId,
    });
    dispatch(selectStageId(stageId));
  };
}

export function deleteStageId(stageId) {
  return {
    type: types.DELETE_STAGE_ID,
    stageId,
  };
}

// individual stage actions (Require stage ID)

export function advanceGameState(stageId) {
  return {
    type: types.ADVANCE_GAME_STATE,
    stageId,
  };
}

export function stepBackGameState(stageId) {
  return {
    type: types.STEP_BACK_GAME_STATE,
    stageId,
  };
}

export function saveInitialGameState(stageId, {thumbnail, actors}) {
  return {
    type: types.SAVE_INITIAL_GAME_STATE,
    stageId,
    thumbnail,
    actors,
  };
}

export function restoreInitialGameState(stageId) {
  return {
    type: types.RESTORE_INITIAL_GAME_STATE,
    stageId,
  };
}

export function updateStageSettings(stageId, settings) {
  return {
    type: types.UPDATE_STAGE_SETTINGS,
    stageId, settings,
  };
}

export function recordKeyForGameState(stageId, key) {
  return {
    type: types.INPUT_FOR_GAME_STATE,
    stageId,
    keys: {[key]: true},
    clicks: {},
  };
}

export function recordClickForGameState(stageId, actorId) {
  return {
    type: types.INPUT_FOR_GAME_STATE,
    stageId,
    keys: {},
    clicks: {[actorId]: true},
  };
}

export function createActor(stageId, character, initialValues) {
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
    stageId,
    id: newID,
    values: newActor,
  };
}
export function changeActor(stageId, id, values) {
  return {
    type: types.UPSERT_ACTOR,
    stageId,
    id,
    values,
  };
}
export function deleteActor(stageId, id) {
  return {
    type: types.DELETE_ACTOR,
    stageId,
    id,
  };
}
