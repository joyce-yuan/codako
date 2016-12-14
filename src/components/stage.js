import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import objectAssign from 'object-assign';

import ActorSprite from './actor-sprite';
import {createActor, changeActor} from '../actions/stage-actions';
import {select} from '../actions/ui-actions';

import {STAGE_CELL_SIZE} from '../constants/constants';

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
            <ActorSprite
              key={id}
              draggable
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
