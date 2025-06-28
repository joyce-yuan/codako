import { useContext } from "react";
import { RuleTreeItem } from "../../../types";
import { InspectorContext } from "./inspector-context";

export const RuleStateCircle = ({ rule }: { rule: RuleTreeItem }) => {
  const { evaluatedRuleIdsForActor } = useContext(InspectorContext);
  const applied = evaluatedRuleIdsForActor?.[rule.id];
  return <div className={`circle ${applied}`} />;
};
