import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import objectAssign from 'object-assign';

import ActorSprite from './actor-sprite';
import {createActor, changeActor, deleteActor, recordClickForGameState, recordKeyForGameState} from '../actions/stage-actions';
import {select, paintCharacterAppearance, selectToolId} from '../actions/ui-actions';

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

class Stage extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,

    actors: PropTypes.object,
    running: PropTypes.bool,
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
      x: Math.round((event.clientX - stageOffset.left) / STAGE_CELL_SIZE),
      y: Math.round((event.clientY - stageOffset.top) / STAGE_CELL_SIZE),
    };
    console.log(event.clientX, side, position);
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
    const {width, height} = this.props;
    const {top, left, bottom, right} = {top: 3, left: 3, bottom: 8, right: 5};
    const components = [];

    // add the dark squares
    for (let x = 0; x < width; x ++) {
      for (let y = 0; y < height; y ++) {
        if (x < left || x > right || y < top || y > bottom) {
          components.push(
            <RecordingMaskSprite key={`${x}-${y}`} position={{x, y}} />
          );
        }
      }
    }

    // add the handles
    const handles = {
      top: [left + (right - left) / 2.0, top - 1],
      bottom: [left + (right - left) / 2.0, bottom + 1],
      left: [left - 1, top + (bottom - top) / 2.0],
      right: [right + 1, top + (bottom - top) / 2.0],
    };
    for (const side of Object.keys(handles)) {
      const [x, y] = handles[side];
      components.push(
        <RecordingHandle side={side} position={{x, y}} />
      );
    }

    return components;
  }

  render() {
    const {selectedToolId, running} = this.props;

    return (
      <div
        ref={(el) => this._el = el}
        className={`stage tool-${selectedToolId} running-${running}`}
        onDragOver={this._onDragOver}
        onDrop={this._onDrop}
        onKeyDown={this._onKeyDown}
        onBlur={this._onBlur}
        tabIndex={0}
      >
        {this._renderActors()}
        {this._renderRecordingElements()}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return Object.assign({}, state.stage, {
    selectedActorId: state.ui.selectedActorId,
    selectedToolId: state.ui.selectedToolId,
    running: state.ui.playback.running,
    characters: state.characters,
  });
}

export default connect(
  mapStateToProps,
)(Stage);
