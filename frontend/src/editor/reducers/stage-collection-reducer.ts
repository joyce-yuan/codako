/* eslint no-param-reassign: 0 */
// import u from 'updeep';

import { EditorState, Stage } from "../../types";
import { Actions } from "../actions";
import * as Types from "../constants/action-types";
import initialStateStage from "./initial-state-stage";
import stageReducer from "./stage-reducer";

export default function stageCollectionReducer(
  state: EditorState["world"]["stages"],
  action: Actions,
) {
  const nextState: EditorState["world"]["stages"] = {};

  for (const stageId of Object.keys(state)) {
    nextState[stageId] = stageReducer(state[stageId], action) as Stage;
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
