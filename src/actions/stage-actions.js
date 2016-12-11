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

export function createActor(character, initialValues) {
  const newID = `${Date.now()}`;
  const newActor = objectAssign({}, initialValues, {
    characterId: character.id,
    id: newID,
  });

  return {
    type: types.UPSERT_ACTOR,
    id: newID,
    values: newActor,
  };
}
export function changeActor(id, values) {
  return {
    type: types.UPSERT_ACTOR,
    id,
    values,
  };
}
export function deleteActor(id) {
  return {
    type: types.DELETE_ACTOR,
    id,
  };
}
