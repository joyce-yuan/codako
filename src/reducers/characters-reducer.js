import u from 'updeep';

import {UPSERT_CHARACTER, DELETE_CHARACTER} from '../constants/action-types';
import initialState from './initial-state';


export default function toolbarReducer(state = initialState.characters, action) {
  switch (action.type) {
    case UPSERT_CHARACTER: {
      return u.updateIn(action.characterId, action.values, state);
    }
    case DELETE_CHARACTER: {
      return u.omit(action.characterId, state);
    }
    default:
      return state;
  }
}
