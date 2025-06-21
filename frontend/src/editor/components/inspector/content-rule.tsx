import React, { useContext, useState } from "react";

import { TapToEditLabel } from "../tap-to-edit-label";
import { DisclosureTriangle } from "./disclosure-triangle";
import { RuleStateCircle } from "./rule-state-circle";
import { ScenarioStage } from "./scenario-stage";

import { Rule } from "../../../types";
import { toV2Condition } from "../../utils/stage-helpers";
import { FreeformConditionRow } from "../stage/recording/condition-rows";
import { isCollapsePersisted, persistCollapsedState } from "./collapse-state-storage";
import { RuleActionsContext } from "./container-pane-rules";
import { InspectorContext } from "./inspector-context";

export const ContentRule = ({ rule }: { rule: Rule }) => {
  const [collapsed, setCollapsed] = useState(isCollapsePersisted(rule.id));
  const { characters, world } = useContext(InspectorContext);
  const { onRuleChanged } = useContext(RuleActionsContext);

  const _onNameChange = (name: string) => {
    onRuleChanged(rule.id, { name });
  };

  const conditions: React.ReactNode[] = [];
  Object.values(rule.actors).forEach((a) => {
    const saved = rule.conditions[a.id] || {};

    Object.entries(saved).forEach(([key, value]) => {
      if (value && value.enabled) {
        conditions.push(
          <FreeformConditionRow
            key={`${a.id}-${key}`}
            actor={a}
            actors={rule.actors}
            world={world}
            condition={toV2Condition(key, value)!}
            characters={characters}
          />,
        );
      }
    });
  });

  return (
    <div>
      <div className="scenario">
        <RuleStateCircle rule={rule} />
        <div style={{ flex: 1 }} />
        <ScenarioStage rule={rule} applyActions={false} maxWidth={75} maxHeight={75} />
        <i className="fa fa-arrow-right" aria-hidden="true" />
        <ScenarioStage rule={rule} applyActions maxWidth={75} maxHeight={75} />
        <div style={{ flex: 1 }} />
      </div>
      <DisclosureTriangle
        onClick={() => {
          setCollapsed(!collapsed);
          persistCollapsedState(rule.id, !collapsed);
        }}
        enabled={conditions.length > 0}
        collapsed={conditions.length === 0 || collapsed}
      />
      <TapToEditLabel className="name" value={rule.name} onChange={_onNameChange} />
      {conditions.length > 0 && !collapsed && <ul className="conditions">{conditions}</ul>}
    </div>
  );
};
