import u from 'updeep';

import {UPSERT_ACTOR, DELETE_ACTOR, ADVANCE_GAME_STATE, INPUT_FOR_GAME_STATE} from '../constants/action-types';
import initialState from './initial-state';
import {StageOperator} from '../components/game-state-helpers';

export default function stageReducer(state = initialState.stage, action) {
  if (action.stageUid !== state.uid) {
    return state;
  }

  switch (action.type) {
    case UPSERT_ACTOR: {
      return u({
        actors: u.updateIn(action.id, action.values)
      }, state);
    }
    case DELETE_ACTOR: {
      return u({
        actors: u.omit(action.id),
      }, state);
    }
    case INPUT_FOR_GAME_STATE: {
      return u({
        input:{ keys: action.keys, clicks: action.clicks }
      }, state);
    }
    case ADVANCE_GAME_STATE: {
      const nextState = JSON.parse(JSON.stringify(state));
      StageOperator(nextState).tick();
      return nextState;
    }
    default:
      return state;
  }
}
