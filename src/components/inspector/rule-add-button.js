import React, {PropTypes} from 'react';

import {ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap';
import {changeCharacter} from '../../actions/characters-actions';
import {pickCharacterRuleEventKey} from '../../actions/ui-actions';
import {FLOW_GROUP_TYPES} from '../../constants/constants';

export default class RuleAddButton extends React.Component {
  static propTypes = {
    character: PropTypes.object,
    dispatch: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {open: false};
  }

  _onCreateFlowContainer = () => {
    const {dispatch, character} = this.props;
    const nextRules = JSON.parse(JSON.stringify(character.rules));

    const idleContainer = nextRules.find(r => r.event === 'idle') || {rules: nextRules};
    idleContainer.rules.push({
      id: Date.now(),
      name: "",
      type: "group-flow",
      rules: [],
      behavior: Object.keys(FLOW_GROUP_TYPES)[0],
    });
    dispatch(changeCharacter(character.id, {rules: nextRules}));
  }

  _onCreateEventContainer = (eventType, code = null) => {
    const {dispatch, character} = this.props;
    let nextRules = JSON.parse(JSON.stringify(character.rules));
    const nextId = Date.now();
    const hasSameAlready = nextRules.some(r => r.event === eventType && r.code === code);
    if (hasSameAlready) {
      return;
    }

    const hasEvents = nextRules.some(r => !!r.event);
    if (!hasEvents) {
      nextRules = [{
        id: nextId + 1,
        name: "",
        type: "group-event",
        rules: nextRules,
        event: "idle",
      }];
    }

    nextRules.push({
      id: nextId,
      name: "",
      type: "group-event",
      rules: [],
      event: eventType,
      code: code,
    });

    dispatch(changeCharacter(character.id, {rules: nextRules}));
    if (eventType === 'key' && !code) {
      dispatch(pickCharacterRuleEventKey(character.id, nextId, null));
    }
  }

  render() {
    const {character} = this.props;

    return (
      <ButtonDropdown
        size="sm"
        isOpen={this.state.open}
        toggle={() => this.setState({open: !this.state.open})}
      >
        <DropdownToggle caret disabled={!character}>
          <i className="fa fa-tasks" /> Add
        </DropdownToggle>
        <DropdownMenu right>
          <DropdownItem onClick={() => {}}>
            <span className="badge rule" /> Add New Rule
          </DropdownItem>
          <DropdownItem divider />
          <DropdownItem onClick={this._onCreateFlowContainer}>
            <span className="badge rule-flow" /> Add Flow Container
          </DropdownItem>
          <DropdownItem divider />
          <DropdownItem onClick={() => this._onCreateEventContainer('key')}>
            <span className="badge rule-event" /> When a Key is Pressed...
          </DropdownItem>
          <DropdownItem onClick={() => this._onCreateEventContainer('click')}>
            <span className="badge rule-event" /> When I&#39;m Clicked...
          </DropdownItem>
        </DropdownMenu>
      </ButtonDropdown>
    );
  }
}
