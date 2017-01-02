import * as types from '../constants/action-types';

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
        width: 40,
        appearances: {
          'idle': ['/img/splat.png'],
        },
        appearanceNames:{
          'idle': 'Idle',
        },
      },
      variables: {},
      world: 'x',
    }
  };
}

export function createCharacterFlowContainer(characterId, {id}) {
  return {
    type: types.CREATE_CHARACTER_FLOW_CONTAINER,
    characterId,
    id,
  };
}
export function createCharacterEventContainer(characterId, {id, eventCode, eventType}) {
  return {
    type: types.CREATE_CHARACTER_EVENT_CONTAINER,
    characterId,
    eventCode,
    eventType,
    id,
  };
}

export function createCharacterVariable(characterId) {
  const variableId = `${Date.now()}`;
  return {
    type: types.CREATE_CHARACTER_VARIABLE,
    characterId,
    variableId,
  };
}

export function createCharacterAppearance(characterId) {
  const newAnimationId = `${Date.now()}`;
  return {
    type: types.UPSERT_CHARACTER,
    characterId: characterId,
    values: {
      spritesheet: {
        appearances: {[newAnimationId]: ['/editor/img/splat.png']},
        appearanceNames: {[newAnimationId]: 'Untitled'},
      },
    },
  };
}

export function changeCharacterAppearanceName(characterId, appearanceId, name) {
  const values = {spritesheet: {appearanceNames: {}}};
  values.spritesheet.appearanceNames[appearanceId] = name;
  return changeCharacter(characterId, values);
}
