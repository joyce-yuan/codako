import {SELECT_TOOL_ID, SELECT_DEFINITION_ID, UPDATE_PAINTING_STATE, UPDATE_PLAYBACK_STATE, UPDATE_KEYPICKER_STATE} from '../constants/action-types';
import objectAssign from 'object-assign';
import initialState from './initial-state';
import u from 'updeep';

export default function toolbarReducer(state = initialState.ui, action) {
  switch (action.type) {
    case UPDATE_PLAYBACK_STATE:
      return u({playback: action.values}, state);
    case SELECT_TOOL_ID:
      return objectAssign({}, state, {
        selectedToolId: action.toolId,
      });
    case SELECT_DEFINITION_ID:
      return objectAssign({}, state, {
        selectedCharacterId: action.characterId,
        selectedActorId: action.actorId,
      });
    case UPDATE_PAINTING_STATE:
      return objectAssign({}, state, {
        paint: {
          characterId: action.characterId,
          appearanceId: action.appearanceId,
        },
      });
    case UPDATE_KEYPICKER_STATE:
      return objectAssign({}, state, {
        keypicker: {
          initialKeyCode: action.initialKeyCode,
          characterId: action.characterId,
          ruleId: action.ruleId,
        },
      });
    default:
      return state;
  }
}
