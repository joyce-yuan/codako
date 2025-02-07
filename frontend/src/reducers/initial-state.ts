import { Profile, User } from "../actions/main-actions";
import * as session from "../helpers/session-storage";
import { Game } from "../types";

export type MainState = {
  me: User | null;
  worlds: { [worldId: string]: Game } | null;
  profiles: { [username: string]: Profile };
  network: { error: Error | null; pending: number };
};

const InitialState: MainState = Object.assign(
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

export default InitialState;
