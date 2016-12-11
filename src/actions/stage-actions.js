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

// Actor
// Cast

export function createActorDescriptor(definition, values) {
  return {
    type: types.UPSERT_ACTOR_DESCRIPTOR,
    definition,
    values,
  };
}
export function changeActorDescriptor(descriptorId, values) {
  return {
    type: types.UPSERT_ACTOR_DESCRIPTOR,
    descriptorId,
    values,
  };
}
export function deleteActorDescriptor(descriptorId) {
  return {
    type: types.DELETE_ACTOR_DESCRIPTOR,
    descriptorId,
  };
}
