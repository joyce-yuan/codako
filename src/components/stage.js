import React, {PropTypes} from 'react';
import objectAssign from 'object-assign';

import ActorSprite from './actor-sprite';
import {createActor, changeActor, deleteActor, recordClickForGameState, recordKeyForGameState} from '../actions/stage-actions';
import {select, selectToolId, paintCharacterAppearance, updateRecordingState} from '../actions/ui-actions';
import {getScenarioExtent} from './game-state-helpers';

import {STAGE_CELL_SIZE, TOOL_POINTER, TOOL_TRASH, TOOL_RECORD, TOOL_PAINT} from '../constants/constants';

class RecordingMaskSprite extends React.Component {
  static propTypes = {
    position: PropTypes.object,
  };

  render() {
    return (
      <div style={{
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.4)',
        width: STAGE_CELL_SIZE - 1,
        height: STAGE_CELL_SIZE - 1,
        left: this.props.position.x * STAGE_CELL_SIZE + 0.5,
        top: this.props.position.y * STAGE_CELL_SIZE + 0.5,
      }} />
    );
  }
}

class RecordingHandle extends React.Component {
  static propTypes = {
    side: PropTypes.string,
    position: PropTypes.object,
  };

  _onDragStart = (event) => {
    event.dataTransfer.setData(`handle`, 'true');
    event.dataTransfer.setData(`handle:${this.props.side}`, 'true');
  }

  render() {
    const {position, side} = this.props;
    return (
      <img
        draggable
        onDragStart={this._onDragStart}
        className={`handle-${side}`}
        src={`/img/tiles/handle_${side}.png`}
        style={{
          position: 'absolute',
          width: STAGE_CELL_SIZE,
          height: STAGE_CELL_SIZE,
          left: position.x * STAGE_CELL_SIZE,
          top: position.y * STAGE_CELL_SIZE,
        }}
      />
    );
  }
}

export default class Stage extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    style: PropTypes.object,

    actors: PropTypes.object,
    running: PropTypes.bool,
    recording: PropTypes.object,
    selectedToolId: PropTypes.string,
    selectedActorId: PropTypes.string,
    characters: PropTypes.object,
    width: PropTypes.number,
    height: PropTypes.number,
    wrapX: PropTypes.bool,
    wrapY: PropTypes.bool,
  };

  constructor(props, context) {
    super(props, context);
  }

  componentDidUpdate() {
    if (this.props.running) {
      this._el.focus();
    }
  }

  _onBlur = () => {
    if (this.props.running) {
      this._el.focus();
    }
  }

  _onKeyDown = (event) => {
    const {dispatch, selectedActorId} = this.props;

    if (event.keyCode === 127 || event.keyCode === 8) {
      if (selectedActorId) {
        dispatch(deleteActor(selectedActorId));
      }
      return;
    }
    dispatch(recordKeyForGameState(event.keyCode));
  }

  _onDragOver = (event) => {
    event.preventDefault();
    if (event.dataTransfer.types.includes('handle')) {
      this._onUpdateHandle(event);
    }
  }

  _onDrop = (event) => {
    if (event.dataTransfer.types.includes('sprite')) {
      this._onDropSprite(event);
    }
    if (event.dataTransfer.types.includes('handle')) {
      this._onUpdateHandle(event);
    }
  }

  _onUpdateHandle = (event) => {
    const side = event.dataTransfer.types.find(t => t.startsWith('handle:')).split(':').pop();
    const stageOffset = this._el.getBoundingClientRect();
    const position = {
      x: (event.clientX - stageOffset.left) / STAGE_CELL_SIZE,
      y: (event.clientY - stageOffset.top) / STAGE_CELL_SIZE,
    };

    // expand the extent of the recording rule to reflect this new extent
    const {recording, actors, dispatch} = this.props;
    const root = actors[recording.actorId].position;

    const extent = getScenarioExtent(recording.scenario);
    const nextExtent = objectAssign({}, extent);
    if (side === 'left') { nextExtent.xmin = Math.min(0, Math.round(position.x - root.x + 0.5)); }
    if (side === 'right') { nextExtent.xmax = Math.max(0, Math.round(position.x - root.x - 1)); }
    if (side === 'top') { nextExtent.ymin = Math.min(0, Math.round(position.y - root.y + 0.5)); }
    if (side === 'bottom') { nextExtent.ymax = Math.max(0, Math.round(position.y - root.y - 1)); }

    if (JSON.stringify(extent) === JSON.stringify(nextExtent)) {
      return;
    }

    const nextScenario = [];
    for (let x = nextExtent.xmin; x <= nextExtent.xmax; x ++) {
      for (let y = nextExtent.ymin; y <= nextExtent.ymax; y ++) {
        const coord = `${x},${y}`;
        let block = recording.scenario.find(b => b.coord === coord);
        if (!block) {
          block = {
            coord,
            refs: Object.values(actors).filter(a =>
              a.position.x === x + root.x && a.position.y === y + root.y
            ).map(a => a.id),
          };
        }
        nextScenario.push(block);
      }
    }
    dispatch(updateRecordingState({scenario: nextScenario}));
  }

  _onDropSprite = (event) => {
    const {actorId, characterId, dragLeft, dragTop} = JSON.parse(event.dataTransfer.getData('sprite'));
    const stageOffset = this._el.getBoundingClientRect();

    const position = {
      x: Math.round((event.clientX - dragLeft - stageOffset.left) / STAGE_CELL_SIZE),
      y: Math.round((event.clientY - dragTop - stageOffset.top) / STAGE_CELL_SIZE),
    };

    if (actorId) {
      if (event.altKey) {
        const actor = this.props.actors[actorId];
        const clonedActor = objectAssign({}, actor, {position});
        const character = this.props.characters[actor.characterId];
        this.props.dispatch(createActor(character, clonedActor));
      } else {
        this.props.dispatch(changeActor(actorId, {position}));
      }
    } else if (characterId) {
      const character = this.props.characters[characterId];
      this.props.dispatch(createActor(character, {position}));
    }
  }

  _onClickActor = (actor, event) => {
    const {selectedToolId, dispatch} = this.props;
    if (selectedToolId === TOOL_PAINT) {
      dispatch(paintCharacterAppearance(actor.characterId, actor.appearance));
    }
    if (selectedToolId === TOOL_TRASH) {
      dispatch(deleteActor(actor.id));
    }
    if (selectedToolId === TOOL_RECORD) {
      dispatch(updateRecordingState({
        characterId: actor.characterId,
        actorId: actor.id,
        ruleId: null,
        phase: 'setup',
        scenario: [{
          "coord": "0,0",
          "refs": [actor.id,]
        }],
      }));
    }
    if (selectedToolId !== TOOL_POINTER) {
      if (!event.shiftKey) {
        dispatch(selectToolId(TOOL_POINTER));
      }
    } else {
      dispatch(recordClickForGameState(actor.id));
    }
  }

  _onSelectActor = (actor) => {
    const {selectedToolId, dispatch} = this.props;
    if (selectedToolId === TOOL_POINTER) {
      dispatch(select(actor.characterId, actor.id));
    }
  }

  _renderActors() {
    const {actors, characters, selectedActorId} = this.props;

    return Object.keys(actors).map((id) => {
      const character = characters[actors[id].characterId];
      return (
        <ActorSprite
          key={id}
          draggable
          selected={selectedActorId === id}
          onClick={(event) => this._onClickActor(actors[id], event)}
          onDoubleClick={() => this._onSelectActor(actors[id])}
          character={character}
          actor={actors[id]}
        />
      );
    });
  }

  _renderRecordingElements() {
    const {width, height, recording, actors} = this.props;
    const {xmin, xmax, ymin, ymax} = getScenarioExtent(recording.scenario, {
      root: actors[recording.actorId].position,
    });

    const components = [];

    // add the dark squares
    for (let x = 0; x < width; x ++) {
      for (let y = 0; y < height; y ++) {
        if (x < xmin || x > xmax || y < ymin || y > ymax) {
          components.push(
            <RecordingMaskSprite key={`${x}-${y}`} position={{x, y}} />
          );
        }
      }
    }

    // add the handles
    const handles = {
      top: [xmin + (xmax - xmin) / 2.0, ymin - 1],
      bottom: [xmin + (xmax - xmin) / 2.0, ymax + 1],
      left: [xmin - 1, ymin + (ymax - ymin) / 2.0],
      right: [xmax + 1, ymin + (ymax - ymin) / 2.0],
    };
    for (const side of Object.keys(handles)) {
      const [x, y] = handles[side];
      components.push(
        <RecordingHandle key={side} side={side} position={{x, y}} />
      );
    }

    return components;
  }

  render() {
    const {selectedToolId, running, recording, width, height, style} = this.props;

    if (!width) {
      return (
        <div style={style} className="stage-scroll-container" />
      );
    }

    return (
      <div style={style} className="stage-scroll-container">
        <div
          ref={(el) => this._el = el}
          style={{width: width * STAGE_CELL_SIZE, height: height * STAGE_CELL_SIZE}}
          className={`stage tool-${selectedToolId} running-${running}`}
          onDragOver={this._onDragOver}
          onDrop={this._onDrop}
          onKeyDown={this._onKeyDown}
          onBlur={this._onBlur}
          tabIndex={0}
        >
          {this._renderActors()}
          {recording ? this._renderRecordingElements() : []}
        </div>
      </div>
    );
  }
}
