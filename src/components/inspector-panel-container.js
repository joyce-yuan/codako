import React, {PropTypes} from 'react';
import {Nav, NavItem, NavLink} from 'reactstrap';
import classNames from 'classnames';
import {connect} from 'react-redux';

//
// - rules: [
//   {
//   type: 'group-event'
//   name:
//   rules:
//   event:
//   code:
//   }
//
//   {
//   id:
//   name:
//   scenario:
//   descriptors:
//   actions:
//   }
// ]


const FlowGroupTypes = [
  'Do First Match': 'first',
  'Do All & Continue': 'all',
  'Randomize & Do First': 'random',
];

function nameForKey(code) {
  if (code == 32) {
    return "Space Bar";
  }
  if (code == 38) {
    return "Up Arrow";
  }
  if (code == 37) {
    return "Left Arrow";
  }
  if (code == 39) {
    return "Right Arrow";
  }
  return String.fromEventKeyCode(code);
}

class DisclosureTriangle extends React.Component {
  static propTypes = {
    disclosed: PropTypes.bool,
    onClick: PropTypes.func,
  };

  render() {
    return (
      <div onClick={this.props.onClick} className={`triangle ${this.props.disclosed}`} />
    );
  }
}

class StateCircle extends React.Component {
  static propTypes = {
    rule: PropTypes.object,
  };

  render() {
    const applied = false; //!!actor.applied[rule._id]
    return (
      <div className={`circle ${applied}`} />
    );
  }
}

class RuleList extends React.Component {
  static propTypes = {
    rules: PropTypes.array,
    hidden: PropTypes.bool,
  }

  _onRuleClicked = () => {

  }

  _componentForRule(rule) {
    if (rule.type === 'group-event') {
      return EventGroup;
    }
    if (rule.type === 'group-flow') {
      return FlowGroup;
    }
    return Rule;
  }

  render() {
    const {hidden, rules} = this.props;

    if (hidden || !rules || rules.length === 0) {
      return <span />;
    }

    return (
      <ul className="rules-list">
      {
        rules.map((r) => {
          const Component = this._componentForRule(r);
          return (<Component onClick={this._onRuleClicked} rule={r} key={r.id} />);
        })
      }
      </ul>
    );
  }
}

class EventGroup extends React.Component {
  static propTypes = {
    rule: PropTypes.object,
    onClick: PropTypes.func,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      disclosed: false,
    };
  }

  _name() {
    const {event, code} = this.props.rule;

    if (event == 'key') {
      return (
        <span>
          When the
          <span className="keycode">{nameForKey(code)} Key</span>
          is Pressed
        </span>
      );
    }
    if (event == 'click') {
      return "When I'm Clicked";
    }
    return "When I'm Idle";
  }


  render() {
    const {rule} = this.props;
    const {disclosed} = this.state;

    return (
      <div className="rule-container event">
        <div className="header">
          <div style={{float:'left', width: 20, lineHeight:'1.15em'}}>
            <StateCircle rule={rule} />
            <DisclosureTriangle onClick={() => this.setState({disclosed: !disclosed})} disclosed={disclosed} />
          </div>
          <img className="icon" src={`/img/icon_event_${rule.event}.png`} />
          <div className="name" onDoubleClick="double_click_edit_event_group(struct)">
            {this._name()}
          </div>
        </div>
        <RuleList rules={rule.rules} hidden={disclosed} />
      </div>
    );
  }
}

class FlowGroup extends React.Component {
  static propTypes = {
    rule: PropTypes.object,
    onClick: PropTypes.func,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      disclosed: false,
    };
  }

  render() {
    const {rule} = this.props;
    const {disclosed} = this.state;

    return (
      <div className="rule-container group">
        <div className="header">
          <div style={{float:'left', width:20}}>
            <StateCircle rule={rule} />
            <DisclosureTriangle onClick={() => this.setState({disclosed: !disclosed})} disclosed={disclosed} />
          </div>
          <select onChange={this._onSaveRules} value={rule.behavior}>
            {
              FlowGroupTypes.map((key, val) => <option key={key} value={val} />)
            }
          </select>
          <input className="name" value={rule.name} />
        </div>
        <RuleList rules={rule.rules} hidden={disclosed} />
      </div>
    );
  }
}

class Rule extends React.Component {
  static propTypes = {
    rule: PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      disclosed: false,
    };
  }

  _onDoubleClick = () => {

  }

  _imageURLForScenario = (stage) => {
    return '';
  }

  render() {
    const {rule} = this.props;
    const {disclosed} = this.state;

    return (
      <div className="rule-container rule" onDoubleClick={this._onDoubleClick}>
        <div className="zerospace">
          <StateCircle rule={rule} />
        </div>
        <div className="scenario">
          <img src={this._imageURLForScenario('before')} />
          <div className="arrow">
            <i className="icon-arrow-right" />
          </div>
          <img src={this._imageURLForScenario('after')} />
        </div>

        <DisclosureTriangle onClick={() => this.setState({disclosed: !disclosed})} disclosed={disclosed} />
        <input className="name" value={rule.name} />
        <RuleList rules={rule.rules} hidden={disclosed} />
      </div>
    );
  }
}

class RulesContainer extends React.Component {
  static propTypes = {
    character: PropTypes.object,
  };

  render() {
    return (
      <RuleList rules={this.props.character.rules} />
    );
  }
}

class VariablesContainer extends React.Component {
  render() {
    return (
      <span />
    );
  }
}

class InspectorPanelContainer extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,

    characters: PropTypes.object,
    selectedCharacterId: PropTypes.string,
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      activeTab: 'rules',
    };
  }

  _onChangeTab = (activeTab) => {
    this.setState({activeTab});
  }

  render() {
    const {activeTab} = this.state;
    const character = this.props.characters[this.props.selectedCharacterId];

    let content = "Please select a character.";
    if (character && activeTab === 'rules') {
      content = (<RulesContainer character={character} />);
    } else if (character && activeTab === 'variables') {
      content = (<VariablesContainer character={character} />);
    }

    return (
      <div className="panel inspector-panel-container">
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classNames({active: activeTab === 'rules'})}
              onClick={() => { this._onChangeTab('rules'); }}
            >
              Rules
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classNames({active: activeTab === 'variables'})}
              onClick={() => { this._onChangeTab('variables'); }}
            >
              Variables
            </NavLink>
          </NavItem>
        </Nav>
        {content}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return Object.assign({}, state.ui, {characters: state.characters});
}

export default connect(
  mapStateToProps,
)(InspectorPanelContainer);
