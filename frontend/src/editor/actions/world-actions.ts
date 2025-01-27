import { DeepPartial } from "redux";
import { Global, World } from "../../types";
import * as types from "../constants/action-types";

export function upsertGlobal(
  worldId: string,
  globalId: string,
  changes: DeepPartial<Global>,
): ActionUpsertGlobal {
  return {
    type: types.UPSERT_GLOBAL,
    worldId,
    globalId,
    changes,
  };
}

export type ActionUpsertGlobal = {
  type: "UPSERT_GLOBAL";
  worldId?: string;
  globalId: string;
  changes: DeepPartial<Global>;
};

export function createGlobal(worldId?: string): ActionUpsertGlobal {
  const globalId = `${Date.now()}`;
  return {
    type: types.UPSERT_GLOBAL,
    worldId,
    globalId,
    changes: {
      type: "number",
      id: globalId,
      value: 0,
      name: "Untitled",
    },
  };
}

export function deleteGlobal(worldId: string, globalId: string): ActionDeleteGlobal {
  return {
    type: types.DELETE_GLOBAL,
    worldId,
    globalId,
  };
}

export type ActionDeleteGlobal = {
  type: "DELETE_GLOBAL";
  worldId: string;
  globalId: string;
};

export function updateWorldMetadata(
  worldId: string,
  metadata: World["metadata"],
): ActionUpdateWorldMetadata {
  return {
    type: types.UPDATE_WORLD_METADATA,
    worldId,
    metadata,
  };
}
export type ActionUpdateWorldMetadata = {
  type: "UPDATE_WORLD_METADATA";
  worldId: string;
  metadata: World["metadata"];
};

export type WorldActions = ActionUpsertGlobal | ActionDeleteGlobal | ActionUpdateWorldMetadata;
