import u from 'updeep';

import {CHANGE_ACTOR_DESCRIPTOR} from '../constants/action-types';
import initialState from './initial-state';

export default function stageReducer(state = initialState.stage, action) {
  switch (action.type) {
    case CHANGE_ACTOR_DESCRIPTOR: {
      return u.updateIn(`actorDescriptors.${action.descriptorId}`, action.changes, state);
    }
    default:
      return state;
  }
}
