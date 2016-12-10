import React, {PropTypes} from 'react';
import {connect} from 'react-redux';

import Sprite from './sprite';

class LibraryActor extends React.Component {
  static propTypes = {
    actor: PropTypes.object,
  };

  _onDragStart = (event) => {
    const {top, left} = event.target.getBoundingClientRect();
    event.dataTransfer.dropEffect = 'copy';
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('sprite', JSON.stringify({
      definitionId: this.props.actor.id,
      dragLeft: event.clientX - left,
      dragTop: event.clientY - top,
    }));
  }

  render() {
    const {name, spritesheet} = this.props.actor;

    return (
      <div className="actor" draggable onDragStart={this._onDragStart}>
        <Sprite spritesheet={spritesheet} frame={0} />
        {name}
      </div>
    );
  }
}

class Library extends React.Component {
  static propTypes = {
    actors: PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);
  }

  render() {
    const {actors} = this.props;

    return (
      <div className="library">
        {Object.keys(actors).map(key => <LibraryActor key={key} actor={actors[key]} />)}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    actors: state.actors,
  };
}

export default connect(
  mapStateToProps,
)(Library);
