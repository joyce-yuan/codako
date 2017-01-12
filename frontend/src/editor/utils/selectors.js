export function getCurrentStage(state) {
  return state.stages[state.ui.selectedStageId];
}