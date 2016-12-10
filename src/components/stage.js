import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import objectAssign from 'object-assign';

import Sprite from './sprite';
import * as actions from '../actions/stage-actions';

const STAGE_CELL_SIZE = 40;

class StageSprite extends React.Component {
  static propTypes = {
    actors: PropTypes.object,
    descriptor: PropTypes.object,
  }

  _onDragStart = (event) => {
    const {top, left} = event.target.getBoundingClientRect();
    event.dataTransfer.effectAllowed = 'copyMove';
    event.dataTransfer.setData('sprite', JSON.stringify({
      descriptorId: this.props.descriptor.id,
      dragLeft: event.clientX - left,
      dragTop: event.clientY - top,
    }));
  }

  render() {
    const {descriptor, actors} = this.props;
    const definition = actors[descriptor.definitionId];

    return (
      <div
        draggable
        onDragStart={this._onDragStart}
        style={{
          position: 'absolute',
          left: descriptor.position.x * STAGE_CELL_SIZE,
          top: descriptor.position.y * STAGE_CELL_SIZE,
        }}
      >
        <Sprite
          appearance={descriptor.appearance}
          spritesheet={definition.spritesheet}
        />
      </div>
    );
  }
}

class Stage extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,

    actors: PropTypes.object,
    actorDescriptors: PropTypes.object,
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
    const {descriptorId, definitionId, dragLeft, dragTop} = JSON.parse(event.dataTransfer.getData('sprite'));
    const stageOffset = event.target.getBoundingClientRect();

    const position = {
      x: Math.round((event.clientX - dragLeft - stageOffset.left) / STAGE_CELL_SIZE),
      y: Math.round((event.clientY - dragTop - stageOffset.top) / STAGE_CELL_SIZE),
    };

    if (descriptorId) {
      if (event.altKey) {
        const descriptor = this.props.actorDescriptors[descriptorId];
        const definition = this.props.actors[descriptor.definitionId];
        const newDescriptor = objectAssign({}, descriptor, {position});
        this.props.dispatch(actions.createActorDescriptor(definition, newDescriptor));
      } else {
        this.props.dispatch(actions.changeActorDescriptor(descriptorId, {position}));
      }
    } else if (definitionId) {
      const definition = this.props.actors[definitionId];
      this.props.dispatch(actions.createActorDescriptor(definition, {position}));
    }
  }

  render() {
    const {actors, actorDescriptors} = this.props;
    return (
      <div className="stage" onDragOver={this._onDragOver} onDrop={this._onDrop}>
        {Object.keys(actorDescriptors).map((id) =>
          <StageSprite key={id} actors={actors} descriptor={actorDescriptors[id]} /> )
        }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return Object.assign({}, state.stage, {actors: state.actors});
}

export default connect(
  mapStateToProps,
)(Stage);
