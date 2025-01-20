import { push, replace } from "react-router-redux";

import { Dispatch } from "react-redux";
import * as types from "../constants/action-types";
import { makeRequest } from "../helpers/api";
import { World } from "../types";

const DEFAULT_POST_AUTH_PATH = "/dashboard";

export type User = { username: string; password: string; email: string };
export type Profile = { id: number; username: string };

export function logout() {
  return function (dispatch: Dispatch<MainActions>) {
    dispatch({
      type: types.SET_ME,
      me: null,
    });
    dispatch(push("/"));
  };
}

export function register({ username, password, email }: User, redirectTo: string) {
  return function (dispatch: Dispatch<MainActions>) {
    makeRequest<User>("/users", {
      method: "POST",
      json: { username, password, email },
    }).then((user) => {
      dispatch({
        type: types.SET_ME,
        me: Object.assign(user, { password }),
      });
      dispatch(replace(redirectTo || DEFAULT_POST_AUTH_PATH));
    });
  };
}

export function login(
  { username, password }: Pick<User, "username" | "password">,
  redirectTo: string,
) {
  return function (dispatch: Dispatch<MainActions>) {
    makeRequest<User>("/users/me", {
      headers: {
        Authorization: `Basic ${btoa(username + ":" + password)}`,
      },
    }).then((user) => {
      dispatch({
        type: types.SET_ME,
        me: Object.assign(user, { password }),
      });
      dispatch(replace(redirectTo || DEFAULT_POST_AUTH_PATH));
    });
  };
}

export function fetchUser(username: string) {
  return function (dispatch: Dispatch<MainActions>) {
    makeRequest<User>(`/users/${username}`).then((profile) => {
      dispatch({ type: types.UPSERT_PROFILE, profile });
    });
  };
}

export function fetchWorldsForUser(userId: string) {
  return function (dispatch: Dispatch<MainActions>) {
    makeRequest<World[]>(`/worlds`, { query: { user: userId } }).then((worlds) => {
      dispatch({ type: types.UPSERT_WORLDS, worlds });
    });
  };
}

export function fetchWorld(id: string) {
  return function (dispatch: Dispatch<MainActions>) {
    makeRequest<World>(`/worlds/${id}`).then((world) => {
      dispatch({ type: types.UPSERT_WORLDS, worlds: [world] });
    });
  };
}

export function deleteWorld(id: string) {
  return function () {
    if (
      window.confirm("Are you sure you want to delete this world? This action cannot be undone.")
    ) {
      makeRequest(`/worlds/${id}`, { method: "DELETE" }).then(() => {
        fetchWorldsForUser("me");
      });
    }
  };
}

export function createWorld({ from, fork }: { from?: string; fork?: string } = {}) {
  return function (dispatch: Dispatch<MainActions>) {
    let qs = "";
    if (from === "tutorial") {
      qs = "tutorial=base";
    } else if (fork) {
      qs = "tutorial=fork";
    }

    if (window.store.getState().me) {
      makeRequest<{ id: string }>(`/worlds`, { query: { from, fork }, method: "POST" }).then(
        (created) => {
          dispatch(push(`/editor/${created.id}?${qs}`));
        },
      );
    } else {
      if (!from) {
        alert("You need to create an account to create worlds from scratch!");
        return;
      }
      makeRequest<World>(`/worlds/${from}`).then((world) => {
        const storageKey = `ls-${Date.now()}`;
        const storageWorld = Object.assign({}, world, { id: storageKey });
        localStorage.setItem(storageKey, JSON.stringify(storageWorld));
        dispatch(push(`/editor/${storageKey}?localstorage=true&${qs}`));
      });
    }
  };
}

export function uploadLocalStorageWorld(storageKey: string) {
  return function (dispatch: Dispatch<MainActions>) {
    let json = null;
    try {
      const world = JSON.parse(window.localStorage.getItem(storageKey)!);
      json = { name: world.name, data: world.data, thumbnail: world.thumbnail };
    } catch (err) {
      alert(`Sorry, your world could not be uploaded. ${err}`);
      dispatch(replace(`/dashboard`));
      return;
    }

    console.log("Creating a new world");
    makeRequest<{ id: string }>(`/worlds`, { method: "POST" }).then((created) => {
      console.log("Uploading localstorage data to world");

      makeRequest(`/worlds/${created.id}`, { method: "PUT", json }).then(() => {
        console.log("Removing localstorage, redirecting to world");
        window.localStorage.setItem(storageKey, JSON.stringify({ uploadedAsId: created.id }));

        dispatch({
          type: types.UPSERT_WORLDS,
          worlds: [Object.assign({}, created, json)],
        });
        dispatch(replace(`/editor/${created.id}`));
      });
    });
  };
}

export type ActionSetMe = {
  type: "SET_ME";
  me: null | User;
};
export type ActionNetworkActivity = {
  type: "NETWORK_ACTIVITY";
  error: Error | null;
  delta: number;
};
export type ActionUpsertProfile = {
  type: "UPSERT_PROFILE";
  profile: Profile;
};
export type ActionUpsertWorlds = {
  type: "UPSERT_WORLDS";
  worlds: World[];
};
export type MainActions =
  | ActionSetMe
  | ActionNetworkActivity
  | ActionUpsertProfile
  | ActionUpsertWorlds;
