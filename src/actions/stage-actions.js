import * as types from '../constants/action-types';
import objectAssign from 'object-assign';

// example of a thunk using the redux-thunk middleware
// export function saveFuelSavings(settings) {
//   return function (dispatch) {
//     // thunks allow for pre-processing actions, calling apis, and dispatching multiple actions
//     // in this case at this point we could call a service that would persist the fuel savings
//     return dispatch({
//       type: types.SAVE_FUEL_SAVINGS,
//       dateModified: dateHelper.getFormattedDateTime(),
//       settings
//     });
//   };
// }

export function advanceGameState() {
  return {
    type: types.ADVANCE_GAME_STATE,
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
