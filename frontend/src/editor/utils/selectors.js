export function getStages(state) {
  return state.world.stages;
}

export function getStagesList(state) {
  return Object.values(state.world.stages).sort((a, b) => a.order - b.order);
}

export function getCurrentStage(state) {
  return getCurrentStageForWorld(state.world);
}

export function getCurrentStageForWorld(world) {
  return world && world.stages[world.globals.selectedStageId.value];
}