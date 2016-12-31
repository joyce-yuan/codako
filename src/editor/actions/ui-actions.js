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
