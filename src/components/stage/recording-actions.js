import React, {PropTypes} from 'react';
import Sprite from '../sprites/sprite';
import {actionsBetweenStages} from '../../utils/stage-helpers';

const DELTA_SQUARE_SIZE = 10;

class SquaresCanvas extends React.Component {
  static propTypes = {
    onDraw: PropTypes.func,
    width: PropTypes.number,
    height: PropTypes.number,
  };

  componentDidMount() {
    this.props.onDraw(this._el, this._el.getContext('2d'), this._el.width / this.props.width);
  }

  componentDidUpdate() {
    this.props.onDraw(this._el, this._el.getContext('2d'), this._el.width / this.props.width);
  }

  render() {
    const {width, height} = this.props;
    const scale = Math.min(DELTA_SQUARE_SIZE, 40.0 / height);
    return (
      <canvas
        ref={(el) => this._el = el}
        width={width * scale * window.devicePixelRatio}
        height={height * scale * window.devicePixelRatio}
        className="delta-canvas"
        style={{width: width * scale, height: height * scale}}
      />
    );
  }
}

class ActorPositionCanvas extends React.Component {
  static propTypes = {
    extent: PropTypes.object,
    position: PropTypes.object,
  }

  _draw = (el, c, squareSize) => {
    const {position, extent} = this.props;
    c.fillStyle = '#fff';
    c.fillRect(0, 0, el.width, el.height);
    c.fillStyle = '#f00';
    c.fillRect((position.x - extent.xmin) * squareSize, (position.y - extent.ymin) * squareSize, squareSize, squareSize);

    c.lineWidth = 1;
    c.strokeStyle = 'rgba(0,0,0,0.4)';
    c.strokeRect(0, 0, el.width, el.height);
  }

  render() {
    const {extent} = this.props;
    return (
      <SquaresCanvas
        width={(extent.xmax - extent.xmin + 1)}
        height={(extent.ymax - extent.ymin + 1)}
        onDraw={this._draw}
      />
    );
  }
}

class ActorDeltaCanvas extends React.Component {
  static propTypes = {
    delta: PropTypes.object,
  }

  _draw = (el, c, squareSize) => {
    const {x: dx, y: dy} = this.props.delta;
    let [sx, sy] = [0, 0];

    if (dx < 0) { sx = Math.abs(dx); }
    if (dy < 0) { sy = Math.abs(dy); }

    c.fillStyle = '#fff';
    c.fillRect(0, 0, el.width, el.height);
    c.fillStyle = '#ccc';
    c.fillRect(sx * squareSize, sy * squareSize, squareSize, squareSize);
    c.fillStyle = '#f00';
    c.fillRect((sx + dx) * squareSize, (sy + dy) * squareSize, squareSize, squareSize);

    c.lineWidth = 1;
    c.strokeStyle = 'rgba(0,0,0,0.4)';
    c.strokeRect(0, 0, el.width, el.height);
  }

  render() {
    const {x: dx, y: dy} = this.props.delta;
    const [width, height] = [(Math.abs(dx) + 1), (Math.abs(dy) + 1)];
    return (
      <SquaresCanvas width={width} height={height} onDraw={this._draw} />
    );
  }
}

export default class RecordingActions extends React.Component {
  static propTypes = {
    characters: PropTypes.object,
    beforeStage: PropTypes.object,
    afterStage: PropTypes.object,
    extent: PropTypes.object,
  };

  _renderAction = (a, idx) => {
    const {characters, beforeStage, afterStage, extent} = this.props;
    const actor = beforeStage.actors[a.actorId] || afterStage.actors[a.actorId];
    const character = characters[actor.characterId];

    const spriteComponent = (
      <code>
        <Sprite spritesheet={character.spritesheet} appearance={actor.appearance} />
        {character.name}
      </code>
    );

    if (a.type === 'move') {
      return (
        <li key={idx}>Move {spriteComponent} to <ActorDeltaCanvas delta={a.delta} /></li>
      );
    }
    if (a.type === 'create') {
      return (
        <li key={idx}>
          Create a {spriteComponent} at
          <ActorPositionCanvas position={actor.position} extent={extent} />
        </li>
      );
    }
    if (a.type === 'delete') {
      return (
        <li key={idx}>Remove {spriteComponent} from the stage</li>
      );
    }
    if (a.type === 'appearance') {
      return (
        <li key={idx}>
          Change appearance of {spriteComponent} to
          <code>
            <Sprite spritesheet={character.spritesheet} appearance={a.to} />
            {character.spritesheet.appearanceNames[a.to]}
          </code>
        </li>
      );
    }
    throw new Error(`Unknown action type: ${a.type}`);
  }

  render() {
    const actions = actionsBetweenStages(this.props);

    return (
      <div style={{flex: 1, marginLeft: 3}}>
        <h2>It should...</h2>
        <ul>
          {actions.map(this._renderAction)}
        </ul>
      </div>
    );
  }
}