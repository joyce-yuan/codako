import u from "updeep";

import { Stage } from "../../types";
import { Actions } from "../actions";
import * as Types from "../constants/action-types";

export default function stageReducer(state: Stage, action: Actions) {
  if ("stageId" in action && action.stageId !== state.id) {
    return state;
  }

  switch (action.type) {
    case Types.UPSERT_ACTOR: {
      return u(
        {
          actors: u.updateIn(action.actorId, action.values),
        },
        state,
      );
    }
    case Types.DELETE_ACTOR: {
      return u(
        {
          actors: u.omit(action.actorId),
        },
        state,
      );
    }
    case Types.DELETE_CHARACTER: {
      return u(
        {
          actors: u.omitBy((value) => value.characterId === action.characterId),
        },
        state,
      );
    }
    case Types.UPDATE_STAGE_SETTINGS: {
      return u(action.settings, state);
    }
    case Types.SAVE_INITIAL_GAME_STATE: {
      return u(
        {
          startThumbnail: action.thumbnail,
          startActors: u.constant(action.actors),
        },
        state,
      );
    }
    case Types.RESTORE_INITIAL_GAME_STATE: {
      if (!state.startActors || Object.keys(state.startActors).length === 0) {
        return state;
      }
      return u(
        {
          actors: u.constant(state.startActors),
        },
        state,
      );
    }
    default:
      return state;
  }
}
