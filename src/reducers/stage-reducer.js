import u from 'updeep';

import {UPSERT_ACTOR, DELETE_ACTOR} from '../constants/action-types';
import initialState from './initial-state';

export default function stageReducer(state = initialState.stage, action) {
  switch (action.type) {
    case UPSERT_ACTOR: {
      return u({
        actors: u.updateIn(action.id, action.values)
      }, state);
    }
    case DELETE_ACTOR: {
      return u({
        actors: u.omit(action.id),
      }, state);
    }
    default:
      return state;
  }
}
