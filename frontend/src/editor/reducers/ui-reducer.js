import objectAssign from 'object-assign';
import u from 'updeep';

import * as Types from '../constants/action-types';
import {WORLDS} from '../constants/constants';
import {nullActorPath, buildActorPath} from '../utils/stage-helpers';
import initialState from './initial-state';

export default function uiReducer(state = initialState.ui, action) {
  switch (action.type) {
    case Types.START_RECORDING: {
      const entireState = window.editorStore.getState();
      const {actorId, characterId} = entireState.recording;
      const current = entireState.ui.selectedActorPath;

      return objectAssign({}, state, {
        selectedCharacterId: characterId,
        selectedActorPath: buildActorPath(WORLDS.AFTER, current.stageId, actorId),
      });
    }
    case Types.CANCEL_RECORDING: {
      return objectAssign({}, state, {
        selectedActorPath: nullActorPath(),
      });
    }
    case Types.FINISH_RECORDING: {
      return objectAssign({}, state, {
        selectedActorPath: nullActorPath(),
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
    case Types.UPDATE_MODAL_STATE: 
      return objectAssign({}, state, {
        modal: {
          openId: action.openId,
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
