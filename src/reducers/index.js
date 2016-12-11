import { combineReducers } from 'redux';
import uiReducer from './ui-reducer';
import actorsReducer from './actors-reducer';
import stageReducer from './stage-reducer';
import {routerReducer} from 'react-router-redux';

const rootReducer = combineReducers({
  actors: actorsReducer,
  stage: stageReducer,
  ui: uiReducer,
  routing: routerReducer
});

export default rootReducer;
