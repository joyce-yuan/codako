import PropTypes from "prop-types";
import React from "react";
import TapToEditLabel from "../tap-to-edit-label";
import DisclosureTriangle from "./disclosure-triangle";
import RuleList from "./rule-list";
import RuleStateCircle from "./rule-state-circle";

import { FLOW_BEHAVIORS } from "../../utils/world-constants";
import { isCollapsePersisted, persistCollapsedState } from "./collapse-state-storage";

export default class ContentGroupFlow extends React.Component {
  static propTypes = {
    rule: PropTypes.object,
    onClick: PropTypes.func,
  };

  static contextTypes = {
    onRuleChanged: PropTypes.func,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      collapsed: isCollapsePersisted(props.rule.id),
    };
  }

  _onNameChange = (event) => {
    this.context.onRuleChanged(this.props.rule.id, {
      name: event.target.value,
    });
  };

  _onBehaviorChanged = (event) => {
    this.context.onRuleChanged(this.props.rule.id, {
      behavior: event.target.value,
    });
  };

  _onLoopCountChanged = (event) => {
    this.context.onRuleChanged(this.props.rule.id, { loopCount: JSON.parse(event.target.value) });
  };

  render() {
    const { rule, character } = this.props;
    const { collapsed } = this.state;

    const variables = Object.values(this.props.character.variables);

    return (
      <div>
        <div className={`header ${rule.behavior}`}>
          <div style={{ float: "left", width: 20 }}>
            <RuleStateCircle rule={rule} />
            <DisclosureTriangle
              onClick={() => {
                this.setState({ collapsed: !collapsed });
                persistCollapsedState(this.props.rule.id, !collapsed);
              }}
              collapsed={collapsed}
            />
          </div>
          <select onChange={this._onBehaviorChanged} value={rule.behavior}>
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
              onChange={this._onLoopCountChanged}
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
          <TapToEditLabel className="name" value={rule.name} onChange={this._onNameChange} />
        </div>
        <RuleList
          parentId={rule.id}
          rules={rule.rules}
          collapsed={collapsed}
          character={character}
        />
      </div>
    );
  }
}
