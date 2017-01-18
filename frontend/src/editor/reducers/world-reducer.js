/* eslint no-param-reassign: 0 */
import u from 'updeep';
import objectAssign from 'object-assign';
import * as Types from '../constants/action-types';
import stageCollectionReducer from './stage-collection-reducer';

export default function worldReducer(state, action) {
  if (action.worldId && action.worldId !== state.id) {
    return state;
  }

  state = objectAssign({}, state, {
    stages: stageCollectionReducer(state.stages, action),
  });

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
