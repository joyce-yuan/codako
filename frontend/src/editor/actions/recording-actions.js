import * as types from '../constants/action-types';
import {stopPlayback} from './ui-actions';

export function setupRecordingForActor({characterId, actor}) {
  return (dispatch) => {
    dispatch(stopPlayback());
    dispatch({
      type: types.SETUP_RECORDING_FOR_ACTOR, characterId, actor,
    });
  }
}

export function setupRecordingForCharacter({characterId}) {
  return (dispatch) => {
    dispatch(stopPlayback());
    dispatch({
      type: types.SETUP_RECORDING_FOR_CHARACTER, characterId,
    });
  };
}

export function editRuleRecording({characterId, rule}) {
  return (dispatch) => {
    dispatch(stopPlayback());
    dispatch({
      type: types.EDIT_RULE_RECORDING, characterId, rule,
    });
  };
}

export function cancelRecording() {
  return {
    type: types.CANCEL_RECORDING,
  };
}

export function finishRecording() {
  return {
    type: types.FINISH_RECORDING,
  };
}

export function startRecording() {
  return {
    type: types.START_RECORDING,
  };
}

export function setRecordingExtent(extent) {
  return {
    type: types.SET_RECORDING_EXTENT, extent,
  };
}

export function updateRecordingCondition(actorId, key, values) {
  return {
    type: types.UPDATE_RECORDING_CONDITION, actorId, key, values
  };
}