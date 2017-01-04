import objectAssign from 'object-assign';

import * as Types from '../constants/action-types';
import uiReducer from './ui-reducer';
import charactersReducer from './characters-reducer';
import stageReducer from './stage-reducer';
import recordingReducer from './recording-reducer';
import {undoRedoReducerFactory} from '../utils/undo-redo';

const reducerMap = {
  characters: charactersReducer,
  stage: stageReducer,
  ui: uiReducer,
  recording: recordingReducer,
};

const undoRedoReducer = undoRedoReducerFactory({
  trackedKeys: [
    'characters',
    'recording',
    'stage',
    'world',
  ],
  ignoredActions: [
    Types.ADVANCE_GAME_STATE,
    Types.STEP_BACK_GAME_STATE,
    Types.INPUT_FOR_GAME_STATE,
  ],
});

export default function (state, action) {
  const nextState = objectAssign({}, state);
  for (const key of Object.keys(reducerMap)) {
    nextState[key] = reducerMap[key](state[key], action);
  }
  return undoRedoReducer(nextState, action);
}