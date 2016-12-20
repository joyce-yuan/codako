import React, {PropTypes} from 'react';
import {changeActor} from '../../actions/stage-actions';
import {changeCharacter} from '../../actions/characters-actions';

class VariableBlock extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    valueSetOnActor: PropTypes.bool,
    onChangeValue: PropTypes.func,
    onChangeDefinition: PropTypes.func,
  };

  render() {
    const {name, value, valueSetOnActor, id, onChangeDefinition, onChangeValue} = this.props;

    return (
      <div className={`variable-box variable-set-${valueSetOnActor}`}>
        <input
          className="name"
          value={name}
          onChange={(e) =>
            onChangeDefinition(id, {name: e.target.value})
          }
        />
        <input
          className="value"
          value={value}
          onChange={(e) =>
            onChangeValue(id, e.target.value)
          }
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

  _onChangeVarDefinition = (id, changes) => {
    const {character, dispatch} = this.props;
    dispatch(changeCharacter(character.id, {
      variables: {
        [id]: changes,
      },
    }));
  }

  _onChangeVarValue = (id, value) => {
    if (value.length && Number.isNaN(Number.parseFloat(value))) {
      return;
    }

    const {dispatch, selectedActorPath} = this.props;
    if (!selectedActorPath) {
      this._onChangeVarDefinition(id, {value});
      return;
    }
    const [stageUid, actorId] = selectedActorPath.split(':');
    dispatch(changeActor(stageUid, actorId, {
      variableValues: {
        [id]: value,
      },
    }));
  }

  render() {
    const {character, actor} = this.props;
    if (!character) {
      return (
        <div className="empty">Please select a character.</div>
      );
    }

    const actorValues = actor ? actor.variableValues : {};
    return (
      <div className="scroll-container variables-grid">
      {Object.values(character.variables).map(({name, id, value}) =>
        <VariableBlock
          id={id}
          key={id}
          name={name}
          value={!Number.isNaN(Number.parseFloat(actorValues[id])) ? actorValues[id] : value}
          valueSetOnActor={!Number.isNaN(Number.parseFloat(actorValues[id]))}
          onChangeDefinition={this._onChangeVarDefinition}
          onChangeValue={this._onChangeVarValue}
        />
      )}
      </div>
    );
  }
}
