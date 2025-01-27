import { DeepPartial, Dispatch } from "redux";
import { Actions } from ".";
import { ActorPath, EditorState } from "../../types";
import * as types from "../constants/action-types";

export function selectToolId(toolId: string): ActionSelectToolId {
  return {
    type: types.SELECT_TOOL_ID,
    toolId,
  };
}

export function selectStageId(worldId: string, stageId: string): ActionSelectStageId {
  return {
    type: types.SELECT_STAGE_ID,
    worldId,
    stageId,
  };
}

export function select(characterId: string, actorPath: ActorPath): ActionSelectDefinitionId {
  return {
    type: types.SELECT_DEFINITION_ID,
    characterId,
    actorPath,
  };
}

export function updatePlaybackState(
  values: EditorState["ui"]["playback"],
): ActionUpdatePlaybackState {
  return {
    type: types.UPDATE_PLAYBACK_STATE,
    values,
  };
}

export function stopPlayback(): ActionUpdatePlaybackState {
  return {
    type: types.UPDATE_PLAYBACK_STATE,
    values: { running: false },
  };
}

export function showModal(id: string) {
  return (dispatch: Dispatch<Actions>) => {
    dispatch(stopPlayback());
    dispatch({
      type: types.UPDATE_MODAL_STATE,
      openId: id,
    });
  };
}

export function dismissModal(): ActionDismissModal {
  return {
    type: types.UPDATE_MODAL_STATE,
    openId: null,
  };
}

export function paintCharacterAppearance(characterId: string, appearanceId: string) {
  return (dispatch: Dispatch<Actions>) => {
    dispatch(stopPlayback());
    dispatch({
      type: types.UPDATE_PAINTING_STATE,
      characterId,
      appearanceId,
    });
  };
}

export function pickCharacterRuleEventKey(
  characterId: string,
  ruleId: string,
  initialKeyCode: string | null,
) {
  return (dispatch: Dispatch<Actions>) => {
    dispatch(stopPlayback());
    dispatch({
      type: types.UPDATE_KEYPICKER_STATE,
      characterId,
      ruleId,
      initialKeyCode,
    });
  };
}

export function updateTutorialState(
  values: EditorState["ui"]["tutorial"],
): ActionUpdateTutorialState {
  return {
    type: types.UPDATE_TUTORIAL_STATE,
    values,
  };
}

export type ActionSelectToolId = {
  type: "SELECT_TOOL_ID";
  toolId: string;
};

export type ActionSelectStageId = {
  type: "SELECT_STAGE_ID";
  worldId: string;
  stageId: string;
};

export type ActionSelectDefinitionId = {
  type: "SELECT_DEFINITION_ID";
  characterId: string;
  actorPath: ActorPath;
};

export type ActionUpdatePlaybackState = {
  type: "UPDATE_PLAYBACK_STATE";
  values: DeepPartial<EditorState["ui"]["playback"]>;
};

export type ActionShowModal = {
  type: "UPDATE_MODAL_STATE";
  openId: string;
};

export type ActionDismissModal = {
  type: "UPDATE_MODAL_STATE";
  openId: null;
};

export type ActionUpdatePaintingState = {
  type: "UPDATE_PAINTING_STATE";
  characterId: string;
  appearanceId: string;
};

export type ActionUpdateKeypickerState = {
  type: "UPDATE_KEYPICKER_STATE";
  characterId: string;
  ruleId: string;
  initialKeyCode: string | null;
};

export type ActionUpdateTutorialState = {
  type: "UPDATE_TUTORIAL_STATE";
  values: EditorState["ui"]["tutorial"];
};

export type UIActions =
  | ActionSelectToolId
  | ActionSelectStageId
  | ActionSelectDefinitionId
  | ActionUpdatePlaybackState
  | ActionShowModal
  | ActionDismissModal
  | ActionUpdatePaintingState
  | ActionUpdateKeypickerState
  | ActionUpdateTutorialState;
