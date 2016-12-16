import React, {PropTypes} from 'react';

import {Button} from 'reactstrap';
import {cancelRecording, setRecordingPhase} from '../actions/recording-actions';
import {RECORDING_PHASE_SETUP, RECORDING_PHASE_RECORD} from '../constants/constants';

export default class StageRecordingControls extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    phase: PropTypes.string,
  };

  constructor(props, context) {
    super(props, context);
  }

  _onCancel = () => {
    this.props.dispatch(cancelRecording());
  }

  _onNext = () => {
    if (this.props.phase === RECORDING_PHASE_SETUP) {
      this.props.dispatch(setRecordingPhase(RECORDING_PHASE_RECORD));
    }
  }

  render() {
    const {phase} = this.props;

    const message = {
      [RECORDING_PHASE_SETUP]: "Set the stage! Select the area around the XXX you want to record in.",
      [RECORDING_PHASE_RECORD]: "Act out what you want to happen in the picture on the right.",
    }[phase];

    const next = {
      [RECORDING_PHASE_SETUP]: <span><i className="fa fa-video-camera" /> Start Recording</span>,
      [RECORDING_PHASE_RECORD]: <span><i className="fa fa-checkmark" /> Save Recording</span>
    }[phase];

    return (
      <div className="stage-controls">
        <div className="left message">
          {message}
        </div>
        <div className="right">
          <Button onClick={this._onCancel}>
            Cancel
          </Button>{' '}
          <Button color="success" onClick={this._onNext}>
            {next}
          </Button>{' '}
        </div>
      </div>
    );
  }
}