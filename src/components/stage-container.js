import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import Stage from './stage';
import StageControls from './stage-controls';
import StageRecordingControls from './stage-recording-controls';
import RecordingActions from './recording-actions';
import RecordingConditions from './recording-conditions';

import {RECORDING_PHASE_SETUP, RECORDING_PHASE_RECORD} from '../constants/constants';

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

    console.log(recording);
    
    if (recording.characterId) {
      controls = (
        <StageRecordingControls
          characters={characters}
          dispatch={dispatch}
          {...recording}
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
            stage={recording.beforeStage}
            recordingExtent={recording.extent}
            recordingCentered={true}
            style={{marginRight: 2}}
          />
        );
        stageB = (
          <Stage
            stage={recording.afterStage}
            recordingExtent={recording.extent}
            recordingCentered={true}
            style={{marginLeft: 2}}
          />
        );
        actions = (
          <div className="actions" style={{height: 200, display: 'flex'}}>
            <RecordingConditions
              characters={characters}
              conditions={recording.conditions}
              stage={recording.beforeStage}
              extent={recording.extent}
              dispatch={dispatch}
            />
            <RecordingActions {...recording} characters={characters} />
          </div>
        );
      }
    }

    return ( 
      <div className="panel stages">
        <div style={{display: 'flex'}}>
          {stageA || <Stage stage={stage} recording={null} />}
          {stageB || <Stage style={{flex: 0}} />}
        </div>
        {actions || <div className="actions" style={{height: 0}} />}
        {controls || <StageControls {...playback} dispatch={dispatch} stageUid={stage.uid} />}
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
