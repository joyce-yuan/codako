import React, {PropTypes} from 'react';
import RuleStateCircle from './rule-state-circle';
import DisclosureTriangle from './disclosure-triangle';
import TapToEditLabel from '../tap-to-edit-label';

import RuleList from './rule-list';
import {FLOW_BEHAVIORS} from '../../constants/constants';

export default class RuleFlowGroup extends React.Component {
  static propTypes = {
    rule: PropTypes.object,
    onClick: PropTypes.func,
    onDragStart: PropTypes.func,
    onDragEnd: PropTypes.func,
  };

  static contextTypes = {
    onRuleChanged: PropTypes.func,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      disclosed: false,
    };
  }

  _onNameChange = (event) => {
    this.context.onRuleChanged(this.props.rule.id, {name: event.target.value});
  }

  render() {
    const {rule, onDragStart, onDragEnd} = this.props;
    const {disclosed} = this.state;

    return (
      <div
        className="rule-container flow"
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="header">
          <div style={{float:'left', width:20}}>
            <RuleStateCircle rule={rule} />
            <DisclosureTriangle
              onClick={() => this.setState({disclosed: !disclosed})}
              disclosed={disclosed}
            />
          </div>
          <select onChange={this._onSaveRules} value={rule.behavior}>
            {Object.keys(FLOW_BEHAVIORS).map((key) =>
              <option key={key} value={key}>{FLOW_BEHAVIORS[key]}</option>
            )}
          </select>
          <TapToEditLabel
            className="name"
            value={rule.name}
            onChange={this._onNameChange}
          />
        </div>
        <RuleList
          rules={rule.rules}
          parentId={rule.id}
          hidden={disclosed}
        />
      </div>
    );
  }
}
