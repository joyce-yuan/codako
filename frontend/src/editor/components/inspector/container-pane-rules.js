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
    const root = {rules};

    const [movingRule, oldParentRule, oldIdx] = findRule(root, movingRuleId);
    const [newParentRule] = newParentId ? findRule(root, newParentId) : [root];
    if (!newParentRule) {
      throw new Error(`Couldn't find new parent rule ID: ${newParentId}`);
    }

    // check that the rule isn't moving down into itself, which causes it to be detached
    if (movingRule.rules && (movingRuleId === newParentId || findRule(movingRule, newParentId))) {
      return;
    }

    let newIdx = newParentIdx;
    if ((oldParentRule === newParentRule) && (newIdx > oldIdx)) {
      newIdx -= 1;
    }
    oldParentRule.rules.splice(oldIdx, 1);
    newParentRule.rules.splice(newIdx, 0, movingRule);
    this.props.dispatch(changeCharacter(this.props.character.id, root));
  }

  _onRuleDeleted = (ruleId, event) => {
    const {character, dispatch} = this.props;
    const rules = JSON.parse(JSON.stringify(character.rules));
    const [, parentRule, parentIdx] = findRule({rules}, ruleId);
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
    if (!character) {
      return (
        <div className="empty">Please select a character.</div>
      );
    }
    if (character.rules.length === 0) {
      return (
        <div className="empty">
          This character doesn&#39;t have any rules.
          Create a new rule by clicking the &#39;Record&#39; icon.
        </div>
      );
    }
    return (
      <div className="scroll-container">
        <div className="scroll-container-contents">
          <RuleList rules={character.rules} />
        </div>
      </div>
    );
  }
}
