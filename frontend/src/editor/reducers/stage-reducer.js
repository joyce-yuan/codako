import u from 'updeep';

import * as Types from '../constants/action-types';
import StageOperator from '../utils/stage-operator';

export default function stageReducer(state, action) {
  if (action.stageUid && action.stageUid !== state.uid) {
    return state;
  }

  switch (action.type) {
    case Types.UPSERT_ACTOR: {
      return u({
        actors: u.updateIn(action.id, action.values),
        history: u.constant([]),
      }, state);
    }
    case Types.DELETE_ACTOR: {
      return u({
        actors: u.omit(action.id),
        history: u.constant([]),
      }, state);
    }
    case Types.DELETE_CHARACTER: {
      return u({
        actors: u.omitBy((value) => value.characterId === action.characterId),
        history: u.constant([]),
      }, state);
    }
    case Types.INPUT_FOR_GAME_STATE: {
      return u({
        input: {
          keys: action.keys,
          clicks: action.clicks,
        },
      }, state);
    }
    case Types.UPDATE_STAGE_SETTINGS: {
      const {wrapX, wrapY, width, height} = action.settings;
      return u({wrapX, wrapY, width, height}, state);
    }
    case Types.SAVE_INITIAL_GAME_STATE: {
      return u({
        startThumbnail: action.thumbnail,
        startActors: u.constant(action.actors),
      }, state);
    }
    case Types.RESTORE_INITIAL_GAME_STATE: {
      return u({
        actors: u.constant(state.startActors),
        history: u.constant([]),
      }, state);
    }
    case Types.ADVANCE_GAME_STATE: {
      const nextState = JSON.parse(JSON.stringify(state));
      nextState.history.push({
        evaluatedRuleIds: state.evaluatedRuleIds,
        actors: state.actors,
        input: state.input,
      });
      if (nextState.history.length > 20) {
        nextState.history = nextState.history.slice(1);
      }
      StageOperator(nextState).tick();
      return nextState;
    }
    case Types.STEP_BACK_GAME_STATE: {
      const top = state.history[state.history.length - 1];
      if (!top) {
        return state;
      }
      return u({
        evaluatedRuleIds: u.constant(top.evaluatedRuleIds),
        actors: u.constant(top.actors),
        input: u.constant(top.input),
        history: state.history.slice(0, state.history.length - 1),
      }, state);
    }
    default:
      return state;
  }
}
