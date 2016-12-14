import u from 'updeep';

import {UPSERT_ACTOR, DELETE_ACTOR, ADVANCE_GAME_STATE} from '../constants/action-types';
import initialState from './initial-state';
import {advanceFrame} from '../components/game-state-helpers';

export default function stageReducer(state = initialState.stage, action) {
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
    case ADVANCE_GAME_STATE: {
      const nextState = advanceFrame(state);
      console.log(nextState);
      return nextState;
    }
    default:
      return state;
  }
}
