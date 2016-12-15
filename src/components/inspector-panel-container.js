import React, {PropTypes} from 'react';
import {Nav, NavItem, NavLink} from 'reactstrap';
import classNames from 'classnames';
import {connect} from 'react-redux';
import objectAssign from 'object-assign';

import ScenarioStage from './scenario-stage';
import RuleStateCircle from './rule-state-circle';
import DisclosureTriangle from './disclosure-triangle';

import {nameForKey} from './game-state-helpers';
import {changeCharacter} from '../actions/characters-actions';
import {FLOW_GROUP_TYPES} from '../constants/constants';


class RuleDropPlaceholder extends React.Component {
  render() {
    return (<div style={{height: 30}} />);
  }
}

class RuleList extends React.Component {
  static propTypes = {
    parentId: PropTypes.string,
    rules: PropTypes.array,
    hidden: PropTypes.bool,
    onRuleMoved: PropTypes.func,
    onRuleChanged: PropTypes.func,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      dragIndex: -1,
      dropIndex: -1,
    };
  }

  componentWillReceiveProps() {
    if (this.state.dragIndex !== -1) {
      this.setState({dragIndex: -1});
    }
  }

  componentWillUnmount() {
    clearTimeout(this._leaveTimeout);
  }

  _componentForRule(rule) {
    if (rule.type === 'group-event') {
      return RuleEventGroup;
    }
    if (rule.type === 'group-flow') {
      return RuleFlowGroup;
    }
    return Rule;
  }

  _dropIndexForRuleDragEvent(event) {
    const hasRuleId = event.dataTransfer.types.includes('rule-id');
    if (!this.props.parentId || !hasRuleId) {
      return -1;
    }

    const all = Array.from(this._el.children).filter(c => c.classList.contains('rule-container'));
    for (let i = 0; i < all.length; i ++) {
      const {top, height} = all[i].getBoundingClientRect();
      if (top + height * 0.5 > event.clientY) {
        return i;
      }
    }

    return all.length;
  }

  _onRuleClicked = () => {

  }

  _onDragStart = (event, rule) => {
    event.dataTransfer.setData('rule-id', rule.id);
    this.setState({
      dragIndex: this.props.rules.indexOf(rule),
      dropIndex: -1,
    });
  }

  _onDragEnd = () => {
    this.setState({
      dragIndex: -1,
      dropIndex: -1,
    });
  }

  _onDragOver = (event) => {
    clearTimeout(this._leaveTimeout);
    const dropIndex = this._dropIndexForRuleDragEvent(event);
    if (dropIndex === -1) {
      event.preventDefault();
      return;
    }
    this.setState({dropIndex});
  }

  _onDragLeave = () => {
    this._leaveTimeout = setTimeout(() => {
      this.setState({dropIndex: -1});
    }, 50);
  }

  _onDrop = (event) => {
    const ruleId = event.dataTransfer.getData('rule-id');
    const dropIndex = this._dropIndexForRuleDragEvent(event);

    if (!this.props.parentId || !ruleId || (dropIndex === -1)) {
      event.preventDefault();
      return;
    }

    this.props.onRuleMoved(ruleId, this.props.parentId, dropIndex);
    this.setState({dragIndex: -1, dropIndex: -1});
  }

  render() {
    const {hidden, rules, onRuleMoved, onRuleChanged} = this.props;
    const {dropIndex, dragIndex} = this.state;

    if (hidden || !rules) {
      return <span />;
    }

    const items = rules.map((r) => {
      const Component = this._componentForRule(r);
      return (
        <Component
          onRuleMoved={onRuleMoved}
          onRuleChanged={onRuleChanged}
          onClick={(event) => this._onRuleClicked(event, r)}
          onDragStart={(event) => this._onDragStart(event, r)}
          onDragEnd={(event) => this._onDragEnd(event, r)}
          rule={r}
          key={r.id}
        />
      );
    });

    if ((dropIndex !== -1) && ((items.length === 0) || (dragIndex !== dropIndex))) {
      items.splice(dropIndex, 0, <RuleDropPlaceholder key={'drop'} />);
    }

    return (
      <ul
        className="rules-list"
        ref={(el) => this._el = el}
        onDragOver={this._onDragOver}
        onDragLeave={this._onDragLeave}
        onDrop={this._onDrop}
      >
        {items}
      </ul>
    );
  }
}

class RuleEventGroup extends React.Component {
  static propTypes = {
    rule: PropTypes.object,
    onClick: PropTypes.func,
    onRuleMoved: PropTypes.func,
    onRuleChanged: PropTypes.func,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      disclosed: false,
    };
  }

  _name() {
    const {event, code} = this.props.rule;

    if (event === 'key') {
      return (
        <span>
          When the
          <span className="keycode">{nameForKey(code)} Key</span>
          is Pressed
        </span>
      );
    }
    if (event === 'click') {
      return "When I'm Clicked";
    }
    return "When I'm Idle";
  }

  _onEditKey = () => {
    this.props.onRuleChanged(this.props.rule.id, {
      code: 49,
    });
  }

  render() {
    const {rule, onRuleMoved, onRuleChanged} = this.props;
    const {disclosed} = this.state;

    return (
      <div className="rule-container event">
        <div className="header">
          <div style={{float:'left', width: 20, lineHeight:'1.15em'}}>
            <RuleStateCircle rule={rule} />
            <DisclosureTriangle
              onClick={() => this.setState({disclosed: !disclosed})}
              disclosed={disclosed}
            />
          </div>
          <img className="icon" src={`/img/icon_event_${rule.event}.png`} />
          <div className="name" onDoubleClick={this._onEditKey}>{this._name()}</div>
        </div>
        <RuleList
          rules={rule.rules}
          parentId={rule.id}
          hidden={disclosed}
          onRuleMoved={onRuleMoved}
          onRuleChanged={onRuleChanged}
        />
      </div>
    );
  }
}

class RuleFlowGroup extends React.Component {
  static propTypes = {
    rule: PropTypes.object,
    onClick: PropTypes.func,
    onDragStart: PropTypes.func,
    onDragEnd: PropTypes.func,
    onRuleMoved: PropTypes.func,
    onRuleChanged: PropTypes.func,
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
    const {rule, onDragStart, onDragEnd, onRuleMoved, onRuleChanged} = this.props;
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
            {FLOW_GROUP_TYPES.map((key, val) =>
              <option key={key} value={val} />
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
          onRuleMoved={onRuleMoved}
          onRuleChanged={onRuleChanged}
        />
      </div>
    );
  }
}

class Rule extends React.Component {
  static propTypes = {
    rule: PropTypes.object,
    onDragStart: PropTypes.func,
    onDragEnd: PropTypes.func,
    onRuleChanged: PropTypes.func,
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
    const {rule, onDragStart, onDragEnd} = this.props;
    const {disclosed} = this.state;

    return (
      <div
        className="rule-container rule"
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
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



class RulesContainer extends React.Component {
  static propTypes = {
    character: PropTypes.object,
    dispatch: PropTypes.func,
  }

  _findRule = (node, id, callback) => {
    node.rules.forEach((n, idx) => {
      if (n.id === id) {
        callback(n, node, idx);
      } else if (n.rules) {
        this._findRule(n, id, callback);
      }
    });
  };

  _onRuleMoved = (movingRuleId, newParentId, newIdx) => {
    const rules = JSON.parse(JSON.stringify(this.props.character.rules));
    this._findRule({rules}, newParentId, (newParentRule) => {
      this._findRule({rules}, movingRuleId, (rule, oldParentRule, oldIdx) => {
        if ((oldParentRule === newParentRule) && (newIdx > oldIdx)) {
          newIdx -= 1;
        }
        oldParentRule.rules.splice(oldIdx, 1);
        newParentRule.rules.splice(newIdx, 0, rule);
      });
    });
    this.props.dispatch(changeCharacter(this.props.character.id, {rules}));
  }

  _onRuleChanged = (ruleId, changes) => {
    const rules = JSON.parse(JSON.stringify(this.props.character.rules));
    this._findRule({rules}, ruleId, (rule) => {
      objectAssign(rule, changes);
    });
    this.props.dispatch(changeCharacter(this.props.character.id, {rules}));
  }

  render() {
    const {character} = this.props;
    return (
      <RuleList
        rules={character.rules}
        onRuleMoved={this._onRuleMoved}
        onRuleChanged={this._onRuleChanged}
      />
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
    appliedRuleIds: PropTypes.object,
    selectedCharacterId: PropTypes.string,
  };

  static childContextTypes = {
    characters: PropTypes.object,
    appliedRuleIds: PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      activeTab: 'rules',
    };
  }

  getChildContext() {
    return {
      characters: this.props.characters,
      appliedRuleIds: this.props.appliedRuleIds,
    };
  }

  _onChangeTab = (activeTab) => {
    this.setState({activeTab});
  }

  render() {
    const {characters, selectedCharacterId, dispatch} = this.props;
    const {activeTab} = this.state;
    const character = characters[selectedCharacterId];

    let content = "Please select a character.";
    if (character && activeTab === 'rules') {
      content = (
        <RulesContainer character={character} dispatch={dispatch} />
      );
    } else if (character && activeTab === 'variables') {
      content = (
        <VariablesContainer character={character} dispatch={dispatch} />
      );
    }

    return (
      <div className="panel inspector-panel-container">
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classNames({active: activeTab === 'rules'})}
              onClick={() => this._onChangeTab('rules')}
            >
              Rules
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classNames({active: activeTab === 'variables'})}
              onClick={() => this._onChangeTab('variables')}
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
  return Object.assign({}, state.ui, {
    characters: state.characters,
    appliedRuleIds: state.stage.applied,
});
}

export default connect(
  mapStateToProps,
)(InspectorPanelContainer);
