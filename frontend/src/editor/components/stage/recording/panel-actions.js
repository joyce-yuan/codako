import React, {PropTypes} from 'react';
import {updateRecordingActionPrefs} from '../../../actions/recording-actions';
import {actionsForRecording} from '../../../utils/recording-helpers';
import {applyVariableOperation} from '../../../utils/stage-helpers';
import {changeActor} from '../../../actions/stage-actions';
import {getCurrentStageForWorld} from '../../../utils/selectors';

import ActorBlock from './actor-block';
import ActorDeltaCanvas from './actor-delta-canvas';
import ActorPositionCanvas from './actor-position-canvas';
import VariableBlock from './variable-block';
import AppearanceBlock from './appearance-block';

export default class RecordingActions extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    characters: PropTypes.object,
    recording: PropTypes.object,
  };

  _onChangeVariableOperation = (actorId, variableId, operation) => {
    this.props.dispatch(updateRecordingActionPrefs(actorId, {[variableId]: operation}));
  }

  _onChangeVariableValue = (actorId, variableId, operation, value) => {
    const {dispatch, recording: {beforeWorld, afterWorld}} = this.props;
    const beforeStage = getCurrentStageForWorld(beforeWorld);
    const afterStage = getCurrentStageForWorld(afterWorld);

    const actor = beforeStage.actors[actorId];
    const after = applyVariableOperation(actor.variableValues[variableId], operation, value);
    dispatch(changeActor(afterStage.id, actorId, {variableValues: {[variableId]: after}}));
  }

  _renderAction(a, idx) {
    const {characters, recording: {beforeWorld, afterWorld, extent}} = this.props;
    const beforeStage = getCurrentStageForWorld(beforeWorld);
    const afterStage = getCurrentStageForWorld(afterWorld);

    const actor = beforeStage.actors[a.actorId] || afterStage.actors[a.actorId];
    const character = characters[actor.characterId];

    if (a.type === 'move') {
      return (
        <li key={idx}>
          Move
          <ActorBlock actor={actor} character={character} />
          to
          <ActorDeltaCanvas delta={a.delta} />
        </li>
      );
    }
    if (a.type === 'create') {
      return (
        <li key={idx}>
          Create a
          <ActorBlock actor={actor} character={character} />
          at
          <ActorPositionCanvas position={actor.position} extent={extent} />
        </li>
      );
    }
    if (a.type === 'delete') {
      return (
        <li key={idx}>
          Remove
          <ActorBlock actor={actor} character={character} />
          from the stage
        </li>
      );
    }
    if (a.type === 'variable') {
      return (
        <li key={idx}>
          <select
            value={a.operation}
            className="variable-operation-select"
            onChange={(e) => this._onChangeVariableOperation(a.actorId, a.variable, e.target.value)}
          >
            <option value="add">Add</option>
            <option value="subtract">Subtract</option>
            <option value="set">Put</option>
          </select>
          <input
            type="text"
            key={`${a.variable}${a.value}`}
            defaultValue={a.value}
            className="variable-value-input"
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => e.keyCode === 13 ? e.target.blur() : null}
            onBlur={(e) => this._onChangeVariableValue(a.actorId, a.variable, a.operation, e.target.value)}  
          />
          {{set: 'into', add: 'to', subtract: 'from'}[a.operation]}
          <VariableBlock character={character} variableId={a.variable} />
          of
          <ActorBlock character={character} actor={actor} />
        </li>
      );
    }
    if (a.type === 'appearance') {
      return (
        <li key={idx}>
          Change appearance of
          <ActorBlock character={character} actor={actor} />
          to
          <AppearanceBlock character={character} appearanceId={a.to} />
        </li>
      );
    }
    throw new Error(`Unknown action type: ${a.type}`);
  }

  render() {
    const {recording, characters} = this.props;
    const actions = actionsForRecording(recording, {characters});

    return (
      <div style={{flex: 1, marginLeft: 3}}>
        <h2>It should...</h2>
        <ul>
          {actions.map((a, idx) => this._renderAction(a, idx))}
        </ul>
      </div>
    );
  }
}