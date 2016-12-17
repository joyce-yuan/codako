import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import objectAssign from 'object-assign';

import ActorSprite from './sprites/actor-sprite';
import RecordingMaskSprite from './sprites/recording-mask-sprite';
import RecordingHandle from './sprites/recording-handle';

import {createActor, changeActor, deleteActor, recordClickForGameState, recordKeyForGameState} from '../actions/stage-actions';
import {select, selectToolId, paintCharacterAppearance} from '../actions/ui-actions';
import {setRecordingExtent, startRecording} from '../actions/recording-actions';

import {STAGE_CELL_SIZE, TOOL_POINTER, TOOL_TRASH, TOOL_RECORD, TOOL_PAINT} from '../constants/constants';
import {pointIsOutside} from './game-state-helpers';

class Stage extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    style: PropTypes.object,
    running: PropTypes.bool,
    recordingCentered: PropTypes.bool,
    recordingExtent: PropTypes.shape({
      xmin: PropTypes.number,
      xmax: PropTypes.number,
      ymin: PropTypes.number,
      ymax: PropTypes.number,
    }),
    selectedToolId: PropTypes.string,
    selectedActorId: PropTypes.string,
    characters: PropTypes.object,
    stage: PropTypes.shape({
      uid: PropTypes.string,
      actors: PropTypes.object,
      width: PropTypes.number,
      height: PropTypes.number,
      wrapX: PropTypes.bool,
      wrapY: PropTypes.bool,
    }),
  };

  constructor(props, context) {
    super(props, context);
    this._lastFiredExtent = null;
    this.state = {
      top: 0,
      left: 0,
    };
  }

  componentDidUpdate() {
    if (this.props.running) {
      this._el.focus();
    }

    let offset = {top: 0, left: 0};
    if (this.props.recordingExtent && this.props.recordingCentered) {
      offset = this._centerOnExtent();
    }

    if ((this.state.top !== offset.top) || (this.state.left !== offset.left)) {
      this.setState(offset);
    }
  }

  _centerOnExtent() {
    const {xmin, ymin, xmax, ymax} = this.props.recordingExtent;
    const xCenter = (xmin + 0.5 + (xmax - xmin) / 2.0);
    const yCenter = (ymin + 0.5 + (ymax - ymin) / 2.0);
    return {
      left: `calc(-${xCenter * STAGE_CELL_SIZE}px + 50%)`,
      top: `calc(-${yCenter * STAGE_CELL_SIZE}px + 50%)`,
    };
  }

  _onBlur = () => {
    if (this.props.running) {
      this._el.focus();
    }
  }

  _onKeyDown = (event) => {
    const {dispatch, selectedActorId, stage} = this.props;

    if (event.keyCode === 127 || event.keyCode === 8) {
      if (selectedActorId) {
        dispatch(deleteActor(stage.uid, selectedActorId));
      }
      return;
    }
    dispatch(recordKeyForGameState(stage.uid, event.keyCode));
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
    if (event.dataTransfer.types.includes('appearance')) {
      this._onDropAppearance(event);
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
    const nextExtent = objectAssign({}, this.props.recordingExtent);
    if (side === 'left') { nextExtent.xmin = Math.min(nextExtent.xmax, Math.max(0, Math.round(position.x + 0.25))); }
    if (side === 'right') { nextExtent.xmax = Math.max(nextExtent.xmin, Math.min(this.props.stage.width, Math.round(position.x - 1))); }
    if (side === 'top') { nextExtent.ymin = Math.min(nextExtent.ymax, Math.max(0, Math.round(position.y + 0.25))); }
    if (side === 'bottom') { nextExtent.ymax = Math.max(nextExtent.ymin, Math.min(this.props.stage.height, Math.round(position.y - 1))); }

    const str = JSON.stringify(nextExtent);
    if (this._lastFiredExtent === str) {
      return;
    }
    this._lastFiredExtent = str;
    this.props.dispatch(setRecordingExtent(nextExtent));
  }

  _getDropPositionForEvent(event) {
    const {dragLeft, dragTop} = JSON.parse(event.dataTransfer.getData('drag-offset'));
    const stageOffset = this._el.getBoundingClientRect();
    return {
      x: Math.round((event.clientX - dragLeft - stageOffset.left) / STAGE_CELL_SIZE),
      y: Math.round((event.clientY - dragTop - stageOffset.top) / STAGE_CELL_SIZE),
    };
  }

  _onDropAppearance = (event) => {
    const {stage, dispatch, recordingExtent} = this.props;
    const {appearance, characterId} = JSON.parse(event.dataTransfer.getData('appearance'));
    const position = this._getDropPositionForEvent(event);
    if (recordingExtent && pointIsOutside(position, recordingExtent)) {
      return;
    }
    const actor = Object.values(stage.actors).find(a => 
      a.position.x === position.x && a.position.y === position.y && a.characterId === characterId
    );
    if (actor) {
      dispatch(changeActor(stage.uid, actor.id, {appearance}));
    }
  }

  _onDropSprite = (event) => {
    const {stage, stage: {actors}, characters, dispatch, recordingExtent} = this.props;
    const {actorId, characterId} = JSON.parse(event.dataTransfer.getData('sprite'));
    const position = this._getDropPositionForEvent(event);

    if (recordingExtent && pointIsOutside(position, recordingExtent)) {
      return;
    }

    if (actorId) {
      if (event.altKey) {
        const actor = actors[actorId];
        const clonedActor = objectAssign({}, actor, {position});
        const character = characters[actor.characterId];
        dispatch(createActor(stage.uid, character, clonedActor));
      } else {
        dispatch(changeActor(stage.uid, actorId, {position}));
      }
    } else if (characterId) {
      const character = characters[characterId];
      dispatch(createActor(stage.uid, character, {position}));
    }
  }

  _onClickActor = (actor, event) => {
    const {selectedToolId, dispatch, stage} = this.props;
    if (selectedToolId === TOOL_PAINT) {
      dispatch(paintCharacterAppearance(actor.characterId, actor.appearance));
    }
    if (selectedToolId === TOOL_TRASH) {
      dispatch(deleteActor(stage.uid, actor.id));
    }
    if (selectedToolId === TOOL_RECORD) {
      dispatch(startRecording({
        characterId: actor.characterId,
        actor: actor,
        ruleId: null,
      }));
    }
    if (selectedToolId !== TOOL_POINTER) {
      if (!event.shiftKey) {
        dispatch(selectToolId(TOOL_POINTER));
      }
    } else {
      dispatch(recordClickForGameState(stage.uid, actor.id));
    }
  }

  _onSelectActor = (actor) => {
    const {selectedToolId, dispatch} = this.props;
    if (selectedToolId === TOOL_POINTER) {
      dispatch(select(actor.characterId, actor.id));
    }
  }

  _renderActors() {
    const {stage: {actors}, characters, selectedActorId} = this.props;

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

  _renderRecordingExtent() {
    const {stage: {width, height}, recordingExtent} = this.props;
    const {xmin, xmax, ymin, ymax} = recordingExtent;

    const components = [];

    // add the dark squares
    for (let x = 0; x < width; x ++) {
      for (let y = 0; y < height; y ++) {
        if (pointIsOutside({x, y}, recordingExtent)) {
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
    const {selectedToolId, running, recordingExtent, style, stage} = this.props;

    if (!stage) {
      return (
        <div
          style={style}
          ref={(el) => this._scrollEl = el}
          className="stage-scroll-wrap"
        />
      );
    }

    return (
      <div
        style={style}
        ref={(el) => this._scrollEl = el}
        className="stage-scroll-wrap"
      >
        <div
          ref={(el) => this._el = el}
          style={{
            top: this.state.top,
            left: this.state.left,
            width: stage.width * STAGE_CELL_SIZE,
            height: stage.height * STAGE_CELL_SIZE,
            overflow: 'hidden',
          }}
          className={`stage tool-${selectedToolId} running-${running}`}
          onDragOver={this._onDragOver}
          onDrop={this._onDrop}
          onKeyDown={this._onKeyDown}
          onBlur={this._onBlur}
          tabIndex={0}
        >
          {this._renderActors()}
          {recordingExtent ? this._renderRecordingExtent() : []}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return Object.assign({}, {
    selectedActorId: state.ui.selectedActorId,
    selectedToolId: state.ui.selectedToolId,
    running: state.ui.playback.running,
    characters: state.characters,
  });
}

export default connect(
  mapStateToProps,
)(Stage);
