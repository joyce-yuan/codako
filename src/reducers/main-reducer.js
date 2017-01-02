import * as Types from '../constants/action-types';
import objectAssign from 'object-assign';

export default function mainReducer(state, action) {
  switch (action.type) {
    case Types.USER_CHANGED: {
      return objectAssign({}, state, {
        user: action.user,
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
    default:
      return state;
  }
}
