import { EditorState, Stage, World } from "../../types";

export function getStages(state: EditorState) {
  return state.world.stages;
}

export function getStagesList(state: EditorState) {
  return Object.values(state.world.stages).sort((a, b) => a.order - b.order);
}

export function getCurrentStage(state: EditorState) {
  return getCurrentStageForWorld(state.world);
}

export function getCurrentStageForWorld(world: Pick<World, "stages" | "globals">): Stage | null {
  return (
    (world &&
      Object.keys(world.stages).length > 0 &&
      world.stages[world.globals.selectedStageId.value]) ||
    null
  );
}
