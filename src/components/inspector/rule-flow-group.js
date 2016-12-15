import React, {PropTypes} from 'react';
import RuleStateCircle from './rule-state-circle';
import DisclosureTriangle from './disclosure-triangle';

import RuleList from './rule-list';
import {FLOW_GROUP_TYPES} from '../../constants/constants';

export default class RuleFlowGroup extends React.Component {
  static propTypes = {
    rule: PropTypes.object,
    onClick: PropTypes.func,
    onDragStart: PropTypes.func,
    onDragEnd: PropTypes.func,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      disclosed: false,
    };
  }

  _onNameChange = (event) => {

  }

  render() {
    const {rule, onDragStart, onDragEnd} = this.props;
    const {disclosed} = this.state;

    return (
      <div
        className="rule-container group"
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
            {Object.keys(FLOW_GROUP_TYPES).map((key) =>
              <option key={key} value={key}>{FLOW_GROUP_TYPES[key]}</option>
            )}
          </select>
          <input
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
