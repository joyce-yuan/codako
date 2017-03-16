import * as Types from '../constants/action-types';
import { LOCATION_CHANGE } from 'react-router-redux';
import objectAssign from 'object-assign';

export default function mainReducer(state, action) {
  switch (action.type) {
    case Types.SET_ME: {
      return objectAssign({}, state, {
        me: action.me,
      });
    }
    case Types.UPSERT_PROFILE: {
      return objectAssign({}, state, {
        profiles: objectAssign({}, state.profile, {[action.profile.username]: action.profile}),
      });
    }
    case Types.UPSERT_WORLDS: {
      const hash = objectAssign({}, state.worlds);
      for (const w of action.worlds) {
        hash[w.id] = w;
      }
      return objectAssign({}, state, {
        worlds: hash,
      });
    }
    case Types.NETWORK_ACTIVITY: {
      return objectAssign({}, state, {
        network: {
          pending: state.network.pending + action.delta,
          error: action.error,
        },
      });
    }
    case LOCATION_CHANGE: {
      return objectAssign({}, state, {
        network: {
          pending: 0,
          error: null,
        },
      });
    }
    default:
      return state;
  }
}
