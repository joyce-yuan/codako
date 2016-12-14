import React, {PropTypes} from 'react';
import Sprite from './sprite';

import {STAGE_CELL_SIZE} from '../constants/constants';

export default class ActorSprite extends React.Component {
  static propTypes = {
    character: PropTypes.object,
    actor: PropTypes.object,
    selected: PropTypes.bool,
    draggable: PropTypes.bool,
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
    const {actor, character, selected, draggable} = this.props;
    return (
      <div
        draggable={draggable}
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
