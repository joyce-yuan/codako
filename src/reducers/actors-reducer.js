import u from 'updeep';

import {UPSERT_ACTOR_DEFINITION, DELETE_ACTOR_DEFINITION} from '../constants/action-types';
import initialState from './initial-state';


export default function toolbarReducer(state = initialState.actors, action) {
  switch (action.type) {
    case UPSERT_ACTOR_DEFINITION: {
      return u.updateIn(action.definitionId, action.values, state);
    }
    case DELETE_ACTOR_DEFINITION: {
      return u.omit(action.definitionId, state);
    }
    default:
      return state;
  }
}
