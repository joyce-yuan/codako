import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import objectAssign from 'object-assign';

import Sprite from './sprite';
import * as actions from '../actions/stage-actions';

const STAGE_CELL_SIZE = 40;

class StageActor extends React.Component {
  static propTypes = {
    characters: PropTypes.object,
    actor: PropTypes.object,
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
    const {actor, characters} = this.props;
    const character = characters[actor.characterId];

    return (
      <div
        draggable
        onDragStart={this._onDragStart}
        style={{
          position: 'absolute',
          left: actor.position.x * STAGE_CELL_SIZE,
          top: actor.position.y * STAGE_CELL_SIZE,
        }}
      >
        <Sprite
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
        this.props.dispatch(actions.createActor(character, clonedActor));
      } else {
        this.props.dispatch(actions.changeActor(actorId, {position}));
      }
    } else if (characterId) {
      const character = this.props.characters[characterId];
      this.props.dispatch(actions.createActor(character, {position}));
    }
  }

  render() {
    const {actors, characters} = this.props;
    return (
      <div className="stage" onDragOver={this._onDragOver} onDrop={this._onDrop}>
        {Object.keys(actors).map((id) =>
          <StageActor key={id} characters={characters} actor={actors[id]} /> )
        }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return Object.assign({}, state.stage, {characters: state.characters});
}

export default connect(
  mapStateToProps,
)(Stage);
