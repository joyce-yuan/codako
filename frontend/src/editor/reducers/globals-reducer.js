import * as Types from '../constants/action-types';
import u from 'updeep';

export default function globalsReducer(state, action) {
  switch (action.type) {
    case Types.SELECT_STAGE_ID: {
      return u({selectedStageId: {value: action.stageId}}, state);
    }
    default:
      return state;
  }
}
