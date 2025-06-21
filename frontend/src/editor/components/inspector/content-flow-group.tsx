import { useContext, useState } from "react";
import { TapToEditLabel } from "../tap-to-edit-label";
import { DisclosureTriangle } from "./disclosure-triangle";
import { RuleList } from "./rule-list";
import { RuleStateCircle } from "./rule-state-circle";

import { Character, RuleTreeFlowItem } from "../../../types";
import { FLOW_BEHAVIORS } from "../../utils/world-constants";
import { isCollapsePersisted, persistCollapsedState } from "./collapse-state-storage";
import { RuleActionsContext } from "./container-pane-rules";

export const ContentFlowGroup = ({
  rule,
  character,
}: {
  rule: RuleTreeFlowItem;
  character: Character;
}) => {
  const [collapsed, setCollapsed] = useState(isCollapsePersisted(rule.id));
  const { onRuleChanged } = useContext(RuleActionsContext);

  const _onNameChange = (name: string) => {
    onRuleChanged(rule.id, { name });
  };

  const _onBehaviorChanged = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onRuleChanged(rule.id, { behavior: event.target.value as RuleTreeFlowItem["behavior"] });
  };

  const _onLoopCountChanged = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onRuleChanged(rule.id, { loopCount: JSON.parse(event.target.value) });
  };

  const variables = Object.values(character.variables);

  return (
    <div>
      <div className={`header ${rule.behavior}`}>
        <div style={{ float: "left", width: 20 }}>
          <RuleStateCircle rule={rule} />
          <DisclosureTriangle
            onClick={() => {
              setCollapsed(!collapsed);
              persistCollapsedState(rule.id, !collapsed);
            }}
            collapsed={collapsed}
          />
        </div>
        <select onChange={_onBehaviorChanged} value={rule.behavior}>
          <option key={FLOW_BEHAVIORS.FIRST} value={FLOW_BEHAVIORS.FIRST}>
            Do First Match
          </option>
          <option key={FLOW_BEHAVIORS.LOOP} value={FLOW_BEHAVIORS.LOOP}>
            Do First Match &amp; Repeat
          </option>
          <option key={FLOW_BEHAVIORS.ALL} value={FLOW_BEHAVIORS.ALL}>
            Do All &amp; Continue
          </option>
          <option key={FLOW_BEHAVIORS.RANDOM} value={FLOW_BEHAVIORS.RANDOM}>
            Randomize &amp; Do First
          </option>
        </select>
        {rule.behavior === FLOW_BEHAVIORS.LOOP ? (
          <select
            onChange={_onLoopCountChanged}
            value={JSON.stringify(rule.loopCount) || `{"constant":2}`}
          >
            <option value={`{"constant":2}`}>2 Times</option>
            <option value={`{"constant":3}`}>3 Times</option>
            <option value={`{"constant":4}`}>4 Times</option>
            <option value={`{"constant":5}`}>5 Times</option>
            <option value={`{"constant":6}`}>6 Times</option>
            <option value={`{"constant":7}`}>7 Times</option>
            <option value={`{"constant":8}`}>8 Times</option>
            <option value={`{"constant":9}`}>9 Times</option>
            <option value={`{"constant":10}`}>10 Times</option>
            <option disabled>_____</option>
            {variables.map(({ id, name }) => (
              <option value={`{"variableId":"${id}"}`} key={id}>
                "{name}" Times
              </option>
            ))}
            {variables.length === 0 ? <option disabled>No variables defined</option> : undefined}
          </select>
        ) : undefined}
        <TapToEditLabel className="name" value={rule.name} onChange={_onNameChange} />
      </div>
      <RuleList parentId={rule.id} rules={rule.rules} collapsed={collapsed} character={character} />
    </div>
  );
};
