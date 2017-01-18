import * as types from '../constants/action-types';

export function selectToolId(toolId) {
  return {
    type: types.SELECT_TOOL_ID,
    toolId,
  };
}

export function selectStageId(worldId, stageId) {
  return {
    type: types.SELECT_STAGE_ID,
    worldId, stageId,
  };
}

export function select(characterId, actorPath) {
  return {
    type: types.SELECT_DEFINITION_ID,
    characterId,
    actorPath,
  };
}

export function updatePlaybackState(values) {
  return {
    type: types.UPDATE_PLAYBACK_STATE,
    values,
  };
}

export function stopPlayback() {
  return {
    type: types.UPDATE_PLAYBACK_STATE,
    values: {running: false},
  };
}

export function showModal(id) {
  return (dispatch) => {
    dispatch(stopPlayback());
    dispatch({
      type: types.UPDATE_MODAL_STATE,
      openId: id,
    });
  };
}

export function dismissModal() {
  return {
    type: types.UPDATE_MODAL_STATE,
    openId: null,
  };
}

export function paintCharacterAppearance(characterId, appearanceId) {
  return (dispatch) => {
    dispatch(stopPlayback());
    dispatch({
      type: types.UPDATE_PAINTING_STATE,
      characterId,
      appearanceId,
    });
  };
}

export function pickCharacterRuleEventKey(characterId, ruleId, initialKeyCode) {
  return (dispatch) => {
    dispatch(stopPlayback());
    dispatch({
      type: types.UPDATE_KEYPICKER_STATE,
      characterId,
      ruleId,
      initialKeyCode,
    });
  };
}

export function updateTutorialState({stepIndex}) {
  return {
    type: types.UPDATE_TUTORIAL_STATE,
    stepIndex,
  };
}