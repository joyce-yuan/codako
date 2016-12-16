import { combineReducers } from 'redux';
import uiReducer from './ui-reducer';
import charactersReducer from './characters-reducer';
import stageReducer from './stage-reducer';
import recordingReducer from './recording-reducer';
import {routerReducer} from 'react-router-redux';

const rootReducer = combineReducers({
  characters: charactersReducer,
  stage: stageReducer,
  ui: uiReducer,
  routing: routerReducer,
  recording: recordingReducer,
});

export default rootReducer;
