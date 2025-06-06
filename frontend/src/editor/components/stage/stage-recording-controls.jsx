import PropTypes from "prop-types";
import React from "react";

import Button from "reactstrap/lib/Button";
import { cancelRecording, finishRecording, startRecording } from "../../actions/recording-actions";
import { RECORDING_PHASE } from "../../constants/constants";

export default class StageRecordingControls extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    recording: PropTypes.object,
    characters: PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);
  }

  _onCancel = () => {
    this.props.dispatch(cancelRecording());
  };

  _onNext = () => {
    const { dispatch, recording, characters } = this.props;

    if (recording.phase === RECORDING_PHASE.SETUP) {
      dispatch(startRecording());
    }
    if (recording.phase === RECORDING_PHASE.RECORD) {
      if (recording.actions.length === 0) {
        window.alert(
          "To create a rule, edit the right stage by changing appearances, moving actors, or modifying a variable.",
        );
        return;
      }
      dispatch(finishRecording());
    }
  };

  render() {
    const {
      characters,
      recording: { characterId, phase },
    } = this.props;

    const message = {
      [RECORDING_PHASE.SETUP]: `Set the stage! Select the area around the ${characters[characterId].name} you want to record in.`,
      [RECORDING_PHASE.RECORD]: "Act out what you want to happen in the picture on the right.",
    }[phase];

    const next = {
      [RECORDING_PHASE.SETUP]: (
        <span>
          <i className="fa fa-video-camera" /> Start Recording
        </span>
      ),
      [RECORDING_PHASE.RECORD]: (
        <span>
          <i className="fa fa-checkmark" /> Save Recording
        </span>
      ),
    }[phase];

    return (
      <div className="stage-controls">
        <div className="left message">{message}</div>
        <div style={{ flex: 1 }} />
        <div className="right">
          <Button onClick={this._onCancel}>Cancel</Button>{" "}
          <Button data-tutorial-id="record-next-step" color="success" onClick={this._onNext}>
            {next}
          </Button>{" "}
        </div>
      </div>
    );
  }
}
