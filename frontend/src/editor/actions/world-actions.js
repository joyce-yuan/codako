import * as types from '../constants/action-types';

export function upsertGlobal(worldId, globalId, changes) {
  return {
    type: types.UPSERT_GLOBAL,
    worldId,
    globalId,
    changes,
  };
}

export function createGlobal(worldId) {
  const globalId = `${Date.now()}`;
  return {
    type: types.UPSERT_GLOBAL,
    worldId,
    globalId,
    changes: {
      type: 'number',
      id: globalId,
      value: 0,
      name: 'Untitled',
    }
  };
}

export function deleteGlobal(worldId, globalId) {
  return {
    type: types.DELETE_GLOBAL,
    worldId,
    globalId,
  };
}