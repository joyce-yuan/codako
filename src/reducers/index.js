import {routerReducer} from 'react-router-redux';
import objectAssign from 'object-assign';

import mainReducer from './main-reducer';
import initialState from './initial-state';

export default (state = initialState, action) => {
  let nextState = objectAssign({}, state);
  nextState = mainReducer(nextState, action);
  nextState.routing = routerReducer(nextState.routing, action);

  return nextState;
};
