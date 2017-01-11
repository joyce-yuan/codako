import React, {PropTypes} from 'react';
import {Nav, NavItem, NavLink} from 'reactstrap';
import classNames from 'classnames';
import {connect} from 'react-redux';

import ContainerPaneRules from './container-pane-rules';
import ContainerPaneVariables from './container-pane-variables';
import AddRuleButton from './add-rule-button';
import AddVariableButton from './add-variable-button';

class Container extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    actor: PropTypes.object,
    characters: PropTypes.object,
    character: PropTypes.object,
    evaluatedRuleIds: PropTypes.object,
    selectedActorPath: PropTypes.string,
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
      evaluatedRuleIds: this.props.evaluatedRuleIds,
    };
  }

  _onChangeTab = (activeTab) => {
    this.setState({activeTab});
  }

  render() {
    const {character, actor, dispatch, selectedActorPath} = this.props;
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
              actor={actor}
              dispatch={dispatch}
            />
          </div>
        </Nav>
        <ContentContainer
          character={character}
          actor={actor}
          selectedActorPath={selectedActorPath}
          dispatch={dispatch}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const stage = state.stages[state.ui.selectedStageIndex];

  let actor = null;
  if (state.ui.selectedActorPath) {
    const [stageId, actorId] = state.ui.selectedActorPath.split(':');
    for (const s of [stage, state.recording.beforeStage, state.recording.afterStage]) {
      if (s.id === stageId) {
        actor = (s.actors || {})[actorId];
      }
    }
  }

  return Object.assign({}, state.ui, {
    actor: actor,
    characters: state.characters,
    character: state.characters[state.ui.selectedCharacterId],
    selectedToolId: state.ui.selectedToolId,
    selectedActorPath: state.ui.selectedActorPath,
    evaluatedRuleIds: stage.evaluatedRuleIds,
});
}

export default connect(
  mapStateToProps,
)(Container);
