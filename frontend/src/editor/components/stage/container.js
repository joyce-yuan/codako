import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import Stage from './stage';
import StageControls from './stage-controls';
import StageRecordingTools from './stage-recording-tools';
import StageRecordingControls from './stage-recording-controls';
import RecordingActions from './recording/panel-actions';
import RecordingConditions from './recording/panel-conditions';

import {RECORDING_PHASE_SETUP, RECORDING_PHASE_RECORD} from '../../constants/constants';


class StageContainer extends React.Component {
  static propTypes = {
    stage: PropTypes.object,
    characters: PropTypes.object,
    recording: PropTypes.object,
    playback: PropTypes.object,
    dispatch: PropTypes.func,
  };

  render() {
    const {stage, recording, playback, dispatch, characters} = this.props;

    let stageA = null;
    let stageB = null;
    let actions = null;
    let controls = null;

    if (recording.characterId) {
      controls = (
        <StageRecordingControls
          characters={characters}
          dispatch={dispatch}
          recording={recording}
        />
      );

      if (recording.phase === RECORDING_PHASE_SETUP) {
        stageA = (
          <Stage
            stage={recording.beforeStage}
            recordingExtent={recording.extent}
          />
        );
      } else if (recording.phase === RECORDING_PHASE_RECORD) {
        stageA = (
          <Stage
            style={{marginRight: 2}}
            stage={recording.beforeStage}
            recordingExtent={recording.extent}
            recordingCentered
          />
        );
        stageB = (
          <Stage
            style={{marginLeft: 2}}
            stage={recording.afterStage}
            recordingExtent={recording.extent}
            recordingCentered
          />
        );
        actions = (
          <div className="recording-specifics">
            <div style={{position: "absolute", transform:'translate(0, -100%)', paddingBottom: 5}}>
              <StageRecordingTools />
            </div>
            <RecordingConditions
              characters={characters}
              conditions={recording.conditions}
              stage={recording.beforeStage}
              extent={recording.extent}
              dispatch={dispatch}
            />
            <RecordingActions
              characters={characters}
              recording={recording}
              dispatch={dispatch}
            />
          </div>
        );
      }
    }

    return ( 
      <div className="panel stages">
        <div className="stages-horizontal-flex">
          {stageA || <Stage stage={stage} recording={null} />}
          {stageB || <Stage style={{flex: 0}} />}
        </div>
        {actions || <div className="recording-specifics" style={{height: 0}} />}
        {controls || <StageControls {...playback} dispatch={dispatch} stage={stage} />}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return Object.assign({}, {
    recording: state.recording,
    characters: state.characters,
    playback: state.ui.playback,
    stage: state.stage,
  });
}

export default connect(
  mapStateToProps,
)(StageContainer);
