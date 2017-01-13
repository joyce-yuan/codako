import * as Types from '../constants/action-types';
import u from 'updeep';

export default function globalsReducer(state, action) {
  switch (action.type) {
    case Types.SELECT_STAGE_ID: {
      return u({selectedStageId: {value: action.stageId}}, state);
    }
    case Types.UPSERT_GLOBAL: {
      return u({[action.globalId]: action.changes}, state);
    }
    case Types.DELETE_GLOBAL: {
      return u.omit(action.globalId, state);
    }
    default:
      return state;
  }
}
