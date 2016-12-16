import React, {PropTypes} from 'react';

import {Button} from 'reactstrap';
import {updateRecordingState} from '../actions/ui-actions';

export default class StageRecordingControls extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    phase: PropTypes.string,
  };

  constructor(props, context) {
    super(props, context);
  }

  _onCancel = () => {
    this.props.dispatch(updateRecordingState({characterId: null}));
  }

  _onNext = () => {
    if (this.props.phase === 'setup') {
      this.props.dispatch(updateRecordingState({phase: 'record'}));
    }
  }

  render() {
    const {phase} = this.props;

    const message = {
      'setup': "Set the stage! Select the area around the XXX you want to record in.",
      'record': "Act out what you want to happen in the picture on the right.",
    }[phase];

    const next = {
      'setup': <span><i className="fa fa-video-camera" /> Start Recording</span>,
      'record': <span><i className="fa fa-checkmark" /> Save Recording</span>
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