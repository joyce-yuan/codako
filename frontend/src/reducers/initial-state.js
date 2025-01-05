import * as session from "../helpers/session-storage";

export default Object.assign(
  {
    me: null,
    profiles: {},
    worlds: null,
    network: {
      error: null,
      pending: 0,
    },
  },
  session.getInitialState(),
);
