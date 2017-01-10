import * as Types from '../constants/action-types';
import { LOCATION_CHANGE } from 'react-router-redux';
import objectAssign from 'object-assign';

export default function mainReducer(state, action) {
  switch (action.type) {
    case Types.USER_CHANGED: {
      return objectAssign({}, state, {
        user: action.user,
      });
    }
    case Types.STAGES_CHANGED: {
      return objectAssign({}, state, {
        stages: action.stages,
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
