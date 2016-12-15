import React, {PropTypes} from 'react';
import objectAssign from 'object-assign';
import {changeCharacter} from '../../actions/characters-actions';
import {pickCharacterRuleEventKey} from '../../actions/ui-actions';
import {findRule} from '../game-state-helpers';
import RuleList from './rule-list';

export default class ContainerPaneRules extends React.Component {
  static propTypes = {
    character: PropTypes.object,
    dispatch: PropTypes.func,
  }

  static childContextTypes = {
    onRuleMoved: PropTypes.func,
    onRuleDeleted: PropTypes.func,
    onRuleChanged: PropTypes.func,
    onRulePickKey: PropTypes.func,
  }

  getChildContext() {
    return {
      onRuleMoved: this._onRuleMoved,
      onRuleDeleted: this._onRuleDeleted,
      onRuleChanged: this._onRuleChanged,
      onRulePickKey: this._onRulePickKey,
    };
  }

  _onRuleMoved = (movingRuleId, newParentId, newParentIdx) => {
    const rules = JSON.parse(JSON.stringify(this.props.character.rules));
    findRule({rules}, newParentId, (newParentRule) => {
      findRule({rules}, movingRuleId, (rule, oldParentRule, oldIdx) => {
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

  _onRuleDeleted = (ruleId) => {
    const rules = JSON.parse(JSON.stringify(this.props.character.rules));
    findRule({rules}, ruleId, (rule, parentRule, parentIdx) => {
      parentRule.rules.splice(parentIdx, 1);
    });
    this.props.dispatch(changeCharacter(this.props.character.id, {rules}));
  }

  _onRuleChanged = (ruleId, changes) => {
    const rules = JSON.parse(JSON.stringify(this.props.character.rules));
    findRule({rules}, ruleId, (rule) => {
      objectAssign(rule, changes);
    });
    this.props.dispatch(changeCharacter(this.props.character.id, {rules}));
  }

  _onRulePickKey = (ruleId) => {
    const {character, dispatch} = this.props;
    findRule(character, ruleId, (rule) => {
      dispatch(pickCharacterRuleEventKey(character.id, ruleId, rule.code));
    });
  }

  render() {
    const {character} = this.props;
    return (
      <RuleList rules={character.rules} />
    );
  }
}
