// import {CHANGE_TOOL} from '../constants/action-types';
import initialState from './initial-state';


export default function toolbarReducer(state = initialState.actors, action) {
  switch (action.type) {
  //   case CHANGE_TOOL:
  //     return objectAssign({}, state, {tool: action.tool});
  //
    default:
      return state;
  }
}
