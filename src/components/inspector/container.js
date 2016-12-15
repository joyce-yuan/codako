import React, {PropTypes} from 'react';
import {Nav, NavItem, NavLink} from 'reactstrap';
import classNames from 'classnames';
import {connect} from 'react-redux';

import ContainerPaneRules from './container-pane-rules';
import ContainerPaneVariables from './container-pane-variables';
import RuleAddButton from './rule-add-button';
import VariablesAddButton from './variables-add-button';

class Container extends React.Component {
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

  _renderRulesContent = (character) => {
    if (character.rules.length === 0) {
      return (
        <div className="empty">
          This character doesn&quot;t have any rules. Create a new rule by clicking the &quot;Record&quot; icon.
        </div>
      );
    }
    return (
      <ContainerPaneRules character={character} dispatch={this.props.dispatch} />
    );
  }

  _renderVariablesContent = (character) => {
    return (
      <ContainerPaneVariables character={character} dispatch={this.props.dispatch} />
    );
  }

  render() {
    const {characters, selectedCharacterId, dispatch} = this.props;
    const {activeTab} = this.state;
    const character = characters[selectedCharacterId];

    const content = character ? {
      rules: this._renderRulesContent,
      variables: this._renderVariablesContent,
    }[activeTab](character) : (
      <div className="empty">Please select a character.</div>
    );

    const AddButton = {
      rules: RuleAddButton,
      variables: VariablesAddButton,
    }[activeTab];

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
          <div style={{float: 'right'}}>
            <AddButton
              character={character}
              dispatch={dispatch}
            />
          </div>
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
)(Container);
