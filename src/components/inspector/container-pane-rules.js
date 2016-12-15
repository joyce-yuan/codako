import React, {PropTypes} from 'react';
import objectAssign from 'object-assign';
import {changeCharacter} from '../../actions/characters-actions';
import RuleList from './rule-list';

export default class RulesContainer extends React.Component {
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

  _onRuleMoved = (movingRuleId, newParentId, newParentIdx) => {
    const rules = JSON.parse(JSON.stringify(this.props.character.rules));
    this._findRule({rules}, newParentId, (newParentRule) => {
      this._findRule({rules}, movingRuleId, (rule, oldParentRule, oldIdx) => {
        let newIdx = newParentIdx;
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
