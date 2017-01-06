import * as types from '../constants/action-types';

export function selectToolId(toolId) {
  return {
    type: types.SELECT_TOOL_ID,
    toolId,
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

export function showSettingsModal() {
  return {
    type: types.UPDATE_SETTINGS_MODAL_STATE,
    open: true,
  };
}

export function dismissSettingsModal() {
  return {
    type: types.UPDATE_SETTINGS_MODAL_STATE,
    open: false,
  };
}

export function paintCharacterAppearance(characterId, appearanceId) {
  return {
    type: types.UPDATE_PAINTING_STATE,
    characterId,
    appearanceId,
  };
}

export function pickCharacterRuleEventKey(characterId, ruleId, initialKeyCode) {
  return {
    type: types.UPDATE_KEYPICKER_STATE,
    characterId,
    ruleId,
    initialKeyCode,
  };
}

export function updateTutorialState({stepIndex}) {
  return {
    type: types.UPDATE_TUTORIAL_STATE,
    stepIndex,
  };
}