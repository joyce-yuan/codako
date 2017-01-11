import React, {PropTypes} from 'react';
import classNames from 'classnames';

import {Button, ButtonGroup} from 'reactstrap';
import {updatePlaybackState} from '../../actions/ui-actions';
import {getStageScreenshot} from '../../utils/stage-helpers';
import {advanceGameState, stepBackGameState, saveInitialGameState, restoreInitialGameState} from '../../actions/stage-actions';
import {SPEED_OPTIONS} from '../../constants/constants';


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
    const {speed, dispatch, running, stage: {startThumbnail, uid, history}} = this.props;

    return (
      <div className="stage-controls">
        <div className="left">
          <div className="start-thumbnail">
            <img src={startThumbnail} />
          </div>
          <div className="start-buttons">
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
        </div>

        <div style={{flex: 1}} />

        <div className="center" data-tutorial-id="controls">
          <Button
            size="sm"
            disabled={history && history.length === 0}
            onClick={() => dispatch(stepBackGameState(uid))}
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
            data-tutorial-id="run"
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

        <div style={{flex: 1}} />

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