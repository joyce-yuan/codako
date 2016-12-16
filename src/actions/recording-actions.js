import * as types from '../constants/action-types';

export function startRecording({characterId, actor, rule}) {
  return {
    type: types.START_RECORDING, characterId, actor, rule,
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

