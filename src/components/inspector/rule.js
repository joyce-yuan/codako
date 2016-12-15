import React, {PropTypes} from 'react';

import ScenarioStage from './scenario-stage';
import RuleStateCircle from './rule-state-circle';
import DisclosureTriangle from './disclosure-triangle';

export default class Rule extends React.Component {
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

  _onDoubleClick = () => {

  }

  render() {
    const {rule, onDragStart, onDragEnd, onClick} = this.props;
    const {disclosed} = this.state;

    return (
      <div
        className="rule-container rule"
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onClick={onClick}
        onDoubleClick={this._onDoubleClick}
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
          <div className="arrow">
            <i className="icon-arrow-right" />
          </div>
          <ScenarioStage
            rule={rule}
            applyActions={true}
            maxWidth={75}
            maxHeight={75}
          />
        </div>
        <DisclosureTriangle
          onClick={() => this.setState({disclosed: !disclosed})}
          disclosed={disclosed}
        />
        <input
          className="name"
          value={rule.name}
          onChange={this._onNameChange}
        />
      </div>
    );
  }
}
