import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import objectAssign from 'object-assign';

import ActorSprite from './actor-sprite';
import {createActor, changeActor, deleteActor, recordClickForGameState, recordKeyForGameState} from '../actions/stage-actions';
import {select, paintCharacterAppearance, selectToolId} from '../actions/ui-actions';

import {STAGE_CELL_SIZE, TOOL_POINTER, TOOL_TRASH, TOOL_RECORD, TOOL_PAINT} from '../constants/constants';

class Stage extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,

    actors: PropTypes.object,
    running: PropTypes.bool,
    selectedToolId: PropTypes.string,
    selectedActorId: PropTypes.string,
    characters: PropTypes.object,
    width: PropTypes.number,
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
  }

  _onDrop = (event) => {
    const {actorId, characterId, dragLeft, dragTop} = JSON.parse(event.dataTransfer.getData('sprite'));
    const stageOffset = event.target.getBoundingClientRect();

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

  render() {
    const {actors, characters, selectedActorId, selectedToolId, running} = this.props;

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
        {Object.keys(actors).map((id) => {
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
        })}
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
