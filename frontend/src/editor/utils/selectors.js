export function getCurrentStage(state) {
  return state.stages[state.world.globals.selectedStageId.value];
}