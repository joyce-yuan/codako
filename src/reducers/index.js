import { combineReducers } from 'redux';
import toolbarReducer from './toolbar-reducer';
import {routerReducer} from 'react-router-redux';

const rootReducer = combineReducers({
  toolbar: toolbarReducer,
  routing: routerReducer
});

export default rootReducer;
