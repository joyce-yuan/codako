import * as Types from '../constants/action-types';
import u from 'updeep';

export default function worldReducer(state, action) {
  if (action.worldId && action.worldId !== state.id) {
    return state;
  }

  switch (action.type) {
    case Types.SELECT_STAGE_ID: {
      return u({globals: {selectedStageId: {value: action.stageId}}}, state);
    }
    case Types.UPSERT_GLOBAL: {
      return u({globals: {[action.globalId]: action.changes}}, state);
    }
    case Types.DELETE_GLOBAL: {
      return u({globals: u.omit(action.globalId)}, state);
    }
    default:
      return state;
  }
}
