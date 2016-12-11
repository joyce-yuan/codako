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

export function changeActorDefinition(definitionId, values) {
  return {
    type: types.UPSERT_ACTOR_DEFINITION,
    definitionId,
    values,
  };
}

export function createActorDefinition() {
  const id = `${Date.now()}`;

  return {
    type: types.UPSERT_ACTOR_DEFINITION,
    definitionId: id,
    values: {
      id: id,
      name: 'Untitled',
      rules: [],
      spritesheet: {
        data: 'data:image/png;base64',
        width: 40,
        animations: {
          'idle': [0, 0],
        },
        animationNames:{
          'idle': 'Idle',
        },
      },
      variableDefaults: {},
      world: 'x',
    }
  };
}

export function createActorAnimation(definitionId) {
  const newAnimationId = `${Date.now()}`;
  const animations = {};
  const animationNames = {};

  animations[newAnimationId] = [];
  animationNames[newAnimationId] = 'Untitled';

  return {
    type: types.UPSERT_ACTOR_DEFINITION,
    definitionId: definitionId,
    values: {
      spritesheet: {
        animations,
        animationNames
      },
    },
  };
}

export function changeActorAnimationName(definitionId, animationId, name) {
  const values = {spritesheet: {animationNames: {}}};
  values.spritesheet.animationNames[animationId] = name;
  return changeActorDefinition(definitionId, values);
}
