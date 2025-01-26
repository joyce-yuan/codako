import { DeepPartial, Dispatch } from "redux";
import { Actions } from ".";
import { Actor, PositionRelativeToRuleExtent, RecordingState, Rule, RuleExtent } from "../../types";
import * as types from "../constants/action-types";
import { stopPlayback } from "./ui-actions";

export function setupRecordingForActor({
  characterId,
  actor,
}: {
  characterId: string;
  actor: Actor;
}) {
  return (dispatch: Dispatch<Actions>) => {
    dispatch(stopPlayback());
    dispatch({
      type: types.SETUP_RECORDING_FOR_ACTOR,
      characterId,
      actor,
    });
  };
}

export type ActionSetupRecordingForActor = {
  type: "SETUP_RECORDING_FOR_ACTOR";
  characterId: string;
  actor: Actor;
};

export function setupRecordingForCharacter({ characterId }: { characterId: string }) {
  return (dispatch: Dispatch<Actions>) => {
    dispatch(stopPlayback());
    dispatch({
      type: types.SETUP_RECORDING_FOR_CHARACTER,
      characterId,
    });
  };
}

export type ActionSetupRecordingForCharacter = {
  type: "SETUP_RECORDING_FOR_CHARACTER";
  characterId: string;
};

export function editRuleRecording({ characterId, rule }: { characterId: string; rule: Rule }) {
  return (dispatch: Dispatch<Actions>) => {
    dispatch(stopPlayback());
    dispatch({
      type: types.EDIT_RULE_RECORDING,
      characterId,
      rule,
    });
  };
}

export type ActionEditRuleRecording = {
  type: "EDIT_RULE_RECORDING";
  characterId: string;
  rule: Rule;
};

export function cancelRecording(): ActionCancelRecording {
  return {
    type: types.CANCEL_RECORDING,
  };
}

export type ActionCancelRecording = {
  type: "CANCEL_RECORDING";
};

export function finishRecording(): ActionFinishRecording {
  return {
    type: types.FINISH_RECORDING,
  };
}

export type ActionFinishRecording = {
  type: "FINISH_RECORDING";
};

export function startRecording(): ActionStartRecording {
  return {
    type: types.START_RECORDING,
  };
}

export type ActionStartRecording = {
  type: "START_RECORDING";
};

export function setRecordingExtent(extent: RuleExtent): ActionSetRecordingExtent {
  return {
    type: types.SET_RECORDING_EXTENT,
    extent,
  };
}

export type ActionSetRecordingExtent = {
  type: "SET_RECORDING_EXTENT";
  extent: RuleExtent;
};

export function updateRecordingCondition(
  actorId: string,
  key: string,
  values: DeepPartial<RecordingState["conditions"][""]>,
): ActionUpdateRecordingCondition {
  return {
    type: types.UPDATE_RECORDING_CONDITION,
    actorId,
    key,
    values,
  };
}

export type ActionUpdateRecordingCondition = {
  type: "UPDATE_RECORDING_CONDITION";
  actorId: string;
  key: string;
  values: DeepPartial<RecordingState["conditions"][""]> & { enabled?: boolean };
};

export function updateRecordingActionPrefs(
  actorId: string,
  values: DeepPartial<RecordingState["prefs"]>,
): ActionUpdateRecordingActionPrefs {
  return {
    type: types.UPDATE_RECORDING_ACTION_PREFS,
    actorId,
    values,
  };
}

export type ActionUpdateRecordingActionPrefs = {
  type: "UPDATE_RECORDING_ACTION_PREFS";
  actorId: string;
  values: DeepPartial<RecordingState["prefs"]>;
};

export function toggleSquareIgnored(
  position: PositionRelativeToRuleExtent,
): ActionToggleSquareIgnored {
  return {
    type: types.TOGGLE_RECORDING_SQUARE_IGNORED,
    position,
  };
}

export type ActionToggleSquareIgnored = {
  type: "TOGGLE_RECORDING_SQUARE_IGNORED";
  position: PositionRelativeToRuleExtent;
};

export type RecordingActions =
  | ActionSetupRecordingForActor
  | ActionSetupRecordingForCharacter
  | ActionEditRuleRecording
  | ActionCancelRecording
  | ActionFinishRecording
  | ActionStartRecording
  | ActionSetRecordingExtent
  | ActionUpdateRecordingCondition
  | ActionUpdateRecordingActionPrefs
  | ActionToggleSquareIgnored;
