import * as types from '../constants/action-types';

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

export function selectToolId(toolId) {
  return {
    type: types.SELECT_TOOL_ID,
    toolId,
  };
}

export function select(characterId, actorId) {
  return {
    type: types.SELECT_DEFINITION_ID,
    characterId,
    actorId,
  };
}

export function updatePlaybackState(values) {
  return {
    type: types.UPDATE_PLAYBACK_STATE,
    values,
  };
}


export function paintCharacterAppearance(characterId, appearanceId) {
  return {
    type: types.UPDATE_PAINTING_STATE,
    characterId,
    appearanceId,
  };
}
