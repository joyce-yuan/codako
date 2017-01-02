import * as session from '../helpers/session-storage';
import objectAssign from 'object-assign';

export default objectAssign({
  user: null,
  network: {
    error: null,
    pending: 0,
  },
}, session.getInitialState());
