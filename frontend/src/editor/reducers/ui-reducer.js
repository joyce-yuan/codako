import * as Types from '../constants/action-types';
import objectAssign from 'object-assign';
import initialState from './initial-state';
import u from 'updeep';

export default function uiReducer(state = initialState.ui, action) {
  switch (action.type) {
    case Types.START_RECORDING: {
      const {actorId, characterId} = window.editorStore.getState().recording;
      return objectAssign({}, state, {
        selectedCharacterId: characterId,
        selectedActorPath: `after:${actorId}`,
      });
    }
    case Types.FINISH_RECORDING: {
      return objectAssign({}, state, {
        selectedActorPath: null,
      });
    }
    case Types.SELECT_TOOL_ID:
      return objectAssign({}, state, {
        selectedToolId: action.toolId,
      });
    case Types.SELECT_DEFINITION_ID:
      return objectAssign({}, state, {
        selectedCharacterId: action.characterId,
        selectedActorPath: action.actorPath,
      });
    case Types.UPDATE_PLAYBACK_STATE:
      return u({playback: action.values}, state);
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
    case Types.UPDATE_SETTINGS_MODAL_STATE: 
      return objectAssign({}, state, {
        settings: {
          open: action.open,
        },
      });
    case Types.UPDATE_TUTORIAL_STATE: 
      return objectAssign({}, state, {
        tutorial: {
          stepIndex: action.stepIndex,
        },
      });
    default:
      return state;
  }
}
