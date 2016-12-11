import u from 'updeep';

import {UPSERT_ACTOR_DESCRIPTOR, DELETE_ACTOR_DESCRIPTOR} from '../constants/action-types';
import initialState from './initial-state';

export default function stageReducer(state = initialState.stage, action) {
  switch (action.type) {
    case UPSERT_ACTOR_DESCRIPTOR: {
      return u({
        actorDescriptors: u.updateIn(action.descriptorId, action.values)
      }, state);
    }
    case DELETE_ACTOR_DESCRIPTOR: {
      return u({
        actorDescriptors: u.omit(action.descriptorId),
      }, state);
    }
    default:
      return state;
  }
}
