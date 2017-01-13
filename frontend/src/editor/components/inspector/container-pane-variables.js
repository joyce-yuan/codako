import React, {PropTypes} from 'react';
import {changeActor} from '../../actions/stage-actions';
import {upsertGlobal, deleteGlobal} from '../../actions/world-actions';
import {changeCharacter, deleteCharacterVariable} from '../../actions/characters-actions';
import VariableGridItem from './variable-grid-item';
import {selectToolId} from '../../actions/ui-actions';
import {TOOL_TRASH, TOOL_POINTER} from '../../constants/constants';

function coerceToType(value, type) {
  if (type === 'number') {
    return (value !== '' && `${value / 1}` === value) ? value / 1 : undefined;
  }

  return value;
}

export default class ContainerPaneVariables extends React.Component {
  static propTypes = {
    character: PropTypes.object,
    actor: PropTypes.object,
    world: PropTypes.object,
    selectedActorPath: PropTypes.string,
    dispatch: PropTypes.func,
  };

  static contextTypes = {
    selectedToolId: PropTypes.string,
  };

  // Chararacter and actor variables

  _onClickVar = (id, event) => {
    if (this.context.selectedToolId === TOOL_TRASH) {
      const {character, dispatch} = this.props;
      dispatch(deleteCharacterVariable(character.id, id));
      if (!event.shiftKey) {
        dispatch(selectToolId(TOOL_POINTER));
      }
    }
  }

  _onChangeVarDefinition = (id, changes) => {
    const {character, dispatch} = this.props;
    dispatch(changeCharacter(character.id, {
      variables: {
        [id]: changes,
      },
    }));
  }

  _onChangeVarValue = (id, value) => {
    const {dispatch, selectedActorPath} = this.props;
    if (!selectedActorPath) {
      this._onChangeVarDefinition(id, {defaultValue: value});
      return;
    }
    const [stageId, actorId] = selectedActorPath.split(':');
    dispatch(changeActor(stageId, actorId, {
      variableValues: {
        [id]: value,
      },
    }));
  }
  
  // Globals

  _onChangeGlobalDefinition = (globalId, changes) => {
    this.props.dispatch(upsertGlobal(this.props.world.id, globalId, changes));
  }

  _onClickGlobal = (globalId) => {
    if (this.context.selectedToolId === TOOL_TRASH) {
      this.props.dispatch(deleteGlobal(this.props.world.id, globalId));
      if (!event.shiftKey) {
        this.props.dispatch(selectToolId(TOOL_POINTER));
      }
    }
  }

  _renderCharacterSection() {
    const {character, actor} = this.props;
    if (!character) {
      return (
        <div className="empty">
          Please select a character.
        </div>
      );
    }

    const actorValues = actor ? actor.variableValues : {};

    return (
      <div className="variables-grid">
        {Object.values(character.variables).map((definition) =>
          <VariableGridItem
            key={definition.id}
            definition={definition}
            value={actorValues[definition.id]}
            onChangeDefinition={this._onChangeVarDefinition}
            onChangeValue={this._onChangeVarValue}
            onBlurValue={(id, value) => this._onChangeVarValue(id, coerceToType(value, definition.type))}
            onClick={this._onClickVar}
          />
        )}
      </div>
    );
  }

  _renderWorldSection() {
    return (
      <div className="variables-grid">
        {Object.values(this.props.world.globals).map((definition) =>
          <VariableGridItem
            key={definition.id}
            definition={definition}
            value={definition.value || ''}
            onChangeDefinition={this._onChangeGlobalDefinition}
            onChangeValue={(id, value) =>
              this._onChangeGlobalDefinition(id, {value})
            }
            onBlurValue={(id, value) =>
              this._onChangeGlobalDefinition(id, {value: coerceToType(value, definition.type)})
            }
            onClick={this._onClickGlobal}
          />
        )}
      </div>
    );
  }

  render() {
    return (
      <div className={`scroll-container`}>
        <div className="scroll-container-contents">
          <div className="variables-section">
            <h3>Actor</h3>
            {this._renderCharacterSection()}
          </div>
          <div className="variables-section">
            <h3>World</h3>
            {this._renderWorldSection()}
          </div>
        </div>
      </div>
    );
  }
}
