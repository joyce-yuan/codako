import { combineReducers } from 'redux';
import toolbarReducer from './toolbar-reducer';
import actorsReducer from './actors-reducer';
import stageReducer from './stage-reducer';
import {routerReducer} from 'react-router-redux';

const rootReducer = combineReducers({
  actors: actorsReducer,
  toolbar: toolbarReducer,
  stage: stageReducer,
  routing: routerReducer
});

export default rootReducer;
