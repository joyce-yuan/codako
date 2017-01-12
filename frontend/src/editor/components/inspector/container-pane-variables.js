import React, {PropTypes} from 'react';
import {changeActor} from '../../actions/stage-actions';
import {changeCharacter, deleteCharacterVariable} from '../../actions/characters-actions';
import TapToEditLabel from '../tap-to-edit-label';
import {selectToolId} from '../../actions/ui-actions';
import {TOOL_TRASH, TOOL_POINTER} from '../../constants/constants';

class VariableBlock extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    valueDefault: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    onChangeValue: PropTypes.func,
    onChangeDefinition: PropTypes.func,
    onBlurValue: PropTypes.func,
    onClick: PropTypes.func,
  };

  static contextTypes = {
    selectedToolId: PropTypes.string,
  };
  
  render() {
    const {name, value, valueDefault, id, onChangeDefinition, onChangeValue, onBlurValue, onClick} = this.props;
    const disabled = this.context.selectedToolId === 'trash';

    return (
      <div className={`variable-box variable-set-${value !== undefined}`} onClick={(e) => onClick(id, e)}>
        <TapToEditLabel
          className="name"
          value={name}
          onChange={disabled ? null : (e) => onChangeDefinition(id, {name: e.target.value})}
        />
        <input
          disabled={disabled}
          className="value"
          value={(value !== undefined) ? value : valueDefault}
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
    globals: PropTypes.array,
    selectedActorPath: PropTypes.string,
    dispatch: PropTypes.func,
  };

  static contextTypes = {
    selectedToolId: PropTypes.string,
  };

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
            value={actorValues[id]}
            valueDefault={defaultValue}
            onChangeDefinition={this._onChangeVarDefinition}
            onChangeValue={this._onChangeVarValue}
            onBlurValue={this._onFinalizeVarValue}
            onClick={this._onClickVar}
          />
        )}
      </div>
    );
  }

  _renderWorldSection() {
    const {globals} = this.props;

    return (
      <div className="variables-grid">
      {Object.values(globals).map((g) =>
        <VariableBlock
          id={g.id}
          key={g.id}
          name={g.name}
          value={g.value}
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
