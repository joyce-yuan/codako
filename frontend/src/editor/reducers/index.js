import objectAssign from 'object-assign';

import * as Types from '../constants/action-types';
import uiReducer from './ui-reducer';
import charactersReducer from './characters-reducer';
import stageCollectionReducer from './stage-collection-reducer';
import recordingReducer from './recording-reducer';
import globalsReducer from './globals-reducer';
import {undoRedoReducerFactory} from '../utils/undo-redo';

const reducerMap = {
  ui: uiReducer,
  stages: stageCollectionReducer,
  globals: globalsReducer,
  characters: charactersReducer,
  recording: recordingReducer,
};

const undoRedoReducer = undoRedoReducerFactory({
  trackedKeys: [
    'recording',
    'globals',
    'characters',
    'stages',
  ],
  ignoredActions: [
    Types.ADVANCE_GAME_STATE,
    Types.STEP_BACK_GAME_STATE,
    Types.INPUT_FOR_GAME_STATE,
  ],
});

function applyReducerMap(map, state, action) {
 const nextState = objectAssign({}, state);

  for (const key of Object.keys(map)) {
    if (map[key] instanceof Function) {
      nextState[key] = map[key](state[key], action);
    } else {
      nextState[key] = applyReducerMap(map[key], state[key], action);
    }
  }

  return nextState;
}

export default function (state, action) {
  // apply reducers that handle individual state keys
  let nextState = applyReducerMap(reducerMap, state, action);

  // apply undo/redo actions
  nextState = undoRedoReducer(nextState, action);

  return nextState;
}