import React, {PropTypes} from 'react';
import classNames from 'classnames';
import {connect} from 'react-redux';

import {Button, ButtonGroup} from 'reactstrap';
import {updatePlaybackState} from '../actions/ui-actions';
import {SPEED_OPTIONS} from '../constants/constants';

class StageControls extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    speed: PropTypes.string,
    running: PropTypes.bool,
  };

  constructor(props, context) {
    super(props, context);
  }

  render() {
    const {speed, dispatch, running} = this.props;

    return (
      <div className="stage-controls">
        <div className="stage-initial-state-controls">
        </div>

        <div className="stage-playback-controls">
          <Button size="sm"><i className="fa fa-step-backward"></i>  Back</Button>{' '}
          <Button
            className={classNames({'selected': running === false})}
            onClick={() => dispatch(updatePlaybackState({running: false}))}
          >
            <i className="fa fa-stop"></i> Stop
          </Button>{' '}
          <Button
            className={classNames({'selected': running === true})}
            onClick={() => dispatch(updatePlaybackState({running: true}))}
          >
            <i className="fa fa-play"></i> Run
          </Button>{' '}
          <Button size="sm"><i className="fa fa-step-forward"></i> Forward</Button>
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
