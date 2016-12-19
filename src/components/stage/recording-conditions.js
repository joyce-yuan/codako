import React, {PropTypes} from 'react';
import {updateRecordingCondition} from '../../actions/recording-actions';
import Sprite from '../sprites/sprite';
import {pointIsInside} from '../../utils/stage-helpers';

class ConditionToggle extends React.Component {
  static propTypes = {
    onClick: PropTypes.func,
    enabled: PropTypes.bool,
  }
  render() {
    return (
      <div onClick={this.props.onClick} className={`condition-toggle enabled-${this.props.enabled}`} />
    );
  }
}

class AppearanceRow extends React.Component {
  static propTypes = {
    actor: PropTypes.object,
    character: PropTypes.object,
    enabled: PropTypes.bool,
    onChange: PropTypes.func,
    appearance: PropTypes.string,
  };

  static defaultProps = {
    enabled: false,
  }

  render() {
    const {appearance, character, enabled, onChange} = this.props;

    return (
      <li>
        <div className="left">
          <code>
            <Sprite spritesheet={character.spritesheet} appearance={appearance} />
            {character.name}'s
          </code>
          appearance is
          <code>
            <Sprite spritesheet={character.spritesheet} appearance={appearance} />
            {character.spritesheet.appearanceNames[appearance]}
          </code>
        </div>
        <ConditionToggle enabled={enabled} onClick={() => onChange(!enabled)} />
      </li>
    );
  }
}

class VariableRow extends React.Component {
  static propTypes = {
    actor: PropTypes.object,
    character: PropTypes.object,
    enabled: PropTypes.bool,
    onChange: PropTypes.func,
    variableId: PropTypes.string,
    variableValue: PropTypes.string,
    comparator: PropTypes.string,
  };

  static defaultProps = {
    comparator: '=',
    enabled: false,
  }

  render() {
    const {actor, character, enabled, onChange, variableId, variableValue, comparator} = this.props;

    return (
      <li>
        <div className="left">
          <code>
            <Sprite spritesheet={character.spritesheet} appearance={actor.appearance} /> {character.name}'s
          </code>
          variable {variableId} is
          <select value={comparator} onChange={(e) => onChange(enabled, e.target.value)}>
            <option value="<">&lt;</option>
            <option value="=">&eq;</option>
            <option value=">">&gt;</option>
          </select>
          {variableValue}
        </div>
        <ConditionToggle enabled={enabled} onClick={() => onChange(!enabled, comparator)} />
      </li>
    );
  }
}

export default class RecordingConditions extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    conditions: PropTypes.object,
    characters: PropTypes.object,
    stage: PropTypes.object,
    extent: PropTypes.object,
  };

  render() {
    const {extent, stage, conditions, characters, dispatch} = this.props;

    const rows = [];
    Object.values(stage.actors).forEach((a) => {
      const saved = conditions[a.id] || {};

      if (pointIsInside(a.position, extent)) {
        const key = 'appearance';
        rows.push(
          <AppearanceRow
            key={`${a.id}-appearance`}
            character={characters[a.characterId]}
            actor={a}
            appearance={a.appearance}
            onChange={(enabled) =>
              dispatch(updateRecordingCondition(a.id, key, {enabled}))
            }
            {...saved[key]}
          />
        );

        for (const vkey of Object.keys(a.variableValues)) {
          rows.push(
            <VariableRow
              key={`${a.id}-var-${vkey}`}
              character={characters[a.characterId]}
              actor={a}
              variableId={vkey}
              variableValue={a.variableValues[vkey]}
              onChange={(enabled, comparator) =>
                dispatch(updateRecordingCondition(a.id, vkey, {enabled, comparator}))
              }
              {...saved[vkey]}
            />
          );
        }
      }
    });

    return (
      <div style={{flex: 1, marginRight: 3}}>
        <h2>When the picture matches and:</h2>
        <ul>
          {rows}
        </ul>
      </div>
    );
  }
}