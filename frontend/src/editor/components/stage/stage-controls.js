import React, {PropTypes} from 'react';
import classNames from 'classnames';

import {Button, ButtonGroup} from 'reactstrap';
import {updatePlaybackState} from '../../actions/ui-actions';
import {advanceGameState, saveInitialGameState, restoreInitialGameState} from '../../actions/stage-actions';
import {SPEED_OPTIONS} from '../../constants/constants';

function getStageScreenshot(stage) {
  const {characters} = window.editorStore.getState();
  const canvas = document.createElement('canvas');
  canvas.width = stage.width * 10;
  canvas.height = stage.height * 10;
  const context = canvas.getContext('2d');
  Object.values(stage.actors).forEach(actor => {
    const i = new Image();
    i.src = characters[actor.characterId].spritesheet.appearances[actor.appearance];
    context.drawImage(i, actor.position.x * 10, actor.position.y * 10, 10, 10);
  });
  return canvas.toDataURL();
}

export default class StageControls extends React.Component {
  static propTypes = {
    stage: PropTypes.object,
    dispatch: PropTypes.func,
    speed: PropTypes.number,
    running: PropTypes.bool,
  };

  constructor(props, context) {
    super(props, context);
    this._timerSpeed = null;
    this._timer = null;
  }

  componentDidMount() {
    this._ensureTimer();
  }

  componentWillReceiveProps(nextProps) {
    this._ensureTimer(nextProps);
  }

  _ensureTimer(props = this.props) {
    if (props.running && (!this._timer || this._timerSpeed !== props.speed)) {
      clearTimeout(this._timer);
      this._timerSpeed = props.speed;
      this._timer = setInterval(this._onTick, this._timerSpeed);
    } else if (!props.running && this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }

  _onTick = () => {
    this.props.dispatch(advanceGameState(this.props.stage.uid));
  }

  _onRestoreInitialGameState = () => {
    if (window.confirm("Are you sure you want to reset the stage to the saved `Start` state?")) {
      this.props.dispatch(restoreInitialGameState(this.props.stage.uid));
    }
  }

  _onSaveInitialGameState = () => {
    const {dispatch, stage} = this.props;
    dispatch(saveInitialGameState(stage.uid, {
      actors: stage.actors,
      thumbnail: getStageScreenshot(stage),
    }));
  }

  render() {
    const {speed, dispatch, running, stage: {startThumbnail, uid}} = this.props;

    return (
      <div className="stage-controls">
        <div className="left">
          <div className="start-thumbnail">
            <img src={startThumbnail} />
          </div>
          <Button
            size="sm"
            onClick={this._onRestoreInitialGameState}
          >
            <i className="fa fa-arrow-up" />
          </Button>
          <Button
            size="sm"
            onClick={this._onSaveInitialGameState}
          >
            <i className="fa fa-arrow-down" />
          </Button>
        </div>

        <div className="center">
          <Button
            size="sm"
          >
            <i className="fa fa-step-backward" /> Back
          </Button>{' '}
          <Button
            className={classNames({'selected': !running})}
            onClick={() => dispatch(updatePlaybackState({running: false}))}
          >
            <i className="fa fa-stop" /> Stop
          </Button>{' '}
          <Button
            className={classNames({'selected': running})}
            onClick={() => dispatch(updatePlaybackState({running: true}))}
          >
            <i className="fa fa-play" /> Run
          </Button>{' '}
          <Button
            size="sm"
            onClick={() => dispatch(advanceGameState(uid))}
          >
            <i className="fa fa-step-forward" /> Forward
          </Button>
        </div>

        <div className="right">
          <ButtonGroup>
            {Object.keys(SPEED_OPTIONS).map((name) =>
              <Button
                size="sm"
                key={name}
                style={{minWidth: 0}}
                className={classNames({'selected': SPEED_OPTIONS[name] === speed})}
                onClick={() => dispatch(updatePlaybackState({speed: SPEED_OPTIONS[name]}))}
              >
                {name}
              </Button>
            )}
          </ButtonGroup>
        </div>
      </div>
    );
  }
}