import {CHANGE_TOOL} from '../constants/action-types';
import objectAssign from 'object-assign';
import initialState from './initial-state';


export default function toolbarReducer(state = initialState.toolbar, action) {
  switch (action.type) {
    case CHANGE_TOOL:
      return objectAssign({}, state, {tool: action.tool});

    default:
      return state;
  }
}
