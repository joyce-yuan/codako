import React, {PropTypes} from 'react';
import classNames from 'classnames';
import {connect} from 'react-redux';

import {Button, ButtonGroup} from 'reactstrap';
import {updatePlaybackState} from '../actions/ui-actions';
import {advanceGameState} from '../actions/stage-actions';
import {SPEED_OPTIONS} from '../constants/constants';

class StageControls extends React.Component {
  static propTypes = {
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
    this.props.dispatch(advanceGameState());
  }

  render() {
    const {speed, dispatch, running} = this.props;

    return (
      <div className="stage-controls">
        <div className="stage-initial-state-controls">
        </div>

        <div className="stage-playback-controls">
          <Button
            size="sm"
          >
            <i className="fa fa-step-backward" /> Back
          </Button>{' '}
          <Button
            className={classNames({'selected': running === false})}
            onClick={() => dispatch(updatePlaybackState({running: false}))}
          >
            <i className="fa fa-stop" /> Stop
          </Button>{' '}
          <Button
            className={classNames({'selected': running === true})}
            onClick={() => dispatch(updatePlaybackState({running: true}))}
          >
            <i className="fa fa-play" /> Run
          </Button>{' '}
          <Button
            size="sm"
            onClick={() => dispatch(advanceGameState())}
          >
            <i className="fa fa-step-forward" /> Forward
          </Button>
        </div>

        <div className="stage-speed-controls">
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

function mapStateToProps(state) {
  return Object.assign({}, state.ui.playback);
}

export default connect(
  mapStateToProps,
)(StageControls);
