import * as types from '../constants/action-types';

export function startRecording({characterId, actor}) {
  return {
    type: types.START_RECORDING, characterId, actor,
  };
}

export function editRuleRecording({characterId, rule}) {
  return {
    type: types.EDIT_RULE_RECORDING, characterId, rule,
  };
}

export function cancelRecording() {
  return {
    type: types.CANCEL_RECORDING,
  };
}

export function setRecordingPhase(phase) {
  return {
    type: types.SET_RECORDING_PHASE, phase,
  };
}

export function setRecordingExtent(extent) {
  return {
    type: types.SET_RECORDING_EXTENT, extent,
  };
}

export function updateRecordingCondition(actorId, key, values) {
  return {
    type: types.UPDATE_RECORDING_EXTENT, actorId, key, values
  };
}