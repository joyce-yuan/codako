import {
  Actor,
  Character,
  EditorState,
  Globals,
  MathOperation,
  Position,
  RecordingState,
  RuleAction,
  RuleExtent,
} from "../../types";
import { getCurrentStageForWorld } from "./selectors";
import { getVariableValue, pointIsInside, pointIsOutside } from "./stage-helpers";

export function defaultOperationForValueChange(
  before: number | string,
  after: number | string,
): MathOperation {
  if (Number(after) && Number(before) && Number(after) === Number(before) + 1) {
    return "add";
  } else if (Number(after) && Number(before) && Number(after) === Number(before) - 1) {
    return "subtract";
  }
  return "set";
}

function operandForValueChange(before: number | string, after: number | string, op: MathOperation) {
  if (Number(after) && Number(before) && op === "add") {
    return Number(after) - Number(before);
  } else if (Number(after) && Number(before) && op === "subtract") {
    return Number(before) - Number(after);
  } else if (op === "set") {
    return after;
  }
  throw new Error("Unknown op");
}

export function extentIgnoredPositions(extent: RuleExtent) {
  return Object.keys(extent.ignored).map((k) => {
    const coords = k.split(",").map(Number);
    if (coords.length !== 2) {
      throw new Error(`${k} is not in X,Y form`);
    }
    return { x: coords[0], y: coords[1] };
  });
}

export function extentByShiftingExtent(extent: RuleExtent, d: Position) {
  const ignored: RuleExtent["ignored"] = {};
  extentIgnoredPositions(extent).forEach(({ x, y }) => {
    ignored[`${x + d.x},${y + d.y}`] = true;
  });

  return {
    xmin: extent.xmin + d.x,
    xmax: extent.xmax + d.x,
    ymin: extent.ymin + d.y,
    ymax: extent.ymax + d.y,
    ignored: ignored,
  };
}

export function actionsForVariables({
  beforeActor,
  afterActor,
  character,
  prefs,
}: {
  beforeActor: Actor | null;
  afterActor: Actor;
  character: Character;
  prefs: { [variableId: string]: string };
}) {
  if (!beforeActor) {
    return [];
  }

  const actions: RuleAction[] = [];
  for (const vkey of Object.keys(character.variables)) {
    const before = beforeActor ? getVariableValue(beforeActor, character, vkey) : undefined;
    const after = getVariableValue(afterActor, character, vkey);
    if (!after || !before || before === after) {
      continue;
    }

    const op = (prefs[vkey] as MathOperation) || defaultOperationForValueChange(before, after);

    actions.push({
      actorId: beforeActor.id,
      type: "variable",
      operation: op,
      variable: vkey,
      value: Number(operandForValueChange(before, after, op)),
    });
  }
  return actions;
}

export function actionsForGlobals({
  beforeGlobals,
  afterGlobals,
  prefs,
}: {
  beforeGlobals: Globals;
  afterGlobals: Globals;
  prefs: {
    [key: string]: string;
  };
}) {
  const actions: RuleAction[] = [];
  for (const gkey of Object.keys(beforeGlobals)) {
    const before = beforeGlobals[gkey].value;
    const after = afterGlobals[gkey].value;
    if (before === after) {
      continue;
    }

    const op = (prefs[gkey] as MathOperation) || defaultOperationForValueChange(before, after);

    actions.push({
      type: "global",
      operation: op,
      global: gkey,
      value: Number(operandForValueChange(before, after, op)),
    });
  }
  return actions;
}

export function actionsForRecording(
  { beforeWorld, afterWorld, extent, prefs, actorId }: RecordingState,
  { characters }: Pick<EditorState, "characters">,
) {
  const beforeStage = getCurrentStageForWorld(beforeWorld);
  const afterStage = getCurrentStageForWorld(afterWorld);

  if (!beforeStage?.actors || !afterStage?.actors || !actorId) {
    return [];
  }

  const beforeMainActor = beforeStage.actors[actorId];
  if (!beforeMainActor) {
    throw new Error("Could not find main actor");
  }
  const actions: RuleAction[] = [];

  actions.push(
    ...actionsForGlobals({
      beforeGlobals: beforeWorld.globals,
      afterGlobals: afterWorld.globals,
      prefs: prefs["globals"] || {},
    }),
  );

  // If the stage has changed, no other actions can be taken
  if (beforeWorld.globals.selectedStageId.value !== afterWorld.globals.selectedStageId.value) {
    return actions;
  }

  Object.values(beforeStage.actors).forEach((beforeActor) => {
    if (pointIsOutside(beforeActor.position, extent)) {
      return;
    }
    const { x: bx, y: by } = beforeActor.position;
    const character = characters[beforeActor.characterId];
    const afterActor = afterStage.actors[beforeActor.id];

    if (afterActor) {
      const { x: ax, y: ay } = afterActor.position;
      if (ax !== bx || ay !== by) {
        actions.push({
          actorId: beforeActor.id,
          type: "move",
          delta: { x: ax - bx, y: ay - by },
        });
      }

      if (beforeActor["transform"] !== afterActor["transform"]) {
        actions.push({
          type: "transform",
          actorId: beforeActor.id,
          to: afterActor["transform"]!,
        });
      }
      if (beforeActor["appearance"] !== afterActor["appearance"]) {
        actions.push({
          type: "appearance",
          actorId: beforeActor.id,
          to: afterActor["appearance"]!,
        });
      }

      actions.push(
        ...actionsForVariables({
          beforeActor,
          afterActor,
          character,
          prefs: prefs[beforeActor.id] || {},
        }),
      );
    } else {
      actions.push({
        actorId: beforeActor.id,
        type: "delete",
      });
    }
  });

  createdActorsForRecording({ beforeWorld, afterWorld, extent }).forEach((actor) => {
    actions.push({
      actor: actor,
      actorId: actor.id,
      type: "create",
      offset: {
        x: actor.position.x - beforeMainActor.position.x,
        y: actor.position.y - beforeMainActor.position.y,
      },
    });
    actions.push(
      ...actionsForVariables({
        beforeActor: null,
        afterActor: actor,
        character: characters[actor.characterId],
        prefs: {},
      }),
    );
  });

  return actions;
}

export function createdActorsForRecording({
  beforeWorld,
  afterWorld,
  extent,
}: Pick<RecordingState, "beforeWorld" | "afterWorld" | "extent">) {
  const beforeStage = getCurrentStageForWorld(beforeWorld);
  const afterStage = getCurrentStageForWorld(afterWorld);
  if (!beforeStage || !afterStage) {
    return [];
  }
  const beforeIds = Object.keys(beforeStage.actors);
  const afterIds = Object.keys(afterStage.actors);
  const createdIds = afterIds.filter((id) => !beforeIds.includes(id));

  return createdIds
    .map((id) => afterStage.actors[id])
    .filter((a) => pointIsInside(a.position, extent));
}
