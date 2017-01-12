import React, {PropTypes} from 'react';
import {changeActor} from '../../actions/stage-actions';
import {changeCharacter} from '../../actions/characters-actions';
import TapToEditLabel from '../tap-to-edit-label';

class VariableBlock extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    disabled: PropTypes.bool,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    valueSetOnActor: PropTypes.bool,
    onChangeValue: PropTypes.func,
    onChangeDefinition: PropTypes.func,
    onBlurValue: PropTypes.func,
  };

  render() {
    const {name, disabled, value, valueSetOnActor, id, onChangeDefinition, onChangeValue, onBlurValue} = this.props;

    return (
      <div className={`variable-box variable-set-${valueSetOnActor}`}>
        <TapToEditLabel
          disabled={disabled}
          className="name"
          value={name}
          onChange={(e) => onChangeDefinition(id, {name: e.target.value})}
        />
        <input
          disabled={disabled}
          className="value"
          value={value}
          onBlur={(e) => onBlurValue(id, e.target.value)}
          onChange={(e) => onChangeValue(id, e.target.value)}
        />
      </div>
    );
  }
}
export default class ContainerPaneVariables extends React.Component {
  static propTypes = {
    character: PropTypes.object,
    actor: PropTypes.object,
    selectedActorPath: PropTypes.string,
    dispatch: PropTypes.func,
  }

  static contextTypes = {
    selectedToolId: PropTypes.string,
  };

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
  
  _onFinalizeVarValue = (id, value) => {
    if (value !== '' && `${value / 1}` === value) {
      this._onChangeVarValue(id, value / 1);
    } else {
      this._onChangeVarValue(id, undefined);
    }
  }

  _renderCharacterSection() {
    const {character, actor} = this.props;
    if (!character) {
      return (
        <div className="empty">Please select a character.</div>
      );
    }

    const actorValues = actor ? actor.variableValues : {};

    return (
      <div className="variables-grid">
        {Object.values(character.variables).map(({name, id, defaultValue}) =>
          <VariableBlock
            id={id}
            key={id}
            name={name}
            disabled={this.context.selectedToolId === 'trash'}
            value={(actorValues[id] !== undefined) ? actorValues[id] : defaultValue}
            valueSetOnActor={actorValues[id] !== undefined}
            onChangeDefinition={this._onChangeVarDefinition}
            onChangeValue={this._onChangeVarValue}
            onBlurValue={this._onFinalizeVarValue}
          />
        )}
      </div>
    );
  }

  _renderWorldSection() {
    return (
      <div className="variables-grid">
        <VariableBlock
          id="stage-id"
          name="Current Stage"
          value={"none"}
          valueSetOnActor
        />
        <VariableBlock
          id="main-character-id"
          name="Main Character"
          value={"none"}
          valueSetOnActor
        />
      </div>
    );
  }

  render() {
    return (
      <div className={`scroll-container tool-${this.context.selectedToolId}`}>
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
