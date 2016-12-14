import {SELECT_TOOL_ID, SELECT_DEFINITION_ID, UPDATE_PAINTING_STATE} from '../constants/action-types';
import objectAssign from 'object-assign';
import initialState from './initial-state';


export default function toolbarReducer(state = initialState.ui, action) {
  switch (action.type) {
    case SELECT_TOOL_ID:
      return objectAssign({}, state, {
        selectedToolId: action.toolId,
      });
    case SELECT_DEFINITION_ID:
      return objectAssign({}, state, {
        selectedCharacterId: action.characterId,
        selectedActorId: action.actorId,
      });
    case UPDATE_PAINTING_STATE:
      return objectAssign({}, state, {
        paint: {
          characterId: action.characterId,
          appearanceId: action.appearanceId,
        },
      });
    default:
      return state;
  }
}
