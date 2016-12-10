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

export function createActorDescriptor(definition, initialValues) {
  return {
    type: types.CREATE_ACTOR_DESCRIPTOR,
    definition,
    initialValues,
  };
}
export function changeActorDescriptor(descriptorId, changes) {
  return {
    type: types.CHANGE_ACTOR_DESCRIPTOR,
    descriptorId,
    changes,
  };
}
