/* eslint no-param-reassign: 0 */
import u from 'updeep';
import objectAssign from 'object-assign';
import stageCollectionReducer from './stage-collection-reducer';

import * as Types from '../constants/action-types';
import WorldOperator from '../utils/world-operator';

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
    case Types.INPUT_FOR_GAME_STATE: {
      return u({
        input: {
          keys: action.keys,
          clicks: action.clicks,
        },
      }, state);
    }
    case Types.ADVANCE_GAME_STATE: {
      return WorldOperator(state).tick();
    }
    case Types.STEP_BACK_GAME_STATE: {
      return WorldOperator(state).untick();
    }
    case Types.UPSERT_ACTOR:
    case Types.DELETE_ACTOR:
    case Types.DELETE_CHARACTER:
    case Types.RESTORE_INITIAL_GAME_STATE:
      return u({
        history: u.constant([]),
      }, state);

    default:
      return state;
  }
}