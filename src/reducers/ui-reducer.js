import * as Types from '../constants/action-types';
import objectAssign from 'object-assign';
import initialState from './initial-state';
import u from 'updeep';

export default function uiReducer(state = initialState.ui, action) {
  switch (action.type) {
    case Types.UPDATE_PLAYBACK_STATE:
      return u({playback: action.values}, state);
    case Types.SELECT_TOOL_ID:
      return objectAssign({}, state, {
        selectedToolId: action.toolId,
      });
    case Types.SELECT_DEFINITION_ID:
      return objectAssign({}, state, {
        selectedCharacterId: action.characterId,
        selectedActorId: action.actorId,
      });
    case Types.UPDATE_PAINTING_STATE:
      return objectAssign({}, state, {
        paint: {
          characterId: action.characterId,
          appearanceId: action.appearanceId,
        },
      });
    case Types.UPDATE_KEYPICKER_STATE:
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
