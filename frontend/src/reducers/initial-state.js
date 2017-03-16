import * as session from '../helpers/session-storage';
import objectAssign from 'object-assign';

export default objectAssign({
  me: null,
  profiles: {},
  worlds: null,
  network: {
    error: null,
    pending: 0,
  },
}, session.getInitialState());
