import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import objectAssign from 'object-assign';

import Sprite from './sprite';
import {createActor, changeActor} from '../actions/stage-actions';
import {select} from '../actions/ui-actions';

const STAGE_CELL_SIZE = 40;

class StageActor extends React.Component {
  static propTypes = {
    character: PropTypes.object,
    actor: PropTypes.object,
    selected: PropTypes.bool,
    onSelectCharacter: PropTypes.func,
  }

  _onDragStart = (event) => {
    const {top, left} = event.target.getBoundingClientRect();
    event.dataTransfer.effectAllowed = 'copyMove';
    event.dataTransfer.setData('sprite', JSON.stringify({
      actorId: this.props.actor.id,
      dragLeft: event.clientX - left,
      dragTop: event.clientY - top,
    }));
  }

  render() {
    const {actor, character, selected} = this.props;
    return (
      <div
        draggable
        onDragStart={this._onDragStart}
        onDoubleClick={this.props.onSelectCharacter}
        style={{
          position: 'absolute',
          left: actor.position.x * STAGE_CELL_SIZE,
          top: actor.position.y * STAGE_CELL_SIZE,
        }}
      >
        <Sprite
          className={selected ? 'outlined' : ''}
          appearance={actor.appearance}
          spritesheet={character.spritesheet}
        />
      </div>
    );
  }
}

class Stage extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,

    actors: PropTypes.object,
    selectedActorId: PropTypes.string,
    characters: PropTypes.object,
    width: PropTypes.number,
    wrapX: PropTypes.bool,
    wrapY: PropTypes.bool,
  };

  constructor(props, context) {
    super(props, context);
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

  render() {
    const {actors, characters, dispatch, selectedActorId} = this.props;
    return (
      <div className="stage" onDragOver={this._onDragOver} onDrop={this._onDrop}>
        {Object.keys(actors).map((id) => {
          const character = characters[actors[id].characterId];
          return (
            <StageActor
              key={id}
              selected={selectedActorId === id}
              onSelectCharacter={() => dispatch(select(actors[id].characterId, id))}
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
    characters: state.characters,
  });
}

export default connect(
  mapStateToProps,
)(Stage);
