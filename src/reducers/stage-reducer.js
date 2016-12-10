import u from 'updeep';
import objectAssign from 'object-assign';

import {CHANGE_ACTOR_DESCRIPTOR, CREATE_ACTOR_DESCRIPTOR} from '../constants/action-types';
import initialState from './initial-state';

export default function stageReducer(state = initialState.stage, action) {
  switch (action.type) {
    case CHANGE_ACTOR_DESCRIPTOR: {
      return u({
        actorDescriptors: u.updateIn(action.descriptorId, action.changes)
      }, state);
    }
    case CREATE_ACTOR_DESCRIPTOR: {
      const {initialValues, definition} = action;
      const newID = state.uidnext;
      const newDescriptor = objectAssign({}, initialValues, {
        definitionId: definition.id,
        id: newID,
      });

      return u({
        uidnext: `${state.uidnext / 1 + 1}`,
        actorDescriptors: u.updateIn(newID, newDescriptor)
      }, state);
    }
    default:
      return state;
  }
}
