import React from "react";
import { Characters, EvaluatedRuleIds, WorldMinimal } from "../../../types";

export const InspectorContext = React.createContext<{
  world: WorldMinimal;
  characters: Characters;
  evaluatedRuleIdsForActor: EvaluatedRuleIds[""];
  selectedToolId: string;
}>(new Error() as never);
