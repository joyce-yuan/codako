import * as types from '../constants/action-types';

export function upsertGlobal(globalId, changes) {
  return {
    type: types.UPSERT_GLOBAL,
    globalId,
    changes,
  };
}

export function createGlobal() {
  const globalId = `${Date.now()}`;
  return {
    type: types.UPSERT_GLOBAL,
    globalId,
    changes: {
      type: 'number',
      id: globalId,
      value: 0,
      name: 'Untitled',
    }
  };
}

export function deleteGlobal(globalId) {
  return {
    type: types.DELETE_GLOBAL,
    globalId,
  };
}