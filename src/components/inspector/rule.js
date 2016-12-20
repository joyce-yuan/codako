import React, {PropTypes} from 'react';

import ScenarioStage from './scenario-stage';
import RuleStateCircle from './rule-state-circle';
import DisclosureTriangle from './disclosure-triangle';
import TapToEditLabel from '../tap-to-edit-label';

export default class Rule extends React.Component {
  static propTypes = {
    rule: PropTypes.object,
    onClick: PropTypes.func,
    onDoubleClick: PropTypes.func,
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
    const {rule, onDragStart, onDragEnd, onClick, onDoubleClick} = this.props;
    const {disclosed} = this.state;

    return (
      <div
        className="rule-container rule"
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      >
        <div className="zerospace">
          <RuleStateCircle rule={rule} />
        </div>
        <div className="scenario">
          <ScenarioStage
            rule={rule}
            applyActions={false}
            maxWidth={75}
            maxHeight={75}
          />
          <i className="fa fa-arrow-right" aria-hidden="true" />
          <ScenarioStage
            rule={rule}
            applyActions
            maxWidth={75}
            maxHeight={75}
          />
        </div>
        <DisclosureTriangle
          onClick={() => this.setState({disclosed: !disclosed})}
          disclosed={disclosed}
        />
        <TapToEditLabel
          className="name"
          value={rule.name}
          onChange={this._onNameChange}
        />
      </div>
    );
  }
}
