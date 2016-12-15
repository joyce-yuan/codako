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

export function changeCharacter(characterId, values) {
  return {
    type: types.UPSERT_CHARACTER,
    characterId,
    values,
  };
}

export function createCharacter() {
  const id = `${Date.now()}`;

  return {
    type: types.UPSERT_CHARACTER,
    characterId: id,
    values: {
      id: id,
      name: 'Untitled',
      rules: [],
      spritesheet: {
        data: 'data:image/png;base64',
        width: 40,
        appearances: {
          'idle': [0, 0],
        },
        appearanceNames:{
          'idle': 'Idle',
        },
      },
      variableDefaults: {},
      world: 'x',
    }
  };
}

export function createCharacterRule(characterId) {
  return {
    type: types.UPSERT_CHARACTER,
    characterId: characterId,
    values: {rules},
  };
}

export function createCharacterFlowContainer(characterId) {
}

export function createCharacterEventContainer(characterId, type) {
}

export function createCharacterAppearance(characterId) {
  const newAnimationId = `${Date.now()}`;
  const appearances = {};
  const appearanceNames = {};

  appearances[newAnimationId] = [];
  appearanceNames[newAnimationId] = 'Untitled';

  return {
    type: types.UPSERT_CHARACTER,
    characterId: characterId,
    values: {
      spritesheet: {
        appearances,
        appearanceNames
      },
    },
  };
}

export function changeCharacterAppearanceName(characterId, appearanceId, name) {
  const values = {spritesheet: {appearanceNames: {}}};
  values.spritesheet.appearanceNames[appearanceId] = name;
  return changeCharacter(characterId, values);
}
