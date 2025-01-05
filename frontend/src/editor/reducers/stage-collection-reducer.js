/* eslint no-param-reassign: 0 */
// import u from 'updeep';

import * as Types from "../constants/action-types";
import initialStateStage from "./initial-state-stage";
import stageReducer from "./stage-reducer";

export default function stageCollectionReducer(state, action) {
  const nextState = {};
  for (const stageId of Object.keys(state)) {
    nextState[stageId] = stageReducer(state[stageId], action);
  }

  switch (action.type) {
    case Types.CREATE_STAGE: {
      nextState[action.stageId] = Object.assign({}, initialStateStage, {
        id: action.stageId,
        name: action.stageName,
      });
      return nextState;
    }
    case Types.DELETE_STAGE_ID: {
      delete nextState[action.stageId];
      return nextState;
    }
    default:
      return nextState;
  }
}
