import React, {PropTypes} from 'react';
import {Nav, NavItem, NavLink} from 'reactstrap';
import classNames from 'classnames';
import {connect} from 'react-redux';

import ContainerPaneRules from './container-pane-rules';
import ContainerPaneVariables from './container-pane-variables';
import AddRuleButton from './add-rule-button';
import AddVariableButton from './add-variable-button';
import {getCurrentStageForWorld} from '../../utils/selectors';

import * as CustomPropTypes from '../../constants/custom-prop-types';

class Container extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    world: PropTypes.object,
    actor: PropTypes.object,
    characters: PropTypes.object,
    character: PropTypes.object,
    selectedActorPath: CustomPropTypes.WorldSelection,
    selectedToolId: PropTypes.string,
  };

  static childContextTypes = {
    characters: PropTypes.object,
    evaluatedRuleIds: PropTypes.object,
    selectedToolId: PropTypes.string,
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
      selectedToolId: this.props.selectedToolId,
      evaluatedRuleIds: this.props.world.evaluatedRuleIds,
    };
  }

  _onChangeTab = (activeTab) => {
    this.setState({activeTab});
  }

  render() {
    const {character, world, actor, dispatch, selectedActorPath} = this.props;
    const {activeTab} = this.state;

    const ContentContainer = {
      rules: ContainerPaneRules,
      variables: ContainerPaneVariables,
    }[activeTab];

    const AddButton = {
      rules: AddRuleButton,
      variables: AddVariableButton,
    }[activeTab];

    return (
      <div className={`panel inspector-panel-container tool-${this.props.selectedToolId}`}>
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
              actor={actor}
              dispatch={dispatch}
            />
          </div>
        </Nav>
        <ContentContainer
          world={world}
          character={character}
          actor={actor}
          selectedActorPath={selectedActorPath}
          dispatch={dispatch}
        />
      </div>
    );
  }
}

function mapStateToProps({world, ui, characters, recording}) {
  const {worldId, actorId} = ui.selectedActorPath;

  // find the focused actor
  const focusedWorld = [recording.beforeWorld, recording.afterWorld].find(s => s.id === worldId) || world;
  const focusedStage = getCurrentStageForWorld(focusedWorld);
  const focusedActor = (focusedStage.actors || {})[actorId];

  return Object.assign({}, ui, {
    actor: focusedActor,
    world: focusedWorld,
    characters: characters,
    character: characters[ui.selectedCharacterId],
    selectedToolId: ui.selectedToolId,
    selectedActorPath: ui.selectedActorPath,
});
}

export default connect(
  mapStateToProps,
)(Container);
