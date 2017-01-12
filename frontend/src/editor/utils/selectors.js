export function getCurrentStage(state) {
  return state.stages[state.globals.selectedStageId.value];
}