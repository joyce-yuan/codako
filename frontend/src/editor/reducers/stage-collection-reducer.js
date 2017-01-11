/* eslint no-param-reassign: 0 */
// import u from 'updeep';

import objectAssign from 'object-assign';

import stageReducer from './stage-reducer';
import * as Types from '../constants/action-types';
import initialStateStage from './initial-state-stage';

export default function stageCollectionReducer(state, action) {
  state = state.map(stage => stageReducer(stage, action));

  switch (action.type) {
    case Types.CREATE_STAGE: {
      return [].concat(state, [objectAssign({}, initialStateStage, {uid: action.stageUid})]);
    }
    case Types.REORDER_STAGE: {
      state = [].concat(state);
      const stage = state[action.startIndex];
      state.splice(action.startIndex, 1);
      state.splice(action.endIndex, 0, stage);
      return state;
    }
    case Types.DELETE_STAGE: {
      return state.filter(s => s.uid !== action.stageUid);
    }
    default:
      return state;
  }
}
