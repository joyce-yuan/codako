import React, {PropTypes} from 'react';
import objectAssign from 'object-assign';
import {TOOL_POINTER} from '../../constants/constants';
import {changeCharacter} from '../../actions/characters-actions';
import {pickCharacterRuleEventKey, selectToolId} from '../../actions/ui-actions';
import {editRuleRecording} from '../../actions/recording-actions';
import {findRule} from '../../utils/stage-helpers';
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
    onRuleReRecord: PropTypes.func,
  }

  getChildContext() {
    return {
      onRuleMoved: this._onRuleMoved,
      onRuleDeleted: this._onRuleDeleted,
      onRuleChanged: this._onRuleChanged,
      onRulePickKey: this._onRulePickKey,
      onRuleReRecord: this._onRuleReRecord,
    };
  }

  _onRuleReRecord = (rule) => {
    this.props.dispatch(editRuleRecording({
      characterId: this.props.character.id,
      rule: rule,
    }));
  }

  _onRuleMoved = (movingRuleId, newParentId, newParentIdx) => {
    const rules = JSON.parse(JSON.stringify(this.props.character.rules));
    const [newParentRule] = findRule({rules}, newParentId);
    const [movingRule, oldParentRule, oldIdx] = findRule({rules}, movingRuleId);
    let newIdx = newParentIdx;
    if ((oldParentRule === newParentRule) && (newIdx > oldIdx)) {
      newIdx -= 1;
    }
    oldParentRule.rules.splice(oldIdx, 1);
    newParentRule.rules.splice(newIdx, 0, movingRule);
    this.props.dispatch(changeCharacter(this.props.character.id, {rules}));
  }

  _onRuleDeleted = (ruleId, event) => {
    const {character, dispatch} = this.props;
    const rules = JSON.parse(JSON.stringify(character.rules));
    const [_, parentRule, parentIdx] = findRule({rules}, ruleId);
    parentRule.rules.splice(parentIdx, 1);
    dispatch(changeCharacter(character.id, {rules}));
    if (!event.shiftKey) {
      dispatch(selectToolId(TOOL_POINTER));
    }
  }

  _onRuleChanged = (ruleId, changes) => {
    const rules = JSON.parse(JSON.stringify(this.props.character.rules));
    const [rule] = findRule({rules}, ruleId);
    objectAssign(rule, changes);
    this.props.dispatch(changeCharacter(this.props.character.id, {rules}));
  }

  _onRulePickKey = (ruleId) => {
    const {character, dispatch} = this.props;
    const [rule] = findRule(character, ruleId);
    dispatch(pickCharacterRuleEventKey(character.id, ruleId, rule.code));
  }

  render() {
    const {character} = this.props;
    return (
      <div className="scroll-container">
        <RuleList rules={character.rules} />
      </div>
    );
  }
}
