import { RouterState } from "react-router-redux";
import { Profile, User } from "../actions/main-actions";
import * as session from "../helpers/session-storage";
import { World } from "../types";

export type MainState = {
  me: User | null;
  worlds: { [worldId: string]: World } | null;
  profile: { [profileId: string]: Profile };
  routing: RouterState;
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
